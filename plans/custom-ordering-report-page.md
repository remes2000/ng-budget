# Custom Ordering for Groups and Categories on Report Page

## Overview
Add ability to order groups and categories on the /report page using a preferences table in PocketBase with JSON configuration.

## Architecture Design

### Database Schema
Create a new `preferences` table in PocketBase:
- **Table name**: `preferences`
- **Fields**:
  - `id` (auto-generated)
  - `config` (JSON field) - stores all app preferences
  - Standard PocketBase fields (created, updated)

**Config JSON Structure**:
```json
{
  "reportOrdering": {
    "groupOrder": ["group-id-1", "group-id-2", "group-id-3"],
    "categoryOrder": {
      "group-id-1": ["category-id-1", "category-id-2"],
      "group-id-2": ["category-id-3", "category-id-4"]
    }
  }
}
```

**Design Notes**:
- No `user_id` field needed (single-user app)
- Single row in preferences table
- `categoryOrder` is grouped by group ID for better organization
- Missing IDs fall back to alphabetical order
- Extensible for other preferences in the future

### Implementation Plan

#### 1. Update TypeScript Models
**File**: `src/app/models/index.ts`

Add new interfaces:
```typescript
export interface Preferences {
  id: string;
  config: PreferencesConfig;
  createdAt: string;
  updatedAt: string;
}

export interface PreferencesConfig {
  reportOrdering?: ReportOrdering;
}

export interface ReportOrdering {
  groupOrder?: string[];
  categoryOrder?: Record<string, string[]>;
}
```

Update `TypedPocketBase` schema to include the preferences collection.

#### 2. Create PreferencesService
**File**: `src/app/data-access/preferences.service.ts` (new file)

Service responsibilities:
- Fetch preferences from PocketBase (single responsibility)
- `providedIn: 'root'` for singleton pattern

**Note**: BudgetService will be responsible for exposing preferences via signals using Angular's `resource` API. This provides automatic loading and change notification.

Key implementation:
```typescript
import { RecordSubscription } from 'pocketbase';

type RequestOptions = { signal?: AbortSignal };

const fetchWithSignal = (signal?: AbortSignal) =>
  (input: RequestInfo | URL, init?: RequestInit) => fetch(input, { ...init, signal });

@Injectable({ providedIn: 'root' })
export class PreferencesService {
  #pb = inject(PB);

  getPreferences({ signal }: RequestOptions = {}) {
    return this.#pb.collection('preferences').getFirstListItem<Preferences>({
      fetch: fetchWithSignal(signal)
    });
  }

  subscribe(callback: (data: RecordSubscription<Preferences>) => void) {
    return this.#pb.collection('preferences').subscribe('*', callback);
  }
}
```

**Design notes**:
- Follows existing service patterns from `category-group.service.ts` and `entry.service.ts`
- `getPreferences()`: Fetches preferences with abort signal support
- `subscribe()`: Subscribes to preference changes, returns unsubscribe function
- No state management - purely data fetching
- BudgetService will consume these methods via `resource()` API

#### 3. Create Sorting Utilities
**File**: `src/app/data-access/sorting.util.ts` (new file)

Pure functions for sorting logic - keeps BudgetService clean and makes logic testable.

```typescript
export function sortGroupsByPreference(
  groups: Group[],
  preferences: Preferences | null
): Group[] {
  const preferredOrder = preferences?.config?.reportOrdering?.groupOrder;
  if (!preferredOrder) return groups;

  return sortItemsByPreference(groups, preferredOrder);
}

export function sortCategoriesByGroupPreference(
  categories: Category[],
  groupId: string,
  preferences: Preferences | null
): Category[] {
  const preferredOrder =
    preferences?.config?.reportOrdering?.categoryOrder?.[groupId];
  if (!preferredOrder) return categories;

  return sortItemsByPreference(categories, preferredOrder);
}

function sortItemsByPreference<T extends { id: string; name: string }>(
  items: T[],
  preferredIds: string[]
): T[] {
  // Items in preference list (preserves order)
  const preferredItems = preferredIds
    .map(id => items.find(item => item.id === id))
    .filter((item): item is T => item !== undefined);

  // Remaining items (alphabetical fallback)
  const remainingItems = items
    .filter(item => !preferredIds.includes(item.id))
    .sort((a, b) => a.name.localeCompare(b.name));

  return [...preferredItems, ...remainingItems];
}
```

**Graceful degradation:**
- New groups/categories appear at end alphabetically
- Deleted IDs in preferences are ignored
- Partial ordering works seamlessly

#### 4. Update BudgetService
**File**: `src/app/data-access/budget.service.ts`

Changes needed:
- Inject `PreferencesService`
- Create `preferences` resource using Angular's `resource()` API
- Add computed signals for sorted data using utility functions
- Keep existing data fetching logic unchanged

