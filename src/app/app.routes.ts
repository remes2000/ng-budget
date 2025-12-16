import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'entries',
    pathMatch: 'full'
  },
  {
    path: 'entries',
    loadComponent: () => import('./pages/entries/entries').then(m => m.Entries)
  },
  {
    path: 'report',
    loadComponent: () => import('./pages/report/report').then(m => m.Report)
  }
];
