import { computed, inject, Injectable, signal } from '@angular/core';
import { BudgetEntry, Category } from '@models';
import { CATEGORIES } from '../mock-data/categories';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  #month = signal(new Date().getMonth() + 1);
  #year = signal(new Date().getFullYear());
  #storageKey = computed(() => `budget-${this.#month()}-${this.#year()}`);

  #entries = computed<BudgetEntry[]>(() => {
    const data = localStorage.getItem(this.#storageKey());
    return data ? JSON.parse(data) : [];
  });

  // #entries = signal<BudgetEntry[]>([
  //   {
  //     id: crypto.randomUUID(),
  //     amount: 12550,
  //     category: 'zakup-spozywcze',
  //     date: new Date('2025-12-10')
  //   },
  //   {
  //     id: crypto.randomUUID(),
  //     amount: 4500,
  //     category: 'jedzenie-na-miescie',
  //     date: new Date('2025-12-12')
  //   }
  // ]);
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

  // TODO: this methods can't access #entries signal directly
  add(amount: number, category: string): BudgetEntry {
    const entry: BudgetEntry = {
      id: crypto.randomUUID(),
      amount: amount * 100,
      category,
      date: new Date()
    };

    localStorage.setItem(
      this.#storageKey(),
      JSON.stringify([...this.#entries(), entry])
    );

    return entry;
  }

  update(id: string, category: Category['id'], amount: number): void {
    // this.#entries.update(entries => entries.map(entry =>
    //   entry.id === id
    //     ? { ...entry, category, amount: amount * 100 }
    //     : entry
    // ));
  }
}
