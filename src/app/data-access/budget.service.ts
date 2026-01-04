import { computed, inject, Injectable, resource, ResourceStreamItem, signal } from '@angular/core';
import { BudgetEntry, BudgetReport, Category, CategoryBudget, Group } from '@models';
import { EntryService } from './entry.service';
import { CategoryBudgetService } from './category-budget.service';
import { CategoryGroupService } from './category-group.service';

const entryResourceReducer = (
  state: BudgetReport,
  action: string,
  payload: BudgetEntry
) => {
  if ( action === 'create' ) {
    return { ...state, entries: [ ...state.entries, payload ] };
  } else if ( action === 'update' ) {
    return {
      ...state,
      entries: state.entries.map((entry) => {
        if (entry.id === payload.id) {
          return payload;
        }
        return entry;
      })
    }
  } else if ( action === 'delete' ) {
    return {
      ...state,
      entries: state.entries.filter((entry) => entry.id !== payload.id)
    }
  }
  return state;
};

const categoryBudgetReducer = (
  state: BudgetReport,
  action: string,
  payload: CategoryBudget
) => {
  if ( action === 'create' ) {
    return { ...state, categoryBudgets: [ ...state.categoryBudgets, payload ] };
  } else if ( action === 'update' ) {
    return {
      ...state,
      categoryBudgets: state.categoryBudgets.map((budget) => {
        if (budget.id === payload.id) {
          return payload;
        }
        return budget;
      })
    }
  } else if ( action === 'delete' ) {
    return {
      ...state,
      categoryBudgets: state.categoryBudgets.filter((budget) => budget.id !== payload.id)
    }
  }
  return state;
};

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  #entryService = inject(EntryService);
  #categoryBudgetService = inject(CategoryBudgetService);
  #categoryGroupService = inject(CategoryGroupService);
  #year = signal(new Date().getFullYear());
  #month = signal(new Date().getMonth() + 1);

  #staticDataResource = resource({
    loader: async ({ abortSignal }) => {
      const [groups, categories] = await Promise.all([
        this.#categoryGroupService.getAllGroups({ signal: abortSignal }),
        this.#categoryGroupService.getAllCategories({ signal: abortSignal })
      ]);
      return { groups, categories };
    }
  });

  reportResource = resource({
    params: () => ({ year: this.#year(), month: this.#month() }),
    stream: async ({ params, abortSignal }) => {
      const { year, month } = params;
      const result = signal<ResourceStreamItem<BudgetReport>>({ value: { entries: [], categoryBudgets: [] } });

      try {
        const entries = await this.#entryService.getAll({ year, month }, { signal: abortSignal });
        const categoryBudgets = await this.#categoryBudgetService.getAll({ year, month }, { signal: abortSignal });
        result.set({ value: { entries, categoryBudgets } });
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

      const budgetCallback = ({ action, record }: { action: string, record: CategoryBudget }) => {
        result.update((resourceValue) => {
          if ('error' in resourceValue) return resourceValue;
          return { value: categoryBudgetReducer(resourceValue.value, action, record) };
        });
      };

      let unsubscribeEntryFn: null | (() => void) = null;
      let unsubscribeCategoryBudgetFn: null | (() => void) = null;
      const unsubscribe = () => {
        if (unsubscribeEntryFn !== null)  {
          unsubscribeEntryFn();
        }
        if (unsubscribeCategoryBudgetFn !== null) {
          unsubscribeCategoryBudgetFn();
        }
      };

      try {
        unsubscribeEntryFn = await this.#entryService.subscribe({ year, month }, entryCallback);
        unsubscribeCategoryBudgetFn = await this.#categoryBudgetService.subscribe({ year, month }, budgetCallback);
      } catch (error) {
        unsubscribe();
        result.set({ error: error instanceof Error ? error : new Error(String(error)) }); 
        return result;
      }

      if (abortSignal.aborted) {
        unsubscribe();
      } else {
        abortSignal.addEventListener('abort', () => {
          unsubscribe();
        }, { once: true });
      }

      return result;
    }
  });

  entries = computed<BudgetEntry[]>(() => {
    if (!this.reportResource.hasValue()) {
      return [];
    }
    return this.reportResource.value().entries;
  });

  budgets = computed(() => {
    if (!this.reportResource.hasValue()) {
      return [];
    }
    return this.reportResource.value().categoryBudgets;
  });

  groups = computed<Group[]>(() => {
    return this.#staticDataResource.value()?.groups ?? [];
  });

  categories = computed<Category[]>(() => {
    return this.#staticDataResource.value()?.categories ?? [];
  });
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
    // TODO: Math.round all the calculations
    // It breaks for input 74,9
    this.#entryService.add(
      { month: this.#month(), year: this.#year() },
      { category, amount: Math.round(amount * 100) }
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
    const budget = this.budgets().find(({ category }) => category === categoryId);
    if (budget) {
      this.#categoryBudgetService.update(budget.id, { amount: amount * 100 });
    } else {
      this.#categoryBudgetService.add(
        { month: this.#month(), year: this.#year() },
        { category: categoryId, amount: amount * 100 }
      );
    }
  }

  async batchSaveBudgets(budgets: { categoryId: Category['id'], amount: number }[]): Promise<void> {
    const createBudgets = budgets
      .filter((b) => this.budgets().find((eb) => eb.category === b.categoryId) === undefined)
      .filter((b) => b.amount !== 0)
      .map(({ categoryId, amount }) => ({ category: categoryId, amount: amount * 100 }));

    const updateBudgets = budgets.map((b) => {
      const existingBudget = this.budgets().find((eb) => eb.category === b.categoryId);
      if (existingBudget === undefined || existingBudget.amount === Math.round(b.amount * 100)) {
        return null;
      }
      return { id: existingBudget.id, category: b.categoryId, amount: b.amount * 100 }
    })
    .filter(b => b !== null);

    if (createBudgets.length === 0 && updateBudgets.length === 0) {
      return;
    }

    try {
      await this.#categoryBudgetService.batch(
        { month: this.#month(), year: this.#year() },
        createBudgets,
        updateBudgets
      );
    } catch (error) {
      // In the real world it would have been a toast
      console.error(error);
      alert('Save failed, see console :(');
    }
  }
}
