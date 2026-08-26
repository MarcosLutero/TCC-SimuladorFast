# 03 – Especificação da API

> Base URL: `http://localhost:8080` (`frontend/.env:1` `REACT_APP_API_URL`).  
> Todas as rotas retornam JSON exceto `GET /ws/images/**` ( `image/jpeg`).  
> Auth: `Authorization: Bearer <JWT>` (`security/JwtAuthenticationFilter.java:33`).  
> CORS: `*` com `AllowCredentials:true` (ver `04-security.md`).

## 1. Sumário (18 endpoints)

| # | Método | Path | Auth | Controller:linha | Frontend caller |
|---|--------|------|------|------------------|-----------------|
| 1 | POST | `/auth/login` | `permitAll` | `AuthController.java:28` | `frontend/src/api/auth.js:3` `auth()` |
| 2 | POST | `/usuarios` | `permitAll` | `UsuarioController.java:27` | `frontend/src/api/usuarios.js:11` `cadastrarUsuarioReq` |
| 3 | GET | `/admin/usuarios` | `ROLE_ADMIN` | `UsuarioController.java:43` | `frontend/src/api/usuarios.js:3` `listarUsuariosReq` |
| 4 | POST | `/admin/promover-usuario/{id}` | `ROLE_ADMIN` | `UsuarioController.java:48` | `frontend/src/api/usuarios.js:7` `promoverUsuarioReq` |
| 5 | GET | `/animal` | authenticated | `AnimalController.java:25` | `frontend/src/api/animal.js:8` `listarAnimaisReq` |
| 6 | GET | `/animal/{id}` | authenticated | `AnimalController.java:30` | – |
| 7 | POST | `/animal` | authenticated | `AnimalController.java:35` | `frontend/src/api/animal.js:11` `cadastrarAnimalReq` |
| 8 | PUT | `/animal/{id}` | authenticated | `AnimalController.java:42` | `frontend/src/api/animal.js:14` `atualizarAnimalReq` |
| 9 | DELETE | `/animal/{id}` | authenticated | `AnimalController.java:57` | `frontend/src/api/animal.js:17` `deletarAnimalReq` |
|10 | GET | `/sortear-animais/{quantidade}` | authenticated | `ImagemJanelaController.java:45` | `frontend/src/api/animal.js:3` `sortearAnimaisReq` |
|11 | GET | `/animal/{idAnimal}/imagens` | authenticated | `ImagemJanelaController.java:70` | `frontend/src/api/animal.js:21` `listarImagensAnimalReq` |
|12 | POST | `/animal/{idAnimal}/imagens` | authenticated | `ImagemJanelaController.java:84` | `frontend/src/api/animal.js:24` `cadastrarImagemAnimalReq` (multipart) |
|13 | PUT | `/animal/{idAnimal}/imagens/{idImagem}` | authenticated | `ImagemJanelaController.java:122` | `frontend/src/api/animal.js:27` `atualizarImagemAnimalReq` (multipart) |
|14 | DELETE | `/animal/{idAnimal}/imagens/{idImagem}` | authenticated | `ImagemJanelaController.java:162` | `frontend/src/api/animal.js:31` `deletarImagemAnimalReq` |
|15 | GET | `/ws/images/{urlImagemLocal}` | `permitAll` | `ImagemJanelaController.java:182` | `<img src="${baseUrl}/ws/images/${caminho}">` |
|16 | POST | `/feedbacks` | authenticated | `FeedbackController.java:27` | `frontend/src/api/feedback.js:8` `cadastrarFeedbackReq` |
|17 | GET | `/feedbacks` | authenticated | `FeedbackController.java:39` | `frontend/src/api/feedback.js:3` `listarFeedbacksReq('')` |
|18 | GET | `/feedbacks/{idUsuario}` | authenticated | `FeedbackController.java:47` | `frontend/src/api/feedback.js:3` `listarFeedbacksReq(id)` |

> **Divergência:** Frontend `frontend/src/api/index.js:12` tenta `POST /api/token/refresh/` com `localStorage.refresh` – **não existe** no backend. Refresh nunca funciona; `Api.request:47` tenta recursão infinita em 401.

## 2. Detalhe por endpoint

### POST /auth/login – `AuthController.java:28`

**Request:**
```json
{ "email": "admin@admin.com", "password": "123456" }
```
`LoginRequest.java:9` (`email`, `password`).

**Flow:** `authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email,password))` → `CustomUserDetailsService.loadUserByUsername:19` → `JwtIssuer.issue(userId,email,roles)` (`JwtIssuer.java:17` `exp +1 day`).

