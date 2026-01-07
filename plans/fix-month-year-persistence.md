# Fix Month/Year Selection Persistence Using URL Query Parameters

## Problem
When selecting December 2025 and navigating to the Report page, then refreshing, the selection resets to January 2026 (current date). The month/year state exists only in memory and is lost on page refresh.

## Root Cause
`BudgetService` initializes month/year signals to `new Date()` on service creation (budget.service.ts:69-70). No persistence mechanism exists.

## Solution
Implement bidirectional synchronization between URL query parameters and `BudgetService` state using Angular Router and signals.

## Implementation Plan

### Step 1: Update BudgetService to Read from URL Query Parameters

**File:** `src/app/data-access/budget.service.ts`

**Add imports:**
```typescript
import { Router, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { effect, linkedSignal } from '@angular/core';
```

**Inject Router and ActivatedRoute** (after line 68):
```typescript
#router = inject(Router);
#activatedRoute = inject(ActivatedRoute);
```

**Create signal from query parameters:**
```typescript
#queryParams = toSignal(this.#activatedRoute.queryParams, { initialValue: {} });
```

**Add validation and parsing logic:**
```typescript
#parsedDateParams = computed(() => {
  const params = this.#queryParams();
  const monthStr = params['month'];
  const yearStr = params['year'];

  const month = monthStr ? parseInt(monthStr, 10) : null;
  const year = yearStr ? parseInt(yearStr, 10) : null;

  const isValidMonth = month !== null && !isNaN(month) && month >= 1 && month <= 12;
  const isValidYear = year !== null && !isNaN(year) && year >= 2020 && year <= 2050;

  // If either param is invalid, fallback to current date for both
  if (!isValidMonth || !isValidYear) {
    const now = new Date();
    return {
      month: now.getMonth() + 1,
      year: now.getFullYear()
    };
  }

  return { month, year };
});
```

**Replace existing signal declarations** (remove lines 69-70):
```typescript
// Remove these lines:
// #year = signal(new Date().getFullYear());
// #month = signal(new Date().getMonth() + 1);

// Replace with linkedSignals:
#year = linkedSignal(() => this.#parsedDateParams().year);
#month = linkedSignal(() => this.#parsedDateParams().month);
```

**Add constructor to update URL when month/year changes:**
```typescript
constructor() {
  effect(() => {
    const month = this.#month();
    const year = this.#year();

    this.#router.navigate([], {
      relativeTo: this.#activatedRoute,
      queryParams: { month, year },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  });
}
```

### Step 2: Verify setMonth() and setYear() Methods

**File:** `src/app/data-access/budget.service.ts`

**No changes needed** - The existing methods remain the same (lines 237-243):
```typescript
setMonth(month: number): void {
  this.#month.set(month);
}

setYear(year: number): void {
  this.#year.set(year);
}
```

These methods update the linkedSignals, which automatically triggers the effect in the constructor to update the URL.

## Implementation Order

1. Update BudgetService with linkedSignals and URL sync (Step 1)

## Critical Files

- `src/app/data-access/budget.service.ts` - Core service; add URL sync logic with linkedSignals
- `src/app/components/app-header/app-header.ts` - Reference for understanding call chain

## Key Benefits

- Single source of truth (BudgetService)
- Clean reactive architecture using `linkedSignal` for bidirectional sync
- No circular dependencies or complex untracked logic
- Shareable/bookmarkable URLs
- Automatic data refresh via existing `reportResource`
- Backward compatible (works with or without query params)
- Uses `replaceUrl: true` to avoid polluting browser history
- Minimal code changes (simplified from original approach)
