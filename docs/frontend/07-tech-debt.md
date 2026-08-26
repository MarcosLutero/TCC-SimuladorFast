# Frontend – 07 Dívida Técnica

> P0 quebra fluxo, P1 bug, P2 qualidade, P3 melhoria. `arquivo:linha`.

## P0 – Quebra fluxo

| ID | Título | Arquivo:linha | Descrição | Fix |
|----|--------|---------------|-----------|-----|
| P0-F01 | `Api.refreshToken` endpoint inexistente + loop 401 | `api/index.js:12` `POST /api/token/refresh/` | Backend não tem `/api/token/refresh`, `localStorage refresh` nunca setado; `request:47` recursa infinito em 401 | Remover refresh ou implementar `POST /auth/refresh` com `refreshToken` real; em 401 `sessionStorage.clear()` + `navigate('/login')` |
| P0-F02 | `getUsuario()` 404 | `api/auth.js:7` `GET usuario` | Não existe `GET /usuario` backend | Deletar ou criar `GET /usuarios/me` backend |
| P0-F03 | `nivelAcesso` string vs number em PrivateRoute | `App.js:13` `stored < level` string comp | `"2"<3` ok por coerção mas `"10"<2` true | `parseInt(stored,10)` como `menuAreas.jsx:12` |

## P1 – Bugs

| ID | Título | Arquivo:linha | Descrição |
|----|--------|---------------|-----------|
| P1-F01 | `modalAnimal.jsx` typo `temliquido` | `components/modalAnimal.jsx:289` `temliquido` | `setImagemData({janela, temliquido})` perde `temLiquido`, `createUpdateImagem:115` envia `false` sempre em edit |
| P1-F02 | `modalAnimal.jsx` `getImagens` `resp.data` undefined | `components/modalAnimal.jsx:40` `resp.data` | Backend retorna `AnimalPOJO` com `id,tipo` etc., não `data`; `animalData` fica `{lista_janelas,pontuacao}` sem `tipo` |
| P1-F03 | `paginaInicial` `config.config=self` | `pages/paginaInicial.js:37` | `config.config=config` cria referência circular, `JSON.stringify` falha se tentar persistir? Hoje `saveConfig:47` salva sem `config` prop, mas `loadFromStorage` lê `config.config` indefinido |
| P1-F04 | `paginaQuiz` `tempoOriginal` race | `pages/paginaQuiz.js:87` `setState tempoOriginal` | `this.state.tempo` ainda 180 ao setar, correto seria `config.tempo` |
| P1-F05 | `paginaQuiz` mutação direta state | `pages/paginaQuiz.js:258` `animaisTemp[...].clicked = ...` | Muta `state.animais` sem cópia, React pode não re-renderizar; usar `map` + spread |
| P1-F06 | `paginaQuiz` `JANELAS` ordem diverge backend | `pages/paginaQuiz.js:14` `HD,ER,CC,HR` vs `ImagemJanelaController.java:37` `hd,hr,er,cc` | Não quebra mas confunde; padronizar |
| P1-F07 | `feedbacks.js` class nome errado | `pages/feedbacks.js:7` `class AdminUsuarios` | Deveria `FeedbackPage`, confunde import `pages/index.js:4` |
| P1-F08 | `App.js` `PrivateRoute level0` permite logado ver login | `App.js:39` `level0` | Logado `nivel 1` vê `/login` ( `1<0` false → não redirect) |
| P1-F09 | `modalAnimal.jsx` `return <div></div>` em map | `components/modalAnimal.jsx:303` | Dentro de `select` map, retorna div vazia quando janela existe → React warning + option faltando |
| P1-F10 | `paginaQuiz` `formatarTempo` sem pad minutes | `pages/paginaQuiz.js:105` | `minutes` sem `pad`, `0:05` vs `12:05` inconsistente |

## P2 – Qualidade