**Response 200:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "usuario": { "id":1, "email":"admin@admin.com", "nome":"administrador", "role":"ROLE_ADMIN", "created":"2024-03-25T20:10:33.559+00:00" }
}
```
`LoginResponse.java:10` (`accessToken`, `usuario:UsuarioPOJO`).

**Erros:** 401 se credenciais inválidas (Spring Security default, sem body custom).

**Exemplo curl:**
```bash
curl -X POST http://localhost:8080/auth/login -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"123456"}'
```

### POST /usuarios – `UsuarioController.java:27`

Cria usuário `ROLE_USER` default.

**Request:** `Usuario` JSON (só `email`, `password`, `nome` usados):
```json
{ "email":"novo@ufra.com", "password":"123", "nome":"Novo Aluno" }
```

**Lógica:** `repository.findByEmail(email)` → se `size()>0` 409 `ReturnResponse("Usuario Já Cadastrado",409)` (`UsuarioController.java:30`); senão `role=ROLE_USER`, `password=BCrypt.encode` (`WebSecurityConfig.java:90`), save → `UsuarioPOJO`.

**Response 201:** `UsuarioPOJO` (`UsuarioPOJO.java:14` `id,email,nome,role,created`).

**Erro:** 409 já cadastrado.

### GET /admin/usuarios – `UsuarioController.java:43`

Requer `ROLE_ADMIN` (`WebSecurityConfig.java:45`). Lista todos `Usuario` → `UsuarioPOJO.fromUsuarioToPojo`.

**Response 200:** `[{id,email,nome,role,created},...]`

### POST /admin/promover-usuario/{id} – `UsuarioController.java:48`

Toggle `ROLE_USER ↔ ROLE_TECNICO`. Não promove para `ROLE_ADMIN` (bug/feature).

```bash
curl -X POST http://localhost:8080/admin/promover-usuario/3 -H "Authorization: Bearer $TOKEN"
```

**Response:** 200 `UsuarioPOJO` atualizado ou 404 `ReturnResponse("Usuario não encontrado",404)`.

### GET /animal – `AnimalController.java:25`

**Response:** `List<Animal>` (`Animal.java:12` `id,tipo,cadastro,pontuacao,isActive`).

### GET /animal/{id} – `AnimalController.java:30`

Retorna `Optional<Animal>` – se não encontrado, Spring serializa `null` com 200 (deveria 404). `PUT`/`DELETE` já tratam 404.

### POST /animal – `AnimalController.java:35`

```json
{ "tipo":"cachorro", "pontuacao":0 }
```
Seta `cadastro=new Date()` e `isActive=false` **sempre** (ignora body). Retorna `Animal` salvo.

### PUT /animal/{id} – `AnimalController.java:42`

Update parcial: só `cadastro`, `tipo`, `isActive` se não nulos. Mantém `pontuacao` (calculada via imagens).

### DELETE /animal/{id} – `AnimalController.java:57`

`deleteById(id)` sem verificar existência (pode lançar `EmptyResultDataAccessException` 500 se id inexistente – não tratado).

### GET /sortear-animais/{quantidade} – `ImagemJanelaController.java:45`

**Lógica central do quiz:**
```java
animais = animal_repository.findAllByIsActiveTrue();
shuffle(animais);
for cada animal até qtd:
  imagens = repository.findByAnimalIdOrderByJanela(animal.getId());
  if imagens.size()>0 → new AnimalPOJO(animal, imagens) // AnimalPOJO.java:44
