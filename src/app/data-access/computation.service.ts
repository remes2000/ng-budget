import { computed, inject, Injectable } from '@angular/core';
import { BudgetService } from './budget.service';
import { Category, CategoryBudget, Group } from '@models';

const makeIdSet = <K, T extends { id: K }>(items: Iterable<T>) => {
  const set = new Set<K>();
  for (const item of items) set.add(item.id);
  return set;
};

// TODO: Refactoring idea: A lot of signals iterate over entries array.
// There can be a lot of entries, we could calculate them all in one iteration.
@Injectable({
  providedIn: 'root'
})
export class ComputationService {
  #budgetService = inject(BudgetService);

  #expenseCategories = computed(() =>
    this.#budgetService.categories().filter(cat => cat.type === 'expense')
  );

  #expenseCategoryIds = computed(() => makeIdSet(this.#expenseCategories()));

  #incomeCategories = computed(() =>
    this.#budgetService.categories().filter(cat => cat.type === 'income')
  );

  #incomeCategoryIds = computed(() => makeIdSet(this.#incomeCategories()));

  #categoryBudgetMap = computed(() =>
    this.#budgetService.budgets()
      .reduce(
        (map, budget) => map.set(budget.category, budget), 
        new Map<Category['id'], CategoryBudget>()
      )
  );

  #categoryIdMap = computed(() =>
    this.#budgetService.categories()
      .reduce(
        (map, category) => map.set(category.id, category), 
        new Map<Category['id'], Category>()
      )
  );

  expectedSpending = computed(() => {
    let sum = 0;
    this.#expenseCategories().forEach((cat) => sum += this.categoryBudget(cat.id));
    return sum;
  })

  expectedEarning = computed(() => {
    let sum = 0;
    this.#incomeCategories().forEach((cat) => sum += this.categoryBudget(cat.id));
    return sum;
  });

  goal = computed(() => this.expectedEarning() - this.expectedSpending());

  totalSpent = computed(() => {
    let sum = 0;
    for (const entry of this.#budgetService.entries()) {
      const isExpense = this.#expenseCategoryIds().has(entry.category);
      sum += isExpense ? entry.amount : 0;
    }
    return sum;
  });

  totalEarned = computed(() => {
    let sum = 0;
    for (const entry of this.#budgetService.entries()) {
      const isIncome = this.#incomeCategoryIds().has(entry.category);
      sum += isIncome ? entry.amount : 0;
    }
    return sum;
  });

  reality = computed(() => this.totalEarned() - this.totalSpent());

  budgetUsage = computed(() => {
    const budgeted = this.expectedSpending();
    if (budgeted === 0) return 0;
    return (this.totalSpent() / budgeted) * 100;    
  });

  remainingToSpend = computed(() => this.expectedSpending() - this.totalSpent());

  categoryBudget(categoryId: Category['id']) {
    return this.#categoryBudgetMap().get(categoryId)?.amount ?? 0;
  }

  groupSpending(groupId: Group['id']) {
    let sum = 0;
    for (const entry of this.#budgetService.entries()) {
      const category = this.#categoryIdMap().get(entry.category);
      sum += category?.groupId === groupId ? entry.amount : 0;
    }
    return sum;
  }

  groupBudget(groupId: Group['id']) {
    let sum = 0;
    for (const category of this.#budgetService.categories()) {
      sum += category.groupId === groupId 
        ? this.#categoryBudgetMap().get(category.id)?.amount ?? 0
        : 0;
    }
    return sum;
  }

  sumEntriesForCategory(categoryId: Category['id']){
    let sum = 0;
    for (const entry of this.#budgetService.entries()) {
      sum += entry.category === categoryId ? entry.amount : 0;
    }
    return sum;
  }
}