Add preferences resource and computed signals:
```typescript
#preferencesService = inject(PreferencesService);

// Create a streaming resource for preferences with real-time updates
preferencesResource = resource({
  stream: async ({ abortSignal }) => {
    const result = signal<ResourceStreamItem<Preferences | null>>({ value: null });

    // Fetch initial preferences
    try {
      const prefs = await this.#preferencesService.getPreferences({ signal: abortSignal });
      result.set({ value: prefs });
    } catch (error) {
      result.set({ error: error instanceof Error ? error : new Error(String(error)) });
      return result;
    }

    // Subscribe to preference changes
    const callback = ({ action, record }: { action: string, record: Preferences }) => {
      result.update((resourceValue) => {
        if ('error' in resourceValue) return resourceValue;
        // For preferences, any action (create/update/delete) replaces the entire value
        if (action === 'delete') {
          return { value: null };
        }
        return { value: record };
      });
    };

    let unsubscribeFn: null | (() => void) = null;

    try {
      unsubscribeFn = await this.#preferencesService.subscribe(callback);
    } catch (error) {
      result.set({ error: error instanceof Error ? error : new Error(String(error)) });
      return result;
    }

    // Cleanup subscription when resource is destroyed
    if (abortSignal.aborted) {
      unsubscribeFn();
    } else {
      abortSignal.addEventListener('abort', () => {
        unsubscribeFn?.();
      }, { once: true });
    }

    return result;
  }
});

preferences = computed(() => {
  if (!this.preferencesResource.hasValue()) {
    return [];
  }
  return this.preferencesResource.value();
});

sortedGroups = computed(() => {
  const groups = this.groups();
  const preferences = this.preferences();
  return sortGroupsByPreference(groups, preferences);
});

getSortedCategoriesFor(groupId: string): Category[] {
  const categories = this.categories();
  const preferences = this.preferences();
  return sortCategoriesByGroupPreference(
    categories.filter(c => c.groupId === groupId),
    groupId,
    preferences
  );
}
```

**Benefits:**
- Uses `stream` method like `reportResource` for real-time updates
- Automatically subscribes to PocketBase changes
- Properly handles cleanup with abort signals
- `preferencesResource.value()` is a signal - automatic reactivity
- Error handling built into the resource
- Computed signals automatically memoize results
- Only recomputes when dependencies change
- No manual subscription management in components

#### 5. Update Report Component
**File**: `src/app/pages/report/report.ts`

Changes:
- Use `budgetService.sortedGroups()` instead of `budgetService.groups()`
- No need to inject PreferencesService (BudgetService handles it via `resource()`)

```typescript
export class Report {
  #budgetService = inject(BudgetService);

  groups = this.#budgetService.sortedGroups;
}
```

**Simplified design**: The `resource()` in BudgetService automatically loads preferences, so Report component doesn't need to trigger loading explicitly.

#### 6. Update Group Component
**File**: `src/app/pages/report/components/group/group.ts`

Changes:
- Update `categories` computed to use `sortedCategoriesByGroup()` from BudgetService

```typescript
export class GroupComponent {
  group = input.required<Group>();
  #budgetService = inject(BudgetService);

  categories = computed(() =>
    this.#budgetService.getSortedCategoriesFor(this.group().id)
  );
}
```

**Note**: Must wrap in `computed()` to maintain reactivity. When `group()` changes, the computed re-evaluates and gets the sorted categories for the new group ID.

## Critical Files to Modify

1. **src/app/models/index.ts** - Add Preferences interfaces
2. **src/app/data-access/preferences.service.ts** - New service for fetching preferences (create)
3. **src/app/data-access/sorting.util.ts** - New utility file for pure sorting functions (create)
4. **src/app/data-access/budget.service.ts** - Add `preferences` resource and sorted computed signals
5. **src/app/pages/report/report.ts** - Use sorted groups from BudgetService
6. **src/app/pages/report/components/group/group.ts** - Use sorted categories

## Initial Setup (Manual)

1. Create `preferences` table in PocketBase admin UI:
   - Add JSON field named `config`

2. Insert initial row with ordering config:
```json
{
  "reportOrdering": {
    "groupOrder": ["group1", "group2", "group3"],
    "categoryOrder": {
      "group1": ["cat1", "cat2"],
      "group2": ["cat3", "cat4"]
    }
  }
}
```

3. Get actual group/category IDs from PocketBase and update config

## Edge Cases Handled

| Edge Case | Handling Strategy |
|-----------|------------------|
| Preferences not found (new install) | Return null, fallback to alphabetical order |
| Corrupted JSON in preferences | Try-catch with console error, use alphabetical fallback |
| Missing group/category IDs in preferences | Append at end in alphabetical order |
| Deleted items referenced in preferences | Silently filter out, no errors |
| Duplicate IDs in preference lists | `Array.find()` prevents duplicates in output |
| Database unavailable | PreferencesService returns null, graceful degradation |

## Benefits of This Design

- **Clear separation of concerns**:
  - PreferencesService: Pure data fetching and subscriptions (follows existing service patterns)
  - BudgetService: State management via `resource()` stream and computed signals
  - Sorting utilities: Pure, testable sorting logic
- **Modern Angular patterns**: Uses Angular's `resource()` API with `stream` method (same as `reportResource`)
- **Real-time updates**: Automatically receives changes from PocketBase via subscriptions
- **Flexible**: JSON config allows adding more preferences later without schema changes
- **Simple**: No UI changes needed initially, no manual loading/subscription in components
- **Maintainable**: Manual config via PocketBase admin UI
- **Performance**:
  - `resource()` stream provides automatic loading and real-time updates
  - Computed signals with automatic memoization
  - No manual cache or state management needed
  - Proper cleanup with abort signals
- **Graceful degradation**: Missing config falls back to alphabetical order
- **Type-safe**: Full TypeScript interfaces for preferences
- **Scalable**: Can add drag-drop UI for reordering later without breaking changes
- **Consistent**:
  - PreferencesService follows CategoryGroupService and EntryService patterns
  - Resource implementation follows reportResource pattern

## Alternative Considerations

**Why not add `order` field directly to groups/categories tables?**
- Couples ordering to data model
- Harder to manage complex ordering scenarios
- Less flexible for future preferences
- Requires migration for every new orderable entity

**Why JSON in preferences vs separate ordering table?**
- Simpler schema (single preferences row)
- Atomic updates
- Better for single-user app
- Easier to version/backup entire config
- Reduces database queries (single fetch)
