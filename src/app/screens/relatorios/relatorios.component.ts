import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-relatorios',
  standalone: true,
  imports: [CommonModule, RouterModule, MatIconModule],
  templateUrl: './relatorios.component.html',
  styleUrls: ['./relatorios.component.css']
})
export class RelatoriosComponent {
  relatorios = [
    {
      titulo: 'Faturamento por Data',
      descricao: 'Relatório de faturamento filtrado por período',
      icone: 'date_range',
      rota: '/dashboard/relatorios/por-data',
      disponivel: true
    },
    {
      titulo: 'Faturamento por Veículo',
      descricao: 'Relatório de faturamento agrupado por veículo',
      icone: 'local_shipping',
      rota: '/dashboard/relatorios/por-veiculo',
      disponivel: false
    },
    {
      titulo: 'Faturamento por Profissional',
      descricao: 'Relatório de faturamento agrupado por profissional',
      icone: 'person',
      rota: '/dashboard/relatorios/por-profissional',
      disponivel: false
    }
  ];
}
