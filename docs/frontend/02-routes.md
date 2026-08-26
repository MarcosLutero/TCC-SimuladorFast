# Frontend – 02 Rotas e Navegação

## 1. Router (`src/App.js:1`)

```js
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom" // App.js:2
import { PaginaInicial, Quiz, AdminAnimais, Login, FeedbackPage, UsuariosPage, Cadastro } from "./pages" // App.js:3

function PrivateRoute({ element: Component, level }) { // App.js:5
  const [nivelAcesso, setNivelAcesso] = useState(null)
  useEffect(() => {
    const stored = sessionStorage.getItem("nivelAcesso") // App.js:9
    if (!stored) setNivelAcesso(0)          // → /login
    else if (stored < level) setNivelAcesso(1) // → /
    else setNivelAcesso(level)
  }, [level])
  if (nivelAcesso===null) return null
  if (nivelAcesso < level) return <Navigate to={nivelAcesso===0 ? "/login" : "/"} replace />
  return <Component />
}

export default function App(){
  return <BrowserRouter><Routes>
    <Route path="/login" element={<PrivateRoute element={Login} level={0} />} /> // App.js:39
    <Route path="/cadastro" element={<PrivateRoute element={Cadastro} level={0} />} /> // 40
    <Route path="/" element={<PrivateRoute element={PaginaInicial} level={1} />} /> // 41
    <Route path="/quiz" element={<PrivateRoute element={Quiz} level={1} />} /> // 42
    <Route path="/feedbacks" element={<PrivateRoute element={FeedbackPage} level={2} />} /> // 43
    <Route path="/animais" element={<PrivateRoute element={AdminAnimais} level={2} />} /> // 44
    <Route path="/admin/usuarios" element={<PrivateRoute element={UsuariosPage} level={3} />} /> // 45
  </Routes></BrowserRouter>
}
```

## 2. Tabela de rotas

| # | Path | Componente | `level` | Acesso | Arquivo | Descrição |
|---|------|------------|---------|--------|---------|-----------|
| 1 | `/login` | `Login` | 0 | público (mas via PrivateRoute) | `pages/login.js:4` | Form email/senha → `auth.js:3` `POST auth/login` → `sessionStorage` + `window.location.href="/"` |
| 2 | `/cadastro` | `Cadastro` | 0 | público | `pages/cadastro.js:5` | `cadastrarUsuarioReq` + auto-login |
| 3 | `/` | `PaginaInicial` | 1 | `ROLE_USER`+ | `pages/paginaInicial.js:10` | “Simulador A-FAST” título, botão Começar → `/quiz`, Meu Histórico (modal), Configurações (qtd/tempo) |
| 4 | `/quiz` | `Quiz` (`PaginaQuiz`) | 1 | `ROLE_USER`+ | `pages/paginaQuiz.js:40` | Core: `sortearAnimaisReq` + timer + áreas HD/ER/CC/HR + `cadastrarFeedbackReq` |
| 5 | `/feedbacks` | `FeedbackPage` (`AdminUsuarios` nome errado) | 2 | `ROLE_TECNICO`+ | `pages/feedbacks.js:7` | Tabela `GET /feedbacks` com `CustomFeedbackModal` |
| 6 | `/animais` | `AdminAnimais` | 2 | `ROLE_TECNICO`+ | `pages/adminAnimais.js:9` | CRUD animais + imagens via `ModalAnimal.jsx:13` |
| 7 | `/admin/usuarios` | `UsuariosPage` (`AdminUsuario`) | 3 | `ROLE_ADMIN` | `pages/adminUsuarios.js:6` | Lista `GET /admin/usuarios`, toggle `ROLE_USER↔TECNICO` |

**Sem 404:** rota inexistente cai em branco (sem `<Route path="*" element={<Navigate to="/" />} />`).

## 3. Níveis de acesso

Definidos em `pages/login.js:23` e `App.js:5`:

```js
// login.js:25
switch(resp.usuario.role){
  case "ROLE_ADMIN": nivel=3; break
  case "ROLE_TECNICO": nivel=2; break
  default: nivel=1
}
sessionStorage.setItem("nivelAcesso", nivel) // login.js:37
```

