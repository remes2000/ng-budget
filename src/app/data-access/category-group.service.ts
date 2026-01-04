import { inject, Injectable } from '@angular/core';
import { Category, Group } from '@models';
import { PB } from '../const';

type RequestOptions = { signal?: AbortSignal };

const fetchWithSignal = (signal?: AbortSignal) =>
  (input: RequestInfo | URL, init?: RequestInit) => fetch(input, { ...init, signal });

@Injectable({
  providedIn: 'root'
})
export class CategoryGroupService {
  #pb = inject(PB);

  getAllGroups({ signal }: RequestOptions = {}) {
    return this.#pb.collection('groups').getFullList<Group>({
      sort: 'name',
      fetch: fetchWithSignal(signal)
    });
  }

  getAllCategories({ signal }: RequestOptions = {}) {
    return this.#pb.collection('categories').getFullList<Category>({
      sort: 'name',
      fetch: fetchWithSignal(signal)
    });
  }
}
