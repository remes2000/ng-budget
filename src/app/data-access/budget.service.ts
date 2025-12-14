import { Injectable, signal } from '@angular/core';
import { BudgetEntry, Category } from '@models';
import { CATEGORIES } from '../mock-data/categories';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  #entries = signal<BudgetEntry[]>([]);
  entries = this.#entries.asReadonly();

  categories = signal<Category[]>(CATEGORIES).asReadonly();

  add(amount: number, category: string): BudgetEntry {
    const entry: BudgetEntry = {
      id: crypto.randomUUID(),
      amount,
      category,
      date: new Date()
    };

    this.#entries.update(entries => [...entries, entry]);
    return entry;
  }
}
