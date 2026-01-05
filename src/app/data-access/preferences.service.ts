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

  getPreferences({ signal }: RequestOptions = {}) {
    return this.#pb.collection('preferences').getFirstListItem<Preferences>('', {
      fetch: fetchWithSignal(signal)
    });
  }

  subscribe(callback: (data: RecordSubscription<Preferences>) => void) {
    return this.#pb.collection('preferences').subscribe('*', callback);
  }
}
