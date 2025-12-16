import { Injectable, Signal, signal, WritableSignal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReactiveStorageService {
  #storage = new Map<string, WritableSignal<string | null>>();

  getItem(key: string): Signal<string | null> {
    const itemSignal = this.#storage.get(key);
    if (itemSignal === undefined) {
      const newSignal = signal(localStorage.getItem(key));
      this.#storage.set(key, newSignal);
      return newSignal.asReadonly();
    }
    return itemSignal.asReadonly();
  }

  setItem(key: string, value: string): void {
    const itemSignal = this.#storage.get(key);
    if (itemSignal === undefined) {
      this.#storage.set(key, signal(value));
    } else {
      itemSignal.set(value);
    }
    localStorage.setItem(key, value);
  }
}
