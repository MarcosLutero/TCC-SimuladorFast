# Frontend – 01 Arquitetura

> **Projeto:** `TCC-SimuladorFast/frontend` (`simulador:0.1.0` `frontend/package.json:2`)  
> **Stack:** React 18.1.0 (`package.json:16`), React Router 6.3.0 (`package.json:20`), React Scripts 5.0.1, React Bootstrap 2.4.0, MUI 5.15.13 (`@mui/material`), Emotion 11.11, FontAwesome 6.1.1, Axios 0.27.2 (instalado mas não usado), `env-cmd 10.1.0`  
> **Build:** `npm start` → `env-cmd -f ./.env react-scripts start` (`package.json:25`) na porta 3000 (`docker-compose.yml:12` `3000:3000`)  
> **Backend URL:** `REACT_APP_API_URL=http://localhost:8080` (`frontend/.env:1`, `/.env:1`)

## 1. Estrutura de pastas

```
frontend/
├── package.json
├── .env (REACT_APP_API_URL)
├── public/index.html (Bootstrap 5.2, icons, Google Fonts Shadows Into Light)
├── public/manifest.json
├── src/
│   ├── index.js (ReactDOM.createRoot → <App />)
│   ├── App.js (Router + PrivateRoute)
│   ├── api/ (4 arquivos, 68 linhas)
│   │   ├── index.js (Api.request + refreshToken bug)
│   │   ├── animal.js (7 funções)
│   │   ├── auth.js (auth, getUsuario órfão)
│   │   ├── feedback.js (2 funções)
│   │   └── usuarios.js (3 funções)
│   ├── pages/ (8 arquivos, ~877 linhas)
│   │   ├── index.js (barrel export)
│   │   ├── login.js (119)
│   │   ├── cadastro.js (115)
│   │   ├── paginaInicial.js (176)
│   │   ├── paginaQuiz.js (285) – core
│   │   ├── adminAnimais.js (85)
│   │   ├── adminUsuarios.js (92)
│   │   └── feedbacks.js (69)
│   ├── components/ (7 arquivos, ~577 linhas)
│   │   ├── Topo.js (0 linhas – vazio)
│   │   ├── menuAreas.jsx (39) – nav
│   │   ├── logout.jsx (18)
│   │   ├── drawer.jsx (37) – MUI não usado
│   │   ├── modalAnimal.jsx (388) – 3 modais
│   │   ├── modalFeedback.jsx (87)
│   │   └── customFeedbackModal.jsx (67)
│   ├── css/
│   │   ├── index.css (115) – em uso
│   │   └── _index.css (83) – legado _ com .norte/.sul
│   └── img/doggo.png (122KB)
└── Dockerfile / docker-compose.yml (volume ./frontend)
```

Total ~1600 LOC JSX/JS.

## 2. Dependências – uso real vs instalado

| Pacote | Versão | Uso real | Status |
|--------|--------|----------|--------|
| `react`/`react-dom` | 18.1.0 | Todo app, `StrictMode` `index.js:6` | ok |
| `react-router-dom` | 6.3.0 | `BrowserRouter`, `Routes`, `Navigate` `App.js:2` | ok |
| `react-bootstrap` | 2.4.0 | `Modal`, `Button`, `Container`, `Image` | ok |
| `@mui/material` + `@emotion/*` | 5.15.13 | `Drawer`, `List` `drawer.jsx:2` | **órfão** – SideMenu nunca importado |
| `@fortawesome/*` | 6.1.1 | `faChevronRight` `paginaQuiz.js:6` | ok (1 ícone) |
| `react-icons` | 4.3.1 | – | **não usado** |
| `axios` | 0.27.2 | – | **não usado** – `api/index.js` usa `fetch` |
| `env-cmd` | 10.1.0 | `npm start` `package.json:25` | ok |
| `web-vitals` | 2.1.4 | – | CRA default, não usado |
| `bootstrap` (CDN) | 5.2 | `public/index.html:5` link CDN | ok, duplicado com `react-bootstrap` |

## 3. Ponto de entrada

`src/index.js:1`:
```js
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
ReactDOM.createRoot(document.getElementById('root')).render(<StrictMode><App/></StrictMode>)
```

`src/App.js:35` exporta `BrowserRouter` com 7 rotas protegidas por `PrivateRoute`.

## 4. Fluxo de dados

```
public/index.html (Bootstrap CDN, fonts)
  → index.js → App.js (PrivateRoute nivelAcesso)
    → pages/* (class vs function components)
      → api/* (fetch → REACT_APP_API_URL)
        → Spring :8080
      → components/* (modais)
      ← sessionStorage (config, access, usuario, nivelAcesso)
```

- **Sem Redux/Zustand/Context** – estado via `this.state` (class) e `useState` (function) + `sessionStorage`.
- **Sem React Query/SWR** – `api/*` usa `Promise` manual com `fetch`.
- **Mistura class/function:** `paginaInicial.js:10` `class PaginaInicial extends React.Component`, `paginaQuiz.js:40` class, `adminAnimais.js:9` class, já `login.js:4` function + hooks.

## 5. Configuração

- **Env:** `frontend/.env:1` `REACT_APP_API_URL=http://localhost:8080` (sem trailing slash, sem `/api`).
- **Docker:** `TCC-SimuladorFast/docker-compose.yml:14` monta `./frontend:/frontend` + `node_modules` volume; `Dockerfile:6` `COPY ./frontend` + `npm install` + `npm start`.
- **ESLint:** `react-app` (`package.json:30`).
- **Browserslist:** `>0.2%`, `last 1 chrome/firefox/safari` (`package.json:36`).

## 6. Gaps arquiteturais

- **Topo.js vazio** (`components/Topo.js:1` 0 linhas) – legado `partial/components/Topo.js`.
- **_index.css legado** com `.norte/.sul` não usado; `index.css` em uso tem `.hd/.er/.cc/.hr` absolutos.
- **Axios instalado sem uso** – remover ou migrar `fetch` para `axios` com interceptors.
- **MUI/SideMenu nunca renderizado** – `drawer.jsx:9` morto.
- **Sem testes:** `App.test.js` deletado (`git log daa9777`), `package.json` ainda tem `@testing-library/*`.

---
*Fontes: `frontend/package.json:1`, `src/index.js:1`, `src/App.js:1`, `public/index.html:1`, `src/components/*`, `src/css/*`*
