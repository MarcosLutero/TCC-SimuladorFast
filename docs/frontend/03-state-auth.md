# Frontend – 03 Estado e Autenticação

## 1. Armazenamento – sessionStorage

| Key | Onde setado | Onde lido | Tipo | Exemplo |
|-----|-------------|-----------|------|---------|
| `access` | `login.js:20` `sessionStorage.setItem('access', resp.accessToken)` | `api/index.js:26` `getItem('access')` para `Authorization: Bearer` | JWT string | `eyJhbG...` |
| `usuario` | `login.js:21` `JSON.stringify({id,email,nome})` | `paginaInicial.js:53` `JSON.parse(getItem("usuario"))`, `paginaQuiz.js:120`, `menuAreas.jsx:13` | JSON | `{"id":1,"email":"admin@...","nome":"administrador"}` |
| `nivelAcesso` | `login.js:37` `setItem("nivelAcesso", 1/2/3)` | `App.js:9` `getItem("nivelAcesso")`, `menuAreas.jsx:12` `parseInt(...)` | string number | `"3"` |
| `config` | `paginaInicial.js:47` `setItem("config", JSON.stringify({tempo,qtd}))` | `paginaInicial.js:27` `loadFromStorage`, `paginaQuiz.js:61` | JSON | `{"tempo":3,"qtd":1}` |
| `refresh` | **nunca setado** | `api/index.js:5` `localStorage.getItem('refresh')` | null | – |

**Inconsistências:**

- `access` em `sessionStorage` (tab-scoped, limpa ao fechar aba) vs `refresh` em `localStorage` (persistente) – `api/index.js:5` vs `26` mistura storages.
- `cadastro.js:23` seta `nivelAcesso=1` hardcoded (sempre USER), `login.js:25` deriva de `role`.
- `logout.jsx:10` `sessionStorage.clear()` limpa tudo, mas não `localStorage.refresh` (que nunca existe).

## 2. Fluxo login (`pages/login.js:10`)

```js
async function handleLogin(){
  setErrorFeedback("")
  auth(email,password) // auth.js:3 POST auth/login hasToken:false
    .then(resp => {
      sessionStorage.setItem('access', resp.accessToken) // login.js:20
      sessionStorage.setItem("usuario", JSON.stringify({id,email,nome})) // 21
      let nivel=0; switch(resp.usuario.role){ case ROLE_ADMIN: nivel=3; ROLE_TECNICO:2; default:1 }
      sessionStorage.setItem("nivelAcesso", nivel) // 37
      window.location.href = "/" // 40 full reload
    })
    .catch(e => { sessionStorage.removeItem("access"); setErrorFeedback("Email e/ou senha inválidos!") })
}
```

- **Trigger:** botão `Entrar` `disabled={!email.length||!password.length}` `login.js:98` + `Enter` `handleKeyDown:48`.
- **Erro:** `setErrorFeedback` exibe `text-danger` `login.js:94`.
- **Sem loading:** sem `isLoading` state, sem debounce.

## 3. Fluxo cadastro (`pages/cadastro.js:12`)

```js
function handleLogin(){ // nome confuso, deveria handleCadastro
  cadastrarUsuarioReq({nome,email,password}) // usuarios.js:11 POST usuarios
    .then(() => auth(email,password) // auto-login
      .then(resp => { sessionStorage.setItem('access', resp.accessToken); setItem("usuario",...); setItem("nivelAcesso",1); window.location.href="/" })
    )
    .catch(e => setErrorFeedback(e.msg)) // cadastro.js:35 e.msg de api/index.js:55
}
```

- Validação: `disabled={!nome.length || email.length<6 || password.length<4}` `cadastro.js:95`.
- Erro 409 `Usuario Já Cadastrado` (`UsuarioController.java:30`) cai em `setErrorFeedback(e.msg)`.

## 4. PrivateRoute (`App.js:5`) e MenuAreas (`menuAreas.jsx:11`)

Ver `02-routes.md` §3. Ambos leem `nivelAcesso` string, `menuAreas.jsx:12` faz `parseInt` correto, `App.js:13` compara string direto.

## 5. Configuração do quiz (`pages/paginaInicial.js:26` + `paginaQuiz.js:60`)

**Salvar:** `paginaInicial.js:42` `saveConfig()` pega `state.newTempo/newQtd` → `sessionStorage config`.

