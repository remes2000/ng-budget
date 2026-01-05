import { inject, Injectable } from '@angular/core';
import { Preferences } from '@models';
import { PB } from '../const';
import { RecordSubscription } from 'pocketbase';

type RequestOptions = { signal?: AbortSignal };

const fetchWithSignal = (signal?: AbortSignal) =>
  (input: RequestInfo | URL, init?: RequestInit) => fetch(input, { ...init, signal });

@Injectable({ providedIn: 'root' })
export class PreferencesService {
  #pb = inject(PB);

  async getPreferences({ signal }: RequestOptions = {}): Promise<Preferences | null> {
    const result = await this.#pb.collection('preferences').getList<Preferences>(1, 1, {
      fetch: fetchWithSignal(signal)
    });
    return result.items[0] ?? null;
  }

  subscribe(callback: (data: RecordSubscription<Preferences>) => void) {
    return this.#pb.collection('preferences').subscribe('*', callback);
  }
}
