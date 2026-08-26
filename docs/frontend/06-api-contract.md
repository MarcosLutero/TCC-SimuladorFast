# Frontend – 06 Contrato API

> `baseUrl = process.env.REACT_APP_API_URL` (`frontend/src/api/index.js:1`)  
> `REACT_APP_API_URL=http://localhost:8080` (`frontend/.env:1`)  
> Todos `api/*.js` usam `Api.request(method, endpoint, {body, contentType, hasToken, params})` (`api/index.js:21`)

## 1. Api base (`api/index.js:1`)

```js
const baseUrl = process.env.REACT_APP_API_URL // 1
const Api = {
  refreshToken: async () => {
    const refresh = localStorage.getItem('refresh') // 5
    const response = await fetch(`${baseUrl}/api/token/refresh/`, {method:'POST', body:JSON.stringify({refresh})}) // 12
    const data = await response.json(); localStorage.setItem('access', data.access) // 15
  },
  request: (method, endpoint, {params={}, body, contentType='application/json', hasToken=true, stringfyBody=true}) => {
    let url = `${baseUrl}/${endpoint}` // 24
    const token = sessionStorage.getItem('access') // 26
    const uri = new URL(url); uri.search = new URLSearchParams(params).toString() // 28
    const headers = {}; if(contentType!=="") headers['Content-Type']=contentType // 33
    if(hasToken && token) headers['Authorization']=`Bearer ${token}` // 37
    if(body) requestOptions.body = stringfyBody?JSON.stringify(body):body // 40
    const response = await fetch(uri, {method, headers, body}) // 43
    if(response.ok) resolve(await response.json()) // 45
    else if(status===401){ await Api.refreshToken(); resolve(await Api.request(...)) } // 47 recursão
    else reject({msg: responseJson.msg, status}) // 53
  }
}
export { Api, baseUrl } // 64
```

**Divergências já em `backend/docs/10-frontend-integration.md` I01–I04 – repetir para frontend:**

- `POST /api/token/refresh/` não existe no backend (`AuthController.java:28` só `/auth/login`). `refreshToken` nunca funciona, `localStorage refresh` nunca setado.
- Em 401, `Api.request` recursa sem limite → loop se refresh falha 404.
- `baseUrl + "/" + endpoint` → se `REACT_APP_API_URL` terminar com `/`, duplo `//`.

## 2. Módulos

### animal.js (`api/animal.js:1`)

```js
import {Api} from "."
export function sortearAnimaisReq(qtd){ return Api.request("GET",`sortear-animais/${qtd}`,{}) } // 3 GET /sortear-animais/:qtd
export function listarAnimaisReq(){ return Api.request("GET",`animal/`,{}) } // 8 GET /animal/
export function cadastrarAnimalReq(body){ return Api.request("POST",`animal/`,{body}) } // 11 POST /animal/
export function atualizarAnimalReq(id,body){ return Api.request("PUT",`animal/${id}`,{body}) } // 14 PUT /animal/:id
export function deletarAnimalReq(id){ return Api.request("DELETE",`animal/${id}`,{}) } // 17 DELETE /animal/:id
export function listarImagensAnimalReq(idAnimal){ return Api.request("GET",`animal/${idAnimal}/imagens`,{}) } // 21 GET /animal/:id/imagens
export function cadastrarImagemAnimalReq(idAnimal,body){ return Api.request("POST",`animal/${idAnimal}/imagens`,{body, stringfyBody:false, contentType:""}) } // 24 POST multipart
export function atualizarImagemAnimalReq(idAnimal,idImagem,body){ return Api.request("PUT",`animal/${idAnimal}/imagens/${idImagem}`,{body, stringfyBody:false, contentType:""}) } // 27 PUT multipart
export function deletarImagemAnimalReq(idAnimal,idImagem){ return Api.request("DELETE",`animal/${idAnimal}/imagens/${idImagem}`,{}) } // 31 DELETE
```

- `cadastrar/atualizarImagem` usa `FormData` (`modalAnimal.jsx:113` `formData.append("janela",...)`) com `contentType=""` para browser setar `multipart/form-data; boundary`.
- Backend espera `POST /animal/{id}/imagens` com `@RequestParam janela, temLiquido, file` `ImagemJanelaController.java:84`.

### auth.js (`api/auth.js:1`)

```js
export function auth(email,pwd){ return Api.request("POST","auth/login",{body:{email,password:pwd}, hasToken:false}) } // 3
export function getUsuario(){ return Api.request("GET","usuario",{}) } // 7 GET /usuario → 404 (não existe, deveria ser /admin/usuarios ou /usuarios/me)
```
`getUsuario` nunca usado (grep sem caller).

### feedback.js (`api/feedback.js:1`)

```js
export function listarFeedbacksReq(id=''){ console.log("a  ",id); return Api.request("GET",`feedbacks/${id}`,{}) } // 3 GET /feedbacks/:id? '' → /feedbacks/ (lista todos), id → /feedbacks/{idUsuario}
export function cadastrarFeedbackReq(body){ return Api.request("POST",`feedbacks/`,{body}) } // 8 POST /feedbacks/
```
Backend: `FeedbackController.java:39` `GET /feedbacks` (todos, `findAllByOrderByCreatedAt`), `GET /feedbacks/{idUsuario}` `findByUsuarioIdOrderByCreatedAt`.

