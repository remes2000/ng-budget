import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import PocketBase from 'pocketbase';

import { routes } from './app.routes';
import { PB, API_URL } from './const';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    { provide: PB, useValue: new PocketBase(API_URL) }
  ]
};
