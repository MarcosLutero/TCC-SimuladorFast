# Frontend – 04 Páginas

## 1. Visão geral

| # | Arquivo | Classe/Func | Rota | Nível | Linhas | Descrição |
|---|---------|-------------|------|-------|--------|-----------|
| 1 | `pages/login.js:4` | function `Login` | `/login` | 0 | 119 | Form login, `auth` → `sessionStorage` |
| 2 | `pages/cadastro.js:5` | function `Cadastro` | `/cadastro` | 0 | 115 | Form cadastro + auto-login |
| 3 | `pages/paginaInicial.js:10` | class `PaginaInicial` | `/` | 1 | 176 | Home, config qtd/tempo, histórico |
| 4 | `pages/paginaQuiz.js:40` | class `PaginaQuiz` | `/quiz` | 1 | 285 | Simulador core |
| 5 | `pages/adminAnimais.js:9` | class `AdminAnimais` | `/animais` | 2 | 85 | Lista animais, `ModalAnimal` |
| 6 | `pages/feedbacks.js:7` | class `AdminUsuarios` (nome bug) | `/feedbacks` | 2 | 69 | Tabela feedbacks `listarFeedbacksReq` |
| 7 | `pages/adminUsuarios.js:6` | class `AdminUsuario` | `/admin/usuarios` | 3 | 92 | Lista usuários, promover |
| 8 | `pages/index.js:1` | barrel | – | – | 16 | `export {PaginaInicial,Quiz,...}` |

## 2. login.js (`pages/login.js:4`)

**UI:** `div 100vh black` → card `borderRadius 30px` → `Simulador A-FAST` h1 → inputs `email` text, `password` + `errorFeedback` → `Entrar` disabled se vazio → `Link /cadastro`.

**Lógica:** `handleLogin:10` `auth(email,password)` `auth.js:3` → `sessionStorage` 3 keys → `nivelAcesso` switch `ROLE_*` → `window.location.href="/"`. `handleKeyDown:48` Enter.

**Código:**
```js
const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [errorFeedback,setErrorFeedback]=useState('')
// login.js:5
```

## 3. cadastro.js (`pages/cadastro.js:5`)

**UI:** similar login + campo `nome` obrigatório.

**Lógica:** `handleLogin:12` (nome ruim) `cadastrarUsuarioReq({nome,email,password})` `usuarios.js:11` → `.then(auth)` auto-login → `nivelAcesso=1` hardcoded (sempre USER) → `"/"`. Erro `e.msg` `cadastro.js:35`.

**Validação:** `disabled={!nome.length || email.length<6 || password.length<4}` `cadastro.js:95`.

## 4. paginaInicial.js (`pages/paginaInicial.js:10`)

**Class** com state `configModal, newTempo:3, newQtd:1, historico:[]` `paginaInicial.js:14`.

**Métodos:**
- `loadFromStorage:26` lê `sessionStorage config` ou default `{tempo:3,qtd:1}` + `config.config=config` bug.
- `saveConfig:42` → `setItem config`.
- `abrirHistoricoModal:51` → `listarFeedbacksReq(usuario.id)` `feedback.js:3` → `setState historico`.
- `componentDidMount:64` chama `loadFromStorage`.

**Render:**
- `MenuAreas` `paginaInicial.js:71`, título, `Link /quiz` Começar `paginaInicial.js:78`, `Meu Histórico` `onClick abrirHistoricoModal`, `Configurações` `onClick setState configModal:true`.
- **Modal Configurações** `paginaInicial.js:99`: inputs `qtdControl`, `timeControl` (texto, `Number`).
- **Modal Histórico** `paginaInicial.js:137`: tabela `Data Criação`, `Tempo Total`, `CustomFeedbackModal` com `JSON.parse(feed.data)` `paginaInicial.js:155`.

## 5. paginaQuiz.js (`pages/paginaQuiz.js:40`) – Core

**Const:** `JANELAS:5` `[HD:0, ER:1, CC:2, HR:3]` + `API_URL` `paginaQuiz.js:37` `CAMINHO_ARQUIVOS = ${API_URL}/ws/images/`.

**State:** `selectedAnimal:0, selectedArea:-1, perfil:doggo, tempo:180, timer:null, score:0, animais:[], modalFeedback:false` `paginaQuiz.js:45`.

**Métodos:**
- `getAnimais:60` lê `config tempo*60`, `sortearAnimaisReq(qtd)` `animal.js:3` → `setState animais`.
- `componentDidMount:83` `setInterval 1s` decrementa `tempo` ou `abrirModalFeedback` se 0.
- `formatarTempo:105` `mm:ss`.
- `abrirModalFeedback:114` → `enviarFeedback`.
- `enviarFeedback:119` mapeia `animais` → `data JSON.stringify` + `cadastrarFeedbackReq` `feedback.js:8`.