### usuarios.js (`api/usuarios.js:1`)

```js
export function listarUsuariosReq(){ return Api.request("GET",`admin/usuarios`,{}) } // 3 GET /admin/usuarios (ROLE_ADMIN)
export function promoverUsuarioReq(id){ return Api.request("POST",`admin/promover-usuario/${id}`,{}) } // 7 POST toggle
export function cadastrarUsuarioReq(body){ return Api.request("POST",`usuarios`,{body}) } // 11 POST /usuarios (permitAll)
```

Backend `UsuarioController.java:27` `POST /usuarios` retorna 409 se `findByEmail size>0`.

### Imagens estáticas

Não via `api/*`, mas `<img src={`${API_URL}/ws/images/${caminho}`}>` `paginaQuiz.js:240` `CAMINHO_ARQUIVOS=${API_URL}/ws/images/` e `modalAnimal.jsx:250` `window.open(url)`. Backend `ImagemJanelaController.java:182` `GET /ws/images/{url}` permitAll `produces=IMAGE_JPEG_VALUE`.

## 3. Tabela contrato completo (frontend → backend)

| # | Frontend caller | Método | Path | Backend controller:linha | Req body | Resp | Erro |
|---|-----------------|--------|------|--------------------------|----------|------|------|
| 1 | `auth` | POST | `auth/login` | `AuthController:28` | `{email,password}` | `{accessToken, usuario:{id,email,nome,role,created}}` | 401 |
| 2 | `getUsuario` | GET | `usuario` | **404** | – | – | – |
| 3 | `cadastrarUsuarioReq` | POST | `usuarios` | `UsuarioController:27` | `{nome,email,password}` | `UsuarioPOJO` 201 | 409 |
| 4 | `listarUsuariosReq` | GET | `admin/usuarios` | `UsuarioController:43` `hasRole ADMIN` | – | `UsuarioPOJO[]` | 403 |
| 5 | `promoverUsuarioReq` | POST | `admin/promover-usuario/:id` | `UsuarioController:48` | – | `UsuarioPOJO` | 404 |
| 6 | `listarAnimaisReq` | GET | `animal/` | `AnimalController:25` | – | `Animal[]` | 401 |
| 7 | `cadastrarAnimalReq` | POST | `animal/` | `AnimalController:35` | `{tipo}` (isActive false auto) | `Animal` 201 | 401 |
| 8 | `atualizarAnimalReq` | PUT | `animal/:id` | `AnimalController:42` | `{tipo,isActive}` | `Animal` | 404 |
| 9 | `deletarAnimalReq` | DELETE | `animal/:id` | `AnimalController:57` | – | `ReturnResponse` | 500 se FK |
|10| `sortearAnimaisReq` | GET | `sortear-animais/:qtd` | `ImagemJanelaController:45` | – | `AnimalPOJO[]` (`imgs`) | 401 |
|11| `listarImagensAnimalReq` | GET | `animal/:id/imagens` | `ImagemJanelaController:70` | – | `AnimalPOJO` | 404 |
|12| `cadastrarImagemAnimalReq` | POST | `animal/:id/imagens` multipart | `ImagemJanelaController:84` | `FormData janela,temLiquido,file` | `ReturnResponse` 201 | 400 |
|13| `atualizarImagemAnimalReq` | PUT | `animal/:id/imagens/:img` multipart | `ImagemJanelaController:122` | `FormData` | `ReturnResponse` | 404 |
|14| `deletarImagemAnimalReq` | DELETE | `animal/:id/imagens/:img` | `ImagemJanelaController:162` | – | `ReturnResponse` | 404 |
|15| `GET ws/images` | GET | `ws/images/:nome` | `ImagemJanelaController:182` permitAll | – | `byte[]` | 404 |
|16| `listarFeedbacksReq('')` | GET | `feedbacks/` | `FeedbackController:39` | – | `FeedbackPOJO[]` | 401 |
|17| `listarFeedbacksReq(id)` | GET | `feedbacks/:idUsuario` | `FeedbackController:47` | – | `FeedbackPOJO[]` | 401 |
|18| `cadastrarFeedbackReq` | POST | `feedbacks/` | `FeedbackController:27` | `{tempoTotal,data:JSON.string, usuario:{id}}` | 201 | 400 |

**Sem paginação, sem query params, sem headers custom além de Authorization.**

## 4. Axios vs fetch

`package.json:15` `axios 0.27.2` instalado mas `api/index.js:14` usa `fetch`. Axios teria interceptors para 401 + `withCredentials`. Migração para `axios.create({baseURL, headers})` reduziria `Api.request` boilerplate.

---
*Fontes: `frontend/src/api/*.js`, `frontend/.env:1`, `simulador-afast-backend/src/main/java/.../controllers/*.java`*