| `nivelAcesso` | `role` | Rotas liberadas |
|---------------|--------|-----------------|
| 0 | sem login | `/login`, `/cadastro` (PrivateRoute level 0) |
| 1 | `ROLE_USER` | `/`, `/quiz` |
| 2 | `ROLE_TECNICO` | + `/feedbacks`, `/animais` |
| 3 | `ROLE_ADMIN` | + `/admin/usuarios` |

**Problemas:**

- `PrivateRoute` com `level=0` para `/login`/`/cadastro` inverte lógica: usuário logado (`nivel>=1`) é redirecionado para `/` ( `App.js:28` `nivelAcesso<level?` false? Na verdade `nivelAcesso=1`, `level=0` → `1<0` false → renderiza Login mesmo logado). Deveria bloquear login quando já autenticado.
- `nivelAcesso` string vs number: `sessionStorage.getItem` retorna string, `App.js:13` `stored < level` faz comparação string ( `"2" < 3` true coerção, mas `"10"<3` false). `menuAreas.jsx:12` faz `parseInt` correto, `App.js` não.
- Sem proteção real: `PrivateRoute` só checa `sessionStorage`, não valida JWT (`JwtDecoder` backend). Token expirado ainda deixa navegar até API retornar 401.

## 4. Navegação

- **Links:** `react-router-dom` `<Link to>` em `paginaInicial.js:78` (`/quiz`), `login.js:107` (`/cadastro`), `cadastro.js:103` (`/login`), `paginaQuiz.js:176` `<Link to="/">` Voltar.
- **Nav bar:** `components/menuAreas.jsx:4` `TELAS` array filtra por `nivelAcesso` e `window.location.pathname`:
  ```js
  const TELAS = [
    {name:"Inicio", path:"/", nivel:1},
    {name:"Animais", path:"/animais", nivel:2},
    {name:"Feedbacks", path:"/feedbacks", nivel:2},
    {name:"Usuarios", path:"/admin/usuarios", nivel:3},
  ] // menuAreas.jsx:4
  ```
  Renderiza só onde `tela.nivel <= nivelAcesso && tela.path !== pathname`.
- **Redirects manuais:** `window.location.href="/"` (`login.js:40`, `modalFeedback.jsx:84`), `window.location.reload()` (`adminUsuarios.js:30`, `modalFeedback.jsx:85`), `window.open(url,"_blank")` (`modalAnimal.jsx:251`). Quebra SPA (full reload) em vez de `useNavigate`.
- **Logout:** `components/logout.jsx:10` `sessionStorage.clear()` + `window.location.href="/login"`.

## 5. Histórico e query params

- Sem `useParams`/`useSearchParams` – quiz `qtd` e `tempo` vêm de `sessionStorage config` (`paginaQuiz.js:61`), não da URL (`/quiz?qtd=2` não existe).
- Feedback histórico: `paginaInicial.js:55` `listarFeedbacksReq(usuario.id)` → `GET /feedbacks/{id}`.

## 6. Mermaid – fluxo navegação

```mermaid
graph TD
  A[/login level0] -->|auth OK| B[/ level1]
  A -->|cadastro| C[/cadastro level0]
  C -->|cadastrarUsuarioReq + auth| B
  B -->|Começar| D[/quiz level1]
  D -->|Enviar + feedback| E[feedback POST]
  E -->|modalFeedback| B
  B -->|MenuAreas nivel>=2| F[/animais]
  B -->|MenuAreas nivel>=2| G[/feedbacks]
  B -->|MenuAreas nivel3| H[/admin/usuarios]
  F -->|ModalAnimal| F
  G -->|CustomFeedbackModal| G
  H -->|promoverUsuario| H
  B -->|Sair logout.jsx| A
```

## 7. Checklist

- [ ] Add `path="*"` → `Navigate to="/"` em `App.js:37`.
- [ ] Trocar `window.location.href` por `useNavigate` para não perder estado.
- [ ] Corrigir `PrivateRoute level 0` para bloquear logado, e `parseInt` em `App.js:9`.
- [ ] Validar JWT expiração no frontend (`jwtDecode`).

---
*Fontes: `src/App.js:1`, `src/pages/index.js:1`, `src/components/menuAreas.jsx:1`, `src/components/logout.jsx:1`, `src/pages/login.js:23`*
