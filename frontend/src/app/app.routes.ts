import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { ModulesComponent } from './pages/modules/modules';
import { FinanceiroComponent } from './pages/financeiro/financeiro';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'modules', component: ModulesComponent },
  { path: 'financeiro', component: FinanceiroComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: '**', redirectTo: 'login' }
];