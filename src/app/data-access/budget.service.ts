import { computed, inject, Injectable, resource, ResourceStreamItem, signal } from '@angular/core';
import { BudgetEntry, BudgetReport, Category, Group } from '@models';
import { CATEGORIES, GROUPS } from '../mock-data/categories';
import { ReactiveStorageService } from './reactive-storage.service';
import { EntryService } from './entry.service';

const generateEmptyReport = (): BudgetReport => ({
  entries: [],
  categoryBudgets: CATEGORIES.map((category) => ({
    categoryId: category.id,
    amount: category.defaultBudget
  }))
});

const entryResourceReducer = (
  state: BudgetEntry[],
  action: string,
  payload: BudgetEntry
) => {
  if ( action === 'create' ) {
    return [ ...state, payload ];
  } else if ( action === 'update' ) {
    return state.map((entry) => {
      if (entry.id === payload.id) {
        return payload;
      }
      return entry;
    });
  } else if ( action === 'delete' ) {
    return state.filter((entry) => entry.id !== payload.id);
  }
  return state;
};

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  #reactiveStorage = inject(ReactiveStorageService);
  #entryService = inject(EntryService);
  #month = signal(new Date().getMonth() + 1);
  #year = signal(new Date().getFullYear());
  #storageKey = computed(() => `budget-${this.#month()}-${this.#year()}`);

  entryResource = resource({
    params: () => ({ year: this.#year(), month: this.#month() }),
    stream: async ({ params, abortSignal }) => {
      const { year, month } = params;
      const result = signal<ResourceStreamItem<BudgetEntry[]>>({ value: [] });

      try {
        const allEntries = await this.#entryService.getAll({ year, month }, { signal: abortSignal });
        result.set({ value: allEntries });
      } catch (error) {
        result.set({ error: error instanceof Error ? error : new Error(String(error)) });
        return result;
      }

      const entryCallback = ({ action, record }: { action: string, record: BudgetEntry }) => {
        result.update((resourceValue) => {
          if ('error' in resourceValue) return resourceValue;
          return { value: entryResourceReducer(resourceValue.value, action, record) };
        });
      };

      let unsubscribeEntryFn = null;
      try {
        unsubscribeEntryFn = await this.#entryService.subscribe({ year, month }, entryCallback);
      } catch (error) {
        result.set({ error: error instanceof Error ? error : new Error(String(error)) }); 
        return result;
      }

      if (abortSignal.aborted) {
        unsubscribeEntryFn();
      } else {
        abortSignal.addEventListener('abort', () => {
          unsubscribeEntryFn();
        }, { once: true });
      }

      return result;
    }
  });

  #groups = signal<Group[]>(GROUPS);
  report = computed<BudgetReport>(() => {
    const storageSignal = this.#reactiveStorage.getItem(this.#storageKey());
    const data = storageSignal();
    return data ? JSON.parse(data) : generateEmptyReport();
  });
  entries = computed<BudgetEntry[]>(() => this.report().entries);

  budgets = computed(() => {
    return this.report().categoryBudgets;
  });
  categories = signal<Category[]>(CATEGORIES).asReadonly();
  groups = this.#groups.asReadonly();
  month = this.#month.asReadonly();
  year = this.#year.asReadonly();

  setMonth(month: number): void {
    this.#month.set(month);
  }

  setYear(year: number): void {
    this.#year.set(year);
  }

  add(amount: number, category: string) {
    // TODO: this is hanging promise
    this.#entryService.add(
      { month: this.#month(), year: this.#year() },
      { category, amount: amount * 100 }
    );
  }

  update(id: BudgetEntry['id'], category: Category['id'], amount: number, comment: string): void {
    // TODO: this is a hanging promise
    this.#entryService.update(id, { category, amount: amount * 100, comment });
  }

  delete(id: BudgetEntry['id']): void {
    // TODO: this is a hanging promise
    this.#entryService.delete(id);
  }

  updateBudgetForCategory(categoryId: string, amount: number): void {
    const currentBudgets = this.report().categoryBudgets;
    const existingBudgetIndex = currentBudgets.findIndex(
      budget => budget.categoryId === categoryId
    );

    const updatedBudgets = existingBudgetIndex >= 0
      ? currentBudgets.map(budget =>
          budget.categoryId === categoryId
            ? { ...budget, amount: amount * 100 }
            : budget
        )
      : [...currentBudgets, { categoryId, amount: amount * 100 }];

    const updatedReport: BudgetReport = {
      ...this.report(),
      categoryBudgets: updatedBudgets
    };

    this.#reactiveStorage.setItem(
      this.#storageKey(),
      JSON.stringify(updatedReport)
    );
  }
}
