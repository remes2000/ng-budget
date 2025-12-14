import { computed, Injectable, signal } from '@angular/core';
import { BudgetEntry, Category } from '@models';
import { CATEGORIES } from '../mock-data/categories';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  #entries = signal<BudgetEntry[]>([
    {
      id: crypto.randomUUID(),
      amount: 12550,
      category: 'zakup-spozywcze',
      date: new Date('2025-12-10')
    },
    {
      id: crypto.randomUUID(),
      amount: 4500,
      category: 'jedzenie-na-miescie',
      date: new Date('2025-12-12')
    }
  ]);
  entries = computed(() => this.#entries().map(entry => ({
    ...entry,
    amount: entry.amount / 100
  })));

  categories = signal<Category[]>(CATEGORIES).asReadonly();

  add(amount: number, category: string): BudgetEntry {
    const entry: BudgetEntry = {
      id: crypto.randomUUID(),
      amount: amount * 100,
      category,
      date: new Date()
    };

    this.#entries.update(entries => [...entries, entry]);
    return entry;
  }
}
