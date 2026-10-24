import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then(m => m.HomePage),
    canActivate: [authGuard] // <--- ¡Ruta protegida!
  },
  {
    path: 'ingredientes',
    loadComponent: () => import('./pages/ingredientes/ingredientes.page').then( m => m.IngredientesPage),
    canActivate: [authGuard]
  },
];
