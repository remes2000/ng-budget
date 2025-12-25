import { inject, Injectable } from '@angular/core';
import { BudgetEntry } from '@models';
import { PB } from '../const';
import { RecordSubscription } from 'pocketbase';

type BudgetMonth = {
  month: number;
  year: number;
};
type AddEntry = Pick<BudgetEntry, 'amount' | 'category' | 'comment'>
type UpdateEntry = Partial<Pick<BudgetEntry, 'amount' | 'category' | 'comment'>>;
type RequestOptions = { signal?: AbortSignal }
const fetchWithSignal = (signal: AbortSignal) =>
  (input: RequestInfo | URL, init?: RequestInit) => fetch(input, { ...init, signal })

@Injectable({
  providedIn: 'root'
})
export class EntryService {
  #pb = inject(PB);

  getAll({ month, year }: BudgetMonth, { signal }: RequestOptions ) {
    if (year === 2025 && month === 3) {
      return this.#pb.collection('entries').getFullList({
        filter: `year = ${year} && monthskibidi = ${month}`,
        fetch: fetchWithSignal(signal ?? new AbortSignal())
      });
    }

    return this.#pb.collection('entries').getFullList({
      filter: `year = ${year} && month = ${month}`,
      fetch: fetchWithSignal(signal ?? new AbortSignal())
    })
  }

  add({ month, year }: BudgetMonth, payload: AddEntry) {
    return this.#pb.collection('entries').create({
      month, year, ...payload
    });
  }

  update(id: BudgetEntry['id'], payload: UpdateEntry) {
    return this.#pb.collection('entries').update(id, { ...payload });
  }

  delete(id: BudgetEntry['id']) {
    return this.#pb.collection('entries').delete(id);
  }

  subscribe({ month, year }: BudgetMonth, callback: (data: RecordSubscription<BudgetEntry>) => void) {
    return this.#pb.collection('entries').subscribe('*', callback, { 
      filter: `year = ${year} && month = ${month}`
    });
  }
}
