import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
    path: '', 
    loadChildren: () => import('./features/home/home.routes').then(m => m.HOME_ROUTES) 
  },
  { 
    path: 'inventory', 
    loadChildren: () => import('./features/inventory/inventory.routes').then(m => m.INVENTORY_ROUTES) 
  },
  { path: '**', redirectTo: '', pathMatch: 'full' }
];
