import { inject, Injectable } from '@angular/core';
import { CategoryBudget } from '@models';
import { PB } from '../const';
import { RecordSubscription } from 'pocketbase';

type BudgetMonth = {
  month: number;
  year: number;
};
type AddCategoryBudget = Pick<CategoryBudget, 'amount' | 'category'>;
type UpdateCategoryBudget = Partial<Pick<CategoryBudget, 'amount'>>;
type RequestOptions = { signal?: AbortSignal }
const fetchWithSignal = (signal: AbortSignal) =>
  (input: RequestInfo | URL, init?: RequestInit) => fetch(input, { ...init, signal })

@Injectable({
  providedIn: 'root'
})
export class CategoryBudgetService {
  #pb = inject(PB);

  getAll({ month, year }: BudgetMonth, { signal }: RequestOptions ) {
    return this.#pb.collection('category_budgets').getFullList({
      filter: `year = ${year} && month = ${month}`,
      fetch: fetchWithSignal(signal ?? new AbortSignal())
    })
  }

  add({ month, year }: BudgetMonth, payload: AddCategoryBudget) {
    return this.#pb.collection('category_budgets').create({
      month, year, ...payload
    });
  }

  update(id: CategoryBudget['id'], payload: UpdateCategoryBudget) {
    return this.#pb.collection('category_budgets').update(id, { ...payload });
  }

  delete(id: CategoryBudget['id']) {
    return this.#pb.collection('category_budgets').delete(id);
  }

  subscribe({ month, year }: BudgetMonth, callback: (data: RecordSubscription<CategoryBudget>) => void) {
    return this.#pb.collection('category_budgets').subscribe('*', callback, { 
      filter: `year = ${year} && month = ${month}`
    });
  }
}
