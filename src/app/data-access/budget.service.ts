import { computed, inject, Injectable, signal } from '@angular/core';
import { BudgetEntry, BudgetReport, Category, Group } from '@models';
import { CATEGORIES, GROUPS } from '../mock-data/categories';
import { ReactiveStorageService } from './reactive-storage.service';

const generateEmptyReport = (): BudgetReport => ({
  entries: [],
  categoryBudgets: CATEGORIES.map((category) => ({
    categoryId: category.id,
    amount: category.defaultBudget
  }))
});

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  #reactiveStorage = inject(ReactiveStorageService);
  #month = signal(new Date().getMonth() + 1);
  #year = signal(new Date().getFullYear());
  #storageKey = computed(() => `budget-${this.#month()}-${this.#year()}`);

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

  add(amount: number, category: string): BudgetEntry {
    const entry: BudgetEntry = {
      id: crypto.randomUUID(),
      amount: Math.round(amount * 100),
      category,
      createdAt: new Date().toISOString()
    };

    const updatedReport: BudgetReport = {
      ...this.report(),
      entries: [...this.entries(), entry]
    };

    this.#reactiveStorage.setItem(
      this.#storageKey(),
      JSON.stringify(updatedReport)
    );

    return entry;
  }

  update(id: string, category: Category['id'], amount: number, comment: string): void {
    const updatedReport: BudgetReport = {
      ...this.report(),
      entries: this.entries().map(entry =>
        entry.id === id
          ? { ...entry, category, amount: amount * 100, comment }
          : entry
      )
    };

    this.#reactiveStorage.setItem(
      this.#storageKey(),
      JSON.stringify(updatedReport)
    );
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

  delete(id: string): void {
    const updatedReport: BudgetReport = {
      ...this.report(),
      entries: this.entries().filter(entry => entry.id !== id)
    };

    this.#reactiveStorage.setItem(
      this.#storageKey(),
      JSON.stringify(updatedReport)
    );
  }
}
