# 🚚 Djelog Solutions Web

Frontend do sistema **Djelog Solutions**, uma aplicação web para gestão logística. A interface permite autenticar usuários, acompanhar indicadores do dashboard e gerenciar cadastros e operações como motoristas/profissionais, veículos, empresas, viagens, viagens comissionadas, estadias, despesas e relatórios.

## ✨ Principais Recursos

- 🔐 Login e cadastro de usuários.
- 📊 Dashboard com visão geral operacional e financeira.
- 👷 Cadastro e manutenção de motoristas/profissionais, veículos e empresas.
- 🛣️ Lançamento e acompanhamento de viagens.
- 💰 Controle de viagens comissionadas.
- 🧾 Registro de estadias e despesas vinculadas a viagens.
- 📈 Relatórios por período com suporte a exportação/tratamento de dados no frontend.
- 🎫 Autenticação via JWT armazenado em `sessionStorage` e enviado pelo interceptor HTTP.

## 🧰 Stack e Frameworks

- Angular 17.
- Angular CLI 17.
- Angular Material/CDK.
- RxJS.
- Chart.js com ng2-charts.
- xlsx para recursos de planilha/exportação.
- TypeScript 5.4.

## 🗂️ Estrutura Relevante

```text
src/app/
  config/                 Configuração da URL base da API
  dashboard/              Layout e componentes do dashboard
  models/                 Interfaces/modelos usados pela aplicação
  screens/                Telas principais do sistema
  services/               Serviços HTTP e autenticação
  app.routes.ts           Rotas da aplicação
  app.config.ts           Providers globais, HTTP client e interceptor JWT
```

## ✅ Pré-requisitos

- Node.js compatível com Angular 17.
- npm.
- Backend Djelog Solutions rodando e acessível pela URL configurada.

## 🔌 Configuração da API

A URL do backend fica em:

```text
src/app/config/api.config.ts
```

Configuração local padrão:

```ts
export const API_CONFIG = {
  baseUrl: 'http://localhost:8080'
};
```

Para produção, ajuste `baseUrl` para a URL pública do backend antes do build/deploy. O arquivo já contém, como referência, uma URL comentada do backend hospedado no Render.

## 🚀 Como Iniciar em Desenvolvimento

Instale as dependências:

```bash
npm install
```

Inicie o servidor local:

```bash
npm start
```

Por padrão, a aplicação fica disponível em:

```text
http://localhost:4200
```

## 📜 Scripts Disponíveis

```bash
npm start
```

Executa `ng serve` em modo desenvolvimento.

```bash
npm run build
```

Gera a build de produção em `dist/djelog-solutions-web`.

```bash
npm test
```

Executa `ng test`. Caso a configuração de testes não esteja completa no clone atual, revise os arquivos de suporte do Angular/Karma antes de usar este comando no CI.

## 🧭 Rotas Principais

- `/login`: tela de login.
- `/register`: cadastro de usuário.
- `/dashboard`: dashboard principal.
- `/dashboard/motoristas`: gestão de motoristas/profissionais.
- `/dashboard/veiculos`: gestão de veículos.
- `/dashboard/empresas`: gestão de empresas.
- `/dashboard/viagens`: gestão de viagens.
- `/dashboard/viagens-comissionadas`: gestão de viagens comissionadas.
- `/dashboard/estadias`: gestão de estadias.
- `/dashboard/configuracoes`: configurações do usuário.
- `/dashboard/relatorios`: relatórios.
- `/dashboard/relatorios/por-data`: relatório por período.

## 🔐 Autenticação

O login usa o endpoint `POST /api/auth/login`. Em caso de sucesso, a aplicação salva no `sessionStorage`:

- `authToken`
- `userId`
- `userEmail`
- `userName`

O interceptor em `src/app/services/auth/auth.interceptor.ts` adiciona o header:

```text
Authorization: Bearer <token>
```

em requisições HTTP quando existe token salvo.

## 🔗 Integração com o Backend

Os serviços Angular consomem os endpoints do backend a partir de `API_CONFIG.baseUrl`. As principais bases de endpoint usadas são:

- `/api/auth`
- `/api/cargo`
- `/api/profissional`
- `/api/veiculo`
- `/api/empresa`
- `/api/viagem`
- `/api/viagem-comissionada`
- `/api/estadias`
- `/api/despesas`