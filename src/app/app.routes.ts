import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'users',
    loadComponent: () => import('./users/user.page').then((m) => m.UserPage),
  },
  {
    path: '',
    redirectTo: 'users',
    pathMatch: 'full',
  },
];
