import { Routes } from '@angular/router';
import { LoginComponent } from './screens/login/login.component';
import { RegisterComponent } from './screens/register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { DashboardOverviewComponent } from './dashboard/components/dashboard-overview/dashboard-overview.component';
import { MotoristasComponent } from './screens/motoristas/motoristas.component';
import { VeiculosComponent } from './screens/veiculos/veiculos.component';
import { EmpresasComponent } from './screens/empresas/empresas.component';
import { ViagensComponent } from './screens/viagens/viagens.component';
import { ConfiguracoesComponent } from './screens/configuracoes/configuracoes.component';
import { RelatoriosComponent } from './screens/relatorios/relatorios.component';
import { RelatorioPorDataComponent } from './screens/relatorios/relatorio-por-data/relatorio-por-data.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      { path: '', component: DashboardOverviewComponent },
      { path: 'motoristas', component: MotoristasComponent },
      { path: 'veiculos', component: VeiculosComponent },
      { path: 'empresas', component: EmpresasComponent },
      { path: 'viagens', component: ViagensComponent },
      { path: 'configuracoes', component: ConfiguracoesComponent },
      { path: 'relatorios', component: RelatoriosComponent },
      { path: 'relatorios/por-data', component: RelatorioPorDataComponent }
    ]
  },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent }
];
