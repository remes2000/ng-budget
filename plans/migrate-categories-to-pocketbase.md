# Migrate Categories & Groups to PocketBase

## Overview
Move categories and groups from hardcoded mock data (`src/app/mock-data/categories.ts`) to PocketBase collections. Data will be fetched once on app initialization and cached in BudgetService signals for optimal performance.

## Requirements
- ✓ Admin-only management (no UI needed)
- ✓ Preserve existing category/group IDs for compatibility with existing entries
- ✓ Provide SQL seed script (not committed to git) for one-time manual execution
- ✓ Cache locally - fetch once on app load

---

## Implementation Steps

### 1. Create PocketBase Collections

**Create:** `pb/pb_migrations/[timestamp]_create_groups.js`

Define the `groups` collection schema:
- Fields: `id` (text, custom), `name` (text, required)
- Access: Admin-only (createRule/updateRule/deleteRule = null)
- List/View: Open (listRule/viewRule = '')

**Create:** `pb/pb_migrations/[timestamp]_create_categories.js`

Define the `categories` collection schema:
- Fields: `id` (text, custom), `name` (text), `type` (select: income/expense), `groupId` (text), `defaultBudget` (number, integer)
- Indexes: `groupId` and `type` for filtering performance
- Access: Admin-only for CUD, open for list/view

**Note:** Use PocketBase's collection builder API (check existing migrations for exact syntax). Ensure custom IDs are supported by setting `autogeneratePattern: ''` on the id field.

---

### 2. Create SQL Seed Script

**Create:** `pb/seed_categories_groups.sql`

Generate SQL INSERT statements for:
- 11 groups (preserve exact IDs from mock data)
- 47 categories (preserve exact IDs from mock data)

Use `INSERT OR IGNORE` for idempotency (safe to run multiple times).

**Execution:** User will manually run via PocketBase Admin UI (Settings > Import/Export > Run SQL) or SQLite CLI.

**Important:** This file is NOT committed to git (add to .gitignore if needed).

---

### 3. Update TypeScript Models

**File:** `src/app/models/index.ts`

**Changes:**
1. Add optional `createdAt?: string` and `updatedAt?: string` to both `Group` and `Category` interfaces
2. Extend `TypedPocketBase` interface to include new collections:
   ```typescript
   collection(idOrName: 'groups'): RecordService<Group>
   collection(idOrName: 'categories'): RecordService<Category>
   ```

---

### 4. Create Service for Fetching Categories/Groups

**Create:** `src/app/data-access/category-group.service.ts`

Follow the pattern from `EntryService`:
- Injectable with `providedIn: 'root'`
- Inject `PB` token
- Methods:
  - `getAllGroups({ signal }): Promise<Group[]>` - fetch all groups with AbortSignal support
  - `getAllCategories({ signal }): Promise<Category[]>` - fetch all categories with AbortSignal support
- Use `fetchWithSignal` wrapper for abort support
- Sort by `name` for consistent ordering

**No subscriptions needed** - data rarely changes (admin-only).

---

### 5. Refactor BudgetService

**File:** `src/app/data-access/budget.service.ts`

**Changes:**

1. Remove line 3: `import { CATEGORIES, GROUPS } from '../mock-data/categories';`
2. Add import: `import { CategoryGroupService } from './category-group.service';`
3. Inject service: `#categoryGroupService = inject(CategoryGroupService);`
4. Create a new resource to load categories/groups:
   ```typescript
   #staticDataResource = resource({
     loader: async ({ abortSignal }) => {
       const [groups, categories] = await Promise.all([
         this.#categoryGroupService.getAllGroups({ signal: abortSignal }),
         this.#categoryGroupService.getAllCategories({ signal: abortSignal })
       ]);
       return { groups, categories };
     }
   });
   ```
5. Replace lines 143-144 with computed signals that read from the resource:
   ```typescript
   groups = computed<Group[]>(() => {
     return this.#staticDataResource.value()?.groups ?? [];
   });

   categories = computed<Category[]>(() => {
     return this.#staticDataResource.value()?.categories ?? [];
   });
   ```

**Backward compatibility:** The public API remains unchanged - components still call `budgetService.categories()` and `budgetService.groups()`.

**Loading state:** Returns empty arrays during loading (safe fallback since loading is near-instant).

---

### 6. Optional: Add Loading State Handling

If you want to show a loading indicator while categories/groups fetch:

**File:** `src/app/app.ts` (or root component)

Check `budgetService.#staticDataResource.isLoading()` and display a spinner if needed.

**Alternative:** Since data is small (58 records), loading is ~100-200ms. Empty array fallback may be sufficient.

---

### 7. Cleanup

1. **Delete:** `src/app/mock-data/categories.ts`
2. **Verify:** No other files import from this file (should only be BudgetService, already updated)

---

## Critical Files to Modify

1. `src/app/models/index.ts` - Add createdAt/updatedAt, extend TypedPocketBase
2. `src/app/data-access/category-group.service.ts` - NEW service file
3. `src/app/data-access/budget.service.ts` - Replace static imports with resource-based loading
4. `pb/pb_migrations/[timestamp]_create_groups.js` - NEW migration
5. `pb/pb_migrations/[timestamp]_create_categories.js` - NEW migration
6. `pb/seed_categories_groups.sql` - NEW seed script (not committed)
7. `src/app/mock-data/categories.ts` - DELETE after testing

---

## Execution Order

1. Create and run PocketBase migrations (restart PocketBase server)
2. Execute SQL seed script manually in PocketBase Admin UI
3. Verify data in PocketBase admin (11 groups, 47 categories)
4. Update TypeScript code (models, service, BudgetService)
5. Test thoroughly:
   - Budget page displays all categories grouped correctly
   - Report page shows all groups/categories
   - Entries page category selection works
   - SelectCategory control lists all options
   - CategoryNamePipe resolves names
   - ComputationService calculations work
6. Delete mock data file only after all tests pass

---

## Rollback Plan

If issues arise:
1. Keep mock data file until fully tested
2. Temporarily revert BudgetService lines 143-144 to use static imports
3. Fix issues, re-test, then complete cleanup

---

## Performance Notes

- Initial load: ~100-200ms for 58 records (parallel fetch)
- Cached in memory for entire app lifetime
- No real-time subscriptions = no WebSocket overhead
- Memory usage: ~5-10KB (minimal)
