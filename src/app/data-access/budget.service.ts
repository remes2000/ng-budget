import { computed, inject, Injectable, signal } from '@angular/core';
import { BudgetEntry, BudgetReport, Category } from '@models';
import { CATEGORIES } from '../mock-data/categories';
import { ReactiveStorageService } from './reactive-storage.service';

const generateEmptyReport = (): BudgetReport => ({
  entries: [],
  categoryBudgets: []
});

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  #reactiveStorage = inject(ReactiveStorageService);
  #month = signal(new Date().getMonth() + 1);
  #year = signal(new Date().getFullYear());
  #storageKey = computed(() => `budget-${this.#month()}-${this.#year()}`);

  #report = computed<BudgetReport>(() => {
    const storageSignal = this.#reactiveStorage.getItem(this.#storageKey());
    const data = storageSignal();
    return data ? JSON.parse(data) : generateEmptyReport();
  });
  #entries = computed<BudgetEntry[]>(() => this.#report().entries);

  entries = computed(() => this.#entries().map(entry => ({
    ...entry,
    amount: entry.amount / 100
  })));

  categories = signal<Category[]>(CATEGORIES).asReadonly();
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
      amount: amount * 100,
      category,
      createdAt: new Date().toISOString()
    };

    const updatedReport: BudgetReport = {
      ...this.#report(),
      entries: [...this.#entries(), entry]
    };

    this.#reactiveStorage.setItem(
      this.#storageKey(),
      JSON.stringify(updatedReport)
    );

    return entry;
  }

  update(id: string, category: Category['id'], amount: number): void {
    const updatedReport: BudgetReport = {
      ...this.#report(),
      entries: this.#entries().map(entry =>
        entry.id === id
          ? { ...entry, category, amount: amount * 100 }
          : entry
      )
    };

    this.#reactiveStorage.setItem(
      this.#storageKey(),
      JSON.stringify(updatedReport)
    );
  }
}