**Carregar Quiz:** `paginaQuiz.js:60`:
```js
let config = JSON.parse(sessionStorage.getItem("config")) // 61
if(!config) config={tempo:180,qtd:1} // 62 fallback
else config.tempo = config.tempo *60 // 69 minutos → segundos
this.setState({tempo: config.tempo}) // 72
sortearAnimaisReq(config.qtd) // 74
```

- **Bug:** `paginaInicial.js:32` `config.config = config` (auto-referência) e `loadFromStorage:26` lê `config` mas `paginaInicial` default `tempo:3, qtd:1` vs `paginaQuiz` default `tempo:180` (3*60) – inconsistente se `config` ausente.
- `paginaInicial` inputs `type text` `paginaInicial.js:104` sem `type=number`, `Number(e.target.value)` pode dar `NaN`.

## 6. Timer e estado do quiz (`pages/paginaQuiz.js:40`)

```js
state = { selectedAnimal:0, selectedArea:-1, perfil:doggo, tempo:180, timer:null, score:0, animais:[], modalFeedback:false } // 45
componentDidMount(){ this.getAnimais(); setInterval(()=> this.setState({tempo: tempo-1}),1000) } // 83
componentWillUnmount(){ clearInterval(timer) } // 99
formatarTempo(){ minutes:seconds } // 105
```

- **Bug:** `flag` `paginaQuiz.js:58` evita double `setInterval` em `StrictMode`, mas `componentDidMount` sem cleanup em `getAnimais` – se `sortearAnimaisReq` falhar, timer continua.
- `tempoOriginal` setado em `componentDidMount:87` via `setState` mas `this.state.tempo` ainda 180 (race) – deveria derivar de `config.tempo`.
- **Mutação direta:** `paginaQuiz.js:258` `animaisTemp[selectedAnimal].pontuacaoSugerida = score` + `temp.imgs[selectedArea].clicked = !...` muta `state.animais` sem cópia (anti-pattern React, pode não re-renderizar).
- **Sem persistência:** refresh perde `animais` e `tempo` (não salva em storage).

## 7. Feedback – envio (`pages/paginaQuiz.js:119`)

```js
let usuario = JSON.parse(sessionStorage.getItem("usuario")) // 120
let data = animais.map(animal => {
  let escore=0; [0,1,2,3].map(_=>{
    let {temLiquido,clicked}=animal.imgs[_]; // 129
    escore = clicked?escore+1:escore // 138
    return {janela: JANELAS[_], resposta: clicked===undefined?"Sem resposta": clicked?"Tem líquido":"Não tem líquido", respostaCorreta: temLiquido?"Tem líquido":"Não tem líquido"}
  })
  return {idAnimal:animal.id, tempo:animal.tempo, escore, escoreCorreto:animal.pontuacao, janelas: janelasData}
})
cadastrarFeedbackReq({usuario, tempoTotal, data:JSON.stringify(data)}) // 155
```

Mapeia `JANELAS` `paginaQuiz.js:14` `[HD:0, ER:1, CC:2, HR:3]` – **ordem diverge do backend** `ImagemJanelaController.java:37` `[hd:0, hr:1, er:2, cc:3]` (ER/HR trocados) mas frontend usa `JANELAS` só para label, backend usa `AREAS` para salvar.

## 8. Api layer (`api/index.js:1`) e auth

Ver `06-api-contract.md`. `request:21` lê `sessionStorage access` e injeta `Bearer`. Em 401, tenta `refreshToken` (inexistente) e recursa `Api.request` → loop.

**Sem interceptor global** – cada `api/*.js` chama `Api.request` direto, sem `transformResponse` central.

## 9. Logout (`components/logout.jsx:8`)

```js
onClick(e=>{ e.preventDefault(); sessionStorage.clear(); window.location.href='/login' })
```

Limpa `access`, `usuario`, `nivelAcesso`, `config`. Não limpa `localStorage`.

## 10. Checklist estado

- [ ] Unificar storage (`sessionStorage` ou `localStorage` + `httpOnly` cookie).
- [ ] Trocar `window.location.href` por `useNavigate`.
- [ ] Validar JWT expiração (`jwt-decode` + `exp` check em `PrivateRoute`).
- [ ] Corrigir `config.config` auto-ref e `tempo` *60 só uma vez.
- [ ] Evitar mutação direta `state.animais[...].clicked`.
- [ ] Add `isLoading`/`error` states em login/cadastro/quiz.

---
*Fontes: `src/pages/login.js:1`, `cadastro.js:1`, `paginaInicial.js:26`, `paginaQuiz.js:40`, `src/components/logout.jsx:1`, `src/api/index.js:1`, `src/components/menuAreas.jsx:11`*
