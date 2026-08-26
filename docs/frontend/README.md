# Frontend – Documentação

> **Simulador A-Fast** – `TCC-SimuladorFast/frontend` (`simulador:0.1.0` React 18)  
> **Backend:** `simulador-afast-backend` (`:8080`) – ver `../backend/README.md`

## Índice

| # | Arquivo | O que cobre |
|---|---------|-------------|
| 01 | [01-architecture.md](./01-architecture.md) | Stack, pastas, dependências, `index.js` → `App.js` |
| 02 | [02-routes.md](./02-routes.md) | 7 rotas `App.js:39`, `PrivateRoute` níveis 0–3, `menuAreas.jsx` |
| 03 | [03-state-auth.md](./03-state-auth.md) | `sessionStorage` (`access, usuario, nivelAcesso, config`), login/cadastro, timer `paginaQuiz.js:83` |
| 04 | [04-pages.md](./04-pages.md) | 8 páginas (`login.js:4` → `paginaQuiz.js:40` core) |
| 05 | [05-components.md](./05-components.md) | 7 componentes (`modalAnimal.jsx:13` 388 linhas, `menuAreas.jsx:1` etc.) |
| 06 | [06-api-contract.md](./06-api-contract.md) | `api/index.js:21` + 4 módulos (`animal.js`, `auth.js`, `feedback.js`, `usuarios.js`) ↔ 18 endpoints backend |
| 07 | [07-tech-debt.md](./07-tech-debt.md) | Backlog P0–P3 frontend (`modalAnimal.jsx:289` typo etc.) |

## Resumo 1 página

**Fluxo usuário:** `/login` (`auth.js:3` `POST auth/login` → `sessionStorage` 3 keys) → `/` (`paginaInicial.js:71` Começar/Histórico/Config) → `/quiz` (`paginaQuiz.js:60` `sortearAnimaisReq` + timer + 4 áreas `hd/er/cc/hr` `css/index.css:81` + `cadastrarFeedbackReq`) → `ModalFeedback.jsx:27`. Admin `nivel>=2` vê `/animais` (`ModalAnimal.jsx:13` CRUD `FormData`) e `/feedbacks`; `nivel 3` vê `/admin/usuarios`.

**Stack:** React 18 + Router 6 + Bootstrap 5 (CDN + react-bootstrap) + MUI 5 (órfão `drawer.jsx:9`) + `fetch` (axios instalado sem uso).

**Dívidas críticas:** `api/index.js:12` refresh inexistente + loop 401 P0, `modalAnimal.jsx:289` typo P1, mistura class/function, `window.location.href` quebra SPA, `Topo.js` vazio.

## Como rodar

```bash
cd TCC-SimuladorFast/frontend
npm install
echo "REACT_APP_API_URL=http://localhost:8080" > .env
npm start # 3000
```

Ver `../backend/05-configuration.md` para backend `:8080`.
