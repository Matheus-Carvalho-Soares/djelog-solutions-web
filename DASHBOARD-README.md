# DJELOG - Dashboard de Gestão Financeira de Logística

## 🎨 Conceito Estético: Industrial Neon-Noir

Este dashboard foi desenvolvido com uma **direção estética ousada e memorável**, inspirada na estética **Industrial Neon-Noir**:

### Características Visuais
- **Paleta de Cores**: Tons escuros de asfalto (#0a0e1a, #0f1419, #1a1f2e) com acentos âmbar/dourado (#fbbf24, #f59e0b) e verde néon para lucro (#10b981)
- **Tipografia**: 
  - **Display**: Orbitron (geométrica, futurista, industrial)
  - **Headings**: Rajdhani (angular, moderna)
  - **Body**: IBM Plex Sans (industrial mas legível)
  - **Monospace**: IBM Plex Mono (dados técnicos)
- **Elementos Visuais**:
  - Bordas angulares com cantos cortados (clip-path)
  - Sombras profundas e efeitos de brilho neon
  - Gradientes sutis em fundos escuros
  - Microanimações precisas e intencionais
  - Layout assimétrico mas funcional

### O que torna este design INESQUECÍVEL
- **Contraste dramático** entre fundo escuro e acentos luminosos
- **Tipografia ousada** que remete a painéis de instrumentação industrial
- **Animações sequenciadas** que criam uma experiência de "boot-up" ao carregar
- **Elementos geométricos** que lembram caminhões, estradas e luzes noturnas
- **Palette restrita mas impactante** - cada cor tem significado operacional

---

## 🚀 Tecnologias e Arquitetura

### Stack Técnico
- **Angular 17+** com Standalone Components
- **TypeScript** com interfaces robustas
- **Angular Material** para componentes UI
- **Chart.js / ng2-charts** para visualizações
- **CSS3** com animações e gradientes avançados

### Estrutura do Projeto
```
src/app/
├── models/
│   ├── cargo.model.ts
│   ├── usuario.model.ts
│   ├── profissional.model.ts
│   ├── motorista.model.ts
│   ├── veiculo.model.ts
│   ├── empresa.model.ts
│   └── viagem.model.ts
├── services/
│   └── dashboard/
│       ├── dashboard.service.ts          # Service com dados mockados completos
│       └── dashboard-data.service.ts     # Service original
├── dashboard/
│   ├── dashboard.component.ts/html/css   # Container principal
│   └── components/
│       ├── financial-cards/              # Cards de métricas financeiras
│       ├── performance-chart/            # Gráfico de performance mensal
│       ├── alerts-panel/                 # Painel de alertas operacionais
│       ├── vehicle-table/                # Tabela de performance por veículo
│       └── recent-trips/                 # Lista de viagens recentes
└── styles.css                            # Estilos globais + tema Neon-Noir
```

---

## 📦 Instalação e Configuração

### Pré-requisitos
- Node.js 18+ e npm
- Angular CLI 17+

### 1. Instalar Dependências

```bash
npm install
```

### 2. Instalar Angular Material

```bash
ng add @angular/material
```

**Escolha as seguintes opções:**
- Theme: Custom ou Deep Purple/Amber
- Typography: Yes
- Animations: Yes

### 3. Instalar ng2-charts e Chart.js

```bash
npm install ng2-charts chart.js --save
```

### 4. Executar o Projeto

```bash
ng serve
```

Acesse: `http://localhost:4200`

---

## 🎯 Funcionalidades Implementadas

### Layout Principal
- ✅ **Sidebar colapsável** com navegação animada
- ✅ **Header superior** com informações do gerente e filtros
- ✅ **Área de conteúdo responsiva** com grid adaptativo

### Dashboard - Visão Geral
- ✅ **Cards Financeiros** (4 cards principais)
  - Receita Total
  - Despesa Total
  - Lucro Líquido (com indicador positivo/negativo)
  - Viagens Ativas (com contador de viagens com prejuízo)

- ✅ **Gráfico de Performance** (últimos 6 meses)
  - Barras comparativas de Receita vs Despesa
  - Tooltips customizados
  - Legendas interativas
  - Grid de fundo estilizado

- ✅ **Painel de Alertas** 
  - Viagens com prejuízo
  - Viagens sem faturamento
  - Comissões pendentes
  - Veículos com alta despesa
  - Indicadores visuais de severidade (alta/média/baixa)

- ✅ **Tabela de Performance por Veículo**
  - Placa e marca do veículo
  - Total de viagens
  - Receita, despesas e lucro
  - Barra de performance percentual com cores dinâmicas

- ✅ **Lista de Viagens Recentes**
  - Status visual (ativa/concluída/cancelada)
  - Rota e detalhes da viagem
  - Informações de motorista, veículo e empresa
  - Breakdown financeiro (frete, despesas, lucro)
  - Data e hora de início

### Dados Mockados
- ✅ 45+ viagens geradas programaticamente
- ✅ 5 veículos com diferentes marcas
- ✅ 5 motoristas
- ✅ 4 empresas clientes
- ✅ Cálculos automáticos de lucro, comissões e percentuais
- ✅ Alertas gerados dinamicamente baseados nas regras de negócio

---

## 🎨 Customizações Visuais

### Variáveis CSS Globais
```css
--color-asphalt-dark: #0a0e1a;
--color-asphalt: #0f1419;
--color-asphalt-light: #1a1f2e;
--color-amber: #fbbf24;
--color-neon-green: #10b981;
--color-neon-red: #ef4444;
```

### Fontes Google
- Orbitron (display/títulos)
- Rajdhani (headings/labels)
- IBM Plex Sans (corpo)
- IBM Plex Mono (valores monetários)

### Animações Principais
- **cardsReveal**: Revelação sequenciada dos cards financeiros
- **panelReveal**: Aparição suave dos painéis
- **slideInUp/slideInRight**: Entrada de elementos
- **pulse**: Indicador de status ao vivo
- **glow**: Efeito de brilho em elementos críticos

---

## 🏗️ Arquitetura de Componentes

### Dashboard Component (Container)
- Gerencia estado global do dashboard
- Orquestra comunicação entre componentes filhos
- Controla sidebar colapsável

### Financial Cards Component
- Recebe `DashboardMetrics` via Input
- Calcula percentual de lucro dinamicamente
- Aplica classes condicionais baseadas em valores negativos

### Performance Chart Component
- Implementa `OnChanges` para reagir a mudanças de dados
- Configuração completa do Chart.js
- Tema customizado para paleta Neon-Noir

### Alerts Panel Component
- Lista dinâmica de alertas
- Sistema de severidade visual
- Scroll customizado

### Vehicle Table Component
- Material Table com colunas personalizadas
- Barra de performance com cores dinâmicas
- Classes condicionais para diferentes níveis de performance

### Recent Trips Component
- Timeline vertical de viagens
- Status visual por cores
- Breakdown financeiro detalhado
- Formatação de datas com pipe Angular

---

## 💡 Decisões de Design

### Por que Industrial Neon-Noir?
O sistema substitui controle feito em **papel** em uma operação de **logística de caminhões**. A estética escolhida:

1. **Evoca confiabilidade industrial** - cores escuras e tipografia robusta transmitem seriedade
2. **Destaca informações críticas** - acentos âmbar/dourado iluminam métricas importantes
3. **Reflete o ambiente operacional** - asfalto noturno, luzes de estrada, instrumentação de veículos
4. **É memorável e único** - foge completamente de dashboards corporativos genéricos
5. **Facilita leitura prolongada** - fundo escuro reduz fadiga visual

### Hierarquia Visual
1. **Primário**: Valores financeiros (fonte mono, tamanho grande, cores vibrantes)
2. **Secundário**: Labels e categorias (fonte display, all-caps, cores âmbar)
3. **Terciário**: Metadados e timestamps (fonte sans, cores desbotadas)

---

## 📊 Regras de Negócio Implementadas

### Cálculo de Lucro
```typescript
lucro = valorFrete - (despesas + abastecimento + comissao)
```

### Alertas Automáticos
- **Prejuízo**: lucro < 0
- **Sem Faturamento**: valorFrete === 0 && status === 'ATIVA'
- **Comissão Pendente**: status === 'FINALIZADA' && !comissaoPaga
- **Alta Despesa**: despesas totais por veículo > R$ 20.000

### Performance do Veículo
- **Excelente**: percentualLucro >= 30%
- **Boa**: percentualLucro >= 15%
- **Média**: percentualLucro >= 0%
- **Ruim**: percentualLucro < 0%

---

## 🔧 Próximos Passos (Opcional)

- [ ] Integração com backend real (API REST)
- [ ] Filtros de período funcionais
- [ ] Exportação de relatórios (PDF/Excel)
- [ ] Drill-down em viagens específicas
- [ ] Gráficos adicionais (pizza, linha, scatter)
- [ ] Sistema de notificações em tempo real
- [ ] Dark/Light mode toggle
- [ ] Responsividade mobile completa
- [ ] PWA para uso offline

---

## 👨‍💻 Desenvolvido para

**Contexto**: Sistema de gestão financeira para transportadora de caminhões  
**Usuário**: Gerente Financeiro  
**Objetivo**: Substituir controle manual em papel por dashboard digital profissional  
**Diferencial**: Design visualmente impactante que torna o trabalho diário mais agradável

---

## 📄 Licença

Este é um projeto de demonstração desenvolvido para DJELOG Solutions.