**Render (simplificado):**

```jsx
<div black 100vh>
  <Link to="/">Voltar</Link> + <h1>Simulador</h1>
  Tempo:{formatarTempo()} / Escore:{pontuacaoSugerida}
  {selectedAnimal+1}/{animais.length} + Proximo / Enviar
  <div class="div-geral">
    <div lado-esquerdo>
      {selectedArea!==-1 ? <><label>Tem liquido? {clicked?Sim:Não}</label><Image src={CAMINHO_ARQUIVOS+imgs[selectedArea].caminho} /> : <h4>Procure as areas</h4>}
    </div>
    <div lado-direito>
      <div class="imagem-container"><img src={doggo} 85vh />
        {JANELAS.map(item=> <div className={item.className} onMouseLeave selectedArea=-1 onClick toggle clicked / pontuacaoSugerida>)}</div>
    </div>
  </div>
  <ModalFeedback show={modalFeedback} animais={animais} />
</div>
```

**Interação áreas:** `paginaQuiz.js:253` `onClick` primeiro clique abre imagem (`selectedArea`), segundo clique toggle `imgs[selectedArea].clicked` boolean e atualiza `pontuacaoSugerida` +/-1. `onMouseLeave` `252` fecha. `selectedArea` controla imagem direita `paginaQuiz.js:240` `src={CAMINHO_ARQUIVOS+...}`.

**Bugs:**
- `JANELAS` ordem `HD,ER,CC,HR` diverge de backend `AR E AS [hd,hr,er,cc]` mas não afeta (só label).
- `animal.imgs[selectedArea]` assume `imgs` ordenado 0..3 por `findByAnimalIdOrderByJanela` – ok.
- `paginaQuiz.js:169` `if(!pontuacaoSugerida) pontuacaoSugerida=0` muta prop.
- `paginaQuiz.js:198` `tempAnimais[selectedAnimal].tempo = tempoOriginal-tempo` calcula tempo gasto por animal ao clicar Próximo/Enviar.

## 6. adminAnimais.js (`pages/adminAnimais.js:9`)

**Class** `animais:[]`, `getAnimais:24` `listarAnimaisReq` `animal.js:8`, `deletarAnimal:19` `deletarAnimalReq`.

**Render:** `Container fluid` + `MenuAreas` + `h4 Animais Cadastrados` + `ModalAnimal onCreateEdit:getAnimais` + table `#, Espécie, Status, Escore, Cadastro, Ações` (`options weekday` `adminAnimais.js:7` para `toLocaleString`). Cada linha `ModalAnimal iconButton edit` + trash `bi-trash`.

## 7. adminUsuarios.js (`pages/adminUsuarios.js:6`)

**Class** `usuarios:[]`, `getUsuarios:16` `listarUsuariosReq` `usuarios.js:3`, `promoverUsuario:27` `promoverUsuarioReq` + `reload`.

**Render:** `MenuAreas` + table `#, Nome, Email, Nivel, Data Criação, Ações`. `mostrarRole:41` `ROLE_ADMIN→Administrador` etc. Botão `Promover/Despromover` se `role!==ADMIN`.

## 8. feedbacks.js (`pages/feedbacks.js:7`)

**Class erroneamente `export default class AdminUsuarios`** `feedbacks.js:7` (deveria `FeedbackPage`). `feedbacks:[]`, `getFeedbacks:18` `listarFeedbacksReq()` sem id (todos).

**Render:** `MenuAreas` + `h4 Feedbacks` + table `#, Data, Usuario (string nome), Tempo Total, Ações` com `CustomFeedbackModal feeds={JSON.parse(feed.data)}`.

## 9. index.js barrel (`pages/index.js:1`)

```js
import PaginaInicial from "./paginaInicial"; import Quiz from "./paginaQuiz"; ...
export { PaginaInicial, Quiz, AdminAnimais, FeedbackPage, UsuariosPage, Login, Cadastro }
```

`App.js:3` consome.

## 10. Checklist páginas

- [ ] Renomear `feedbacks.js:7` class `AdminUsuarios` → `FeedbackPage`.
- [ ] Trocar `paginaQuiz` class → function + hooks + `useCallback`.
- [ ] Corrigir `paginaInicial` `config.config` e `paginaQuiz` `tempoOriginal` race.
- [ ] Add `loading`/`empty` states em `adminAnimais` `feedbacks`.

---
*Fontes: `src/pages/*.js`, `src/App.js:3`, `src/components/menuAreas.jsx:4`*