```
`AnimalPOJO` contém `id,pontuacao,tipo,cadastro,isActive, imgs:List<ImagemPOJO>` (`AnimalPOJO.java:14`).

**Response:** `List<AnimalPOJO>` embaralhada.

**Exemplo:** `GET /sortear-animais/5` → 5 animais ativos com imagens.

### GET /animal/{idAnimal}/imagens – `ImagemJanelaController.java:70`

Retorna `AnimalPOJO` com imagens ordenadas por `janela`. 404 `ReturnResponse("Animal não encontrado",404)` se id inválido.

### POST /animal/{idAnimal}/imagens – `ImagemJanelaController.java:84`

**Multipart** (`@RequestParam`):
- `janela: int 0..3` (index em `AREAS=[hd,hr,er,cc]`)
- `temLiquido: boolean`
- `file: MultipartFile` (PNG esperado, `max-file-size 20MB` em `application.yaml:26`)

**Lógica:**
```java
bytes = file.getBytes();
caminho = "animal_" + id + "_" + AREAS.get(janela) + ".png"; // 102
Path path = Paths.get(obterCaminhoPastaArquivos() + caminho); // 35 ClassPathResource
Files.write(path, bytes);
imagemJanela = new ImagemJanela(janela, temLiquido, caminho, animal);
repository.save(imagemJanela);
atualizarPontuacao(animal); // count temLiquido
```
**Response:** 201 `ReturnResponse("Imagem Cadastrada",200)` ou 400 `Arquivo não Encontrado`.

Frontend chama com `frontend/src/api/animal.js:24` `contentType=""`, `stringfyBody:false`.

### PUT /animal/{idAnimal}/imagens/{idImagem} – `ImagemJanelaController.java:122`

Update `janela`, `temLiquido`, opcional `file`. Se `file` presente, deleta antigo `Files.delete(pastaArquivos + imagem.getCaminho())` e escreve novo. Recalcula pontuação.

**Rota registrada sem `/` inicial** (`@PutMapping("animal/...")` linha 122) – funciona mas inconsistente com outros.

### DELETE /animal/{idAnimal}/imagens/{idImagem} – `ImagemJanelaController.java:162`

Deleta arquivo físico + `repository.deleteById`. Usa `repository.getById` (deprecated, deveria `findById`).

### GET /ws/images/{urlImagemLocal} – `ImagemJanelaController.java:182`

```java
@GetMapping(value="/ws/images/{urlImagemLocal}", produces=IMAGE_JPEG_VALUE)
public byte[] carregaImagensDinamicas(@PathVariable String nomeImagem) {
  File f = new File(obterCaminhoPastaArquivos() + nomeImagem);
  return Files.readAllBytes(f.toPath());
}
```
`permitAll` (`WebSecurityConfig.java:44`). Sem cache headers, sem validação path traversal (`../../` possível).

### POST /feedbacks – `FeedbackController.java:27`

```json
{
  "tempoTotal": 68.0,
  "data": "[{\"idAnimal\":12,\"tempo\":13,\"escore\":3,...}]",
  "usuario": {"id":1}
}
```
Seta `createdAt=new Date()` e `save`. Retorna 201 `Feedback criado` ou 400 com exceção.

**Nota:** `usuario` é `@OneToOne @JoinColumn` – JSON precisa só `id`.

### GET /feedbacks – `FeedbackController.java:39`

`repository.findAllByOrderByCreatedAt()` → `FeedbackPOJO.fromFeedbackToPojo` → `[{id,tempoTotal,data,usuario:nome,createdAt}]`.

### GET /feedbacks/{idUsuario} – `FeedbackController.java:47`

Filtra por usuário `findByUsuarioIdOrderByCreatedAt(idUsuario)`.

## 3. Códigos HTTP usados

| Código | Quando | Exemplo |
|--------|--------|---------|
| 200 | GET sucesso, PUT, DELETE Animal/Imagem, login | `ReturnResponse("Imagem Atualizada",200)` |
| 201 | POST create Usuario, Feedback, Imagem | `ResponseEntity.status(201).body(...)` |
| 400 | Feedback save exception, file missing | `ResponseEntity.badRequest()` |
| 401 | Token ausente/inválido, login falho | Spring Security |
| 403 | `ROLE_USER` acessa `/admin/**` | `hasRole ADMIN` |
| 404 | Animal/Imagem/Usuario não encontrado | `ReturnResponse(...,404)` |
| 409 | Usuario já cadastrado | `UsuarioController.java:30` |

Sem padronização de envelope (alguns retornam `POJO`, outros `ReturnResponse`, outros `String`).

## 4. Headers

- **Request:** `Authorization: Bearer <token>` ( `JwtAuthenticationFilter.extractTokenFromRequest:33` verifica `startsWith("Bearer ")` + `substring(7)`), `Content-Type: application/json` ou `multipart/form-data` para imagens.
- **Response:** sem `Cache-Control`, sem `ETag`.

## 5. Gaps para documentar como dívidas

- Sem paginação: `GET /animal`, `GET /feedbacks` podem retornar milhares de linhas.
- Sem validação: `Animal.tipo` aceita `null`, `janela` sem `@Min(0) @Max(3)`, `email` sem `@Email`.
- Sem rate limiting.
- `GET /animal/{id}` retorna `Optional` direto – vaza `empty`.
- `DELETE /animal/{id}` não verifica FK `imagem_janela.animal_id` (pode violar constraint se não cascade).

## 6. Exemplo fluxo completo (quiz)

```bash
TOKEN=$(curl -s -X POST http://localhost:8080/auth/login -H "Content-Type: application/json" -d '{"email":"user@user.com","password":"123456"}' | jq -r .accessToken)

# 1. Sortear 2 animais
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/sortear-animais/2 | jq

# 2. Ver imagens de um animal
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/animal/1/imagens | jq

# 3. Carregar imagem binária
curl http://localhost:8080/ws/images/animal_12_hd.png --output hd.png

# 4. Submeter feedback
curl -X POST http://localhost:8080/feedbacks -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
  -d '{"tempoTotal":13.5,"data":"[{\"idAnimal\":12,\"escore\":2}]","usuario":{"id":1}}'
```

---
*Fontes: `controllers/*.java`, `pojos/*.java`, `frontend/src/api/*.js`, `security/WebSecurityConfig.java:37`*
