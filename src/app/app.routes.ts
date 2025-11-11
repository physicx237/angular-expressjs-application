import { Routes } from '@angular/router';
import { authorizationGuard } from './guards/authorization-guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/main/main.component').then((module) => module.MainComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((module) => module.LoginComponent),
  },
  {
    path: 'user',
    loadComponent: () =>
      import('./pages/user/user.component').then((module) => module.UserComponent),
    canActivate: [authorizationGuard],
  },
  {
    path: '**',
    redirectTo: '/',
    pathMatch: 'full',
  },
];