| ID | Título | Arquivo:linha | Descrição | Esforço |
|----|--------|---------------|-----------|---------|
| P2-F01 | Mistura class/function | `pages/paginaInicial.js:10` class vs `login.js:4` function | Padronizar hooks | 4h |
| P2-F02 | `window.location.href/reload/open` | `login.js:40`, `adminUsuarios.js:30`, `modalAnimal.jsx:251` | Quebra SPA, perde estado | 2h `useNavigate` |
| P2-F03 | Sem loading/error states | `adminAnimais.js:24` `catch console.log` | Usuário não vê erro | 2h |
| P2-F04 | `Topo.js` vazio + `_index.css` legado | `components/Topo.js:0`, `css/_index.css:1` | Mortos | 10m deletar |
| P2-F05 | `drawer.jsx` MUI nunca usado | `components/drawer.jsx:9` | Importa MUI 5.15 mas não renderiza | 10m deletar ou usar |
| P2-F06 | `axios` e `react-icons` não usados | `package.json:15,19` | `axios 0.27.2` morto, `fetch` usado | 10m remover |
| P2-F07 | `paginaInicial` histórico `console.log("deu ruim 23")` | `pages/paginaInicial.js:60` | Log informal | 10m |
| P2-F08 | Sem testes | `package.json:12` `@testing-library` instalado sem `*.test.js` | `App.test.js` deletado em `daa9777` | 3h |
| P2-F09 | Inputs `type text` para número | `pages/paginaInicial.js:104` `qtdControl` | `Number(e.target.value)` pode `NaN` | 30m `type=number` + `min` |
| P2-F10 | Sem `useLocation` em `menuAreas` | `components/menuAreas.jsx:15` `window.location.pathname` | Não reativo a `navigate` | 15m |
| P2-F11 | `modalFeedback` sem `key` | `components/modalFeedback.jsx:42` `[0,1,2,3].map` sem key | Warning | 10m |
| P2-F12 | `env-cmd` desnecessário | `package.json:25` `env-cmd -f ./.env` | CRA já lê `.env` com `REACT_APP_` | 10m remover |

## P3 – Melhorias

| ID | Título | Descrição | Esforço |
|----|--------|-----------|---------|
| P3-F01 | Migrar `fetch` → `axios` interceptors | Centralizar `Authorization` + 401 | 2h |
| P3-F02 | Introduzir `Context` ou `Zustand` para `usuario/nivelAcesso` | Hoje `sessionStorage` manual | 3h |
| P3-F03 | Add `React Query` para `sortearAnimaisReq` caching | Evitar refetch `paginaQuiz` | 2h |
| P3-F04 | Tipar com `PropTypes` ou `TypeScript` | `modalAnimal` props `animal, edit, onCreateEdit` sem tipagem | 8h TS |
| P3-F05 | Acessibilidade `paginaQuiz` áreas click | `hd` divs `opacity 0.01` `css/index.css:81` sem `aria-label` | 1h |
| P3-F06 | Lazy load `doggo.png` 122KB | `img/doggo.png` 122KB base64? | 30m `import` dinâmico |
| P3-F07 | PWA `manifest.json:2` genérico | `name: Create React App Sample` | 10m atualizar |
| P3-F08 | `public/index.html` 3x Bootstrap CDN | 3 links bootstrap `index.html:5,19` + `react-bootstrap` | 15m deduplicar |

## Ordem sugerida

**Sprint 0:** P0-F01 (remover refresh), P0-F03 (parseInt), P1-F01/F02 (modalAnimal typos).

**Sprint 1:** P1-F03–F05 (paginaInicial/Quiz state), P2-F02 (useNavigate).

**Sprint 2:** P2-F01 (hooks), P2-F08 (testes), P3-F02 (Context).

---
*Fontes: `src/api/*.js`, `src/App.js:1`, `src/pages/*.js`, `src/components/*.jsx`, `frontend/package.json:1`*
