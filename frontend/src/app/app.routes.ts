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
  {
    path: 'clientes',
    loadComponent: () => import('./pages/clientes/clientes.page').then( m => m.ClientesPage)
  },
  {
    path: 'clientes',
    loadComponent: () => import('./pages/clientes/clientes.page').then(m => m.ClientesPage),
    canActivate: [authGuard]
  },
  {
    path: 'cotizaciones',
    loadComponent: () => import('./pages/cotizaciones/cotizaciones.page').then( m => m.CotizacionesPage)
  },
  {
    path: 'cotizaciones',
    loadComponent: () => import('./pages/cotizaciones/cotizaciones.page').then(m => m.CotizacionesPage),
    canActivate: [authGuard]
  }
];
