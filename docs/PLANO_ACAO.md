# Plano de Ação – Melhorias Simulador A-Fast (sem Supabase)

> **Data:** 2026-08-26  
> **Repos:** `simulador-afast-backend` (Spring) + `TCC-SimuladorFast/frontend` (React)  
> **Base:** `backend/08-tech-debt.md` + `frontend/07-tech-debt.md` (P0→P3)  
> **Objetivo:** estabilizar, corrigir bugs críticos e melhorar manutenibilidade antes de qualquer feature nova. Sem troca para Supabase.

## Como usar este plano

- **Fases sequenciais:** Fase 0 deve estar 100% antes de Fase 1, etc. Cada fase é PR(s) separado.
- **Critério “done”:** build `mvn verify` + `npm run build` + manual `curl`/`http://localhost:3000` sem 500 e sem perda de imagens.
- **Estimativa:** 1 pessoa. `d=dias`, `h=horas`.

---

## Fase 0 – Estabilização (P0) – 4 dias

> Se não fizer, prod não sobe.

| # | ID | Título | Arquivo:linha | Ação | Estim. |
|---|----|--------|---------------|------|--------|
| 0.1 | P0-01 | Dockerfile ENTRYPOINT | `Dockerfile:2` | Trocar `["mvn","-jar"]` → `["java","-jar","/app.jar"]`, multi-stage `backend/05-configuration.md` §5 | 4h |
| 0.2 | P0-02 | `application.yaml` placeholders | `application.yaml:4` `{bdHOST}` | Migrar para `${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:simulador}` etc., criar `.env.example` | 4h |
| 0.3 | P0-04 | Secret JWT hardcoded | `application.yaml:31` | Externalizar para `JWT_SECRET` env, `openssl rand -base64 32`, remover do git | 2h |
| 0.4 | P0-06 | `inserts.sql` inválido | `arquivos/inserts.sql:8` | Reescrever com quotes e ordem colunas `02-data-model.md` §5, corrigir FK 12/24 | 4h |
| 0.5 | P0-05 | Storage classpath | `ImagemJanelaController.java:35` | Criar `./uploads` fora do classpath + `STORAGE_PATH` env, sem interface ainda (só mudar `obterCaminhoPastaArquivos` para `Paths.get(env)`) – interface completa na Fase 1 | 1d |
| 0.6 | P0-F01 | `Api.refreshToken` loop | `frontend/src/api/index.js:12` | Remover `refreshToken` + em `request:47` 401 → `sessionStorage.clear()` + `navigate('/login')` | 4h |
| 0.7 | P0-F03 | `PrivateRoute` string comp | `frontend/src/App.js:13` | `parseInt(sessionStorage.getItem('nivelAcesso'),10)` | 1h |
| 0.8 | P0-03 | CORS `*`+credentials | `WebSecurityConfig.java:64` | `FRONTEND_URL` env, `setAllowedOriginPatterns(List.of(frontendUrl))` | 2h |

**Entregável Fase 0:** `mvn package` gera jar executável + `docker compose up` sobe sem editar yaml manualmente + login→quiz→feedback funciona sem 401 loop.

---

## Fase 1 – Bugs Críticos (P1) – 5 dias

| # | ID | Título | Arquivo:linha | Ação |
|---|----|--------|---------------|------|
| 1.1 | P1-02 | Path traversal `/ws/images` | `ImagemJanelaController.java:182` | Validar regex `^animal_\d+_(hd\|hr\|er\|cc)\.png$` + `Path.normalize().startsWith(base)` |
| 1.2 | P1-03 | `janela` bounds | `ImagemJanelaController.java:102` | `@RequestParam @Min(0) @Max(3)` + `AREAS.get` try/catch → 400 |
| 1.3 | P1-F01 | `modalAnimal.jsx:289` typo `temliquido` | `components/modalAnimal.jsx:289` | `temliquido` → `temLiquido` |
| 1.4 | P1-F02 | `modalAnimal getImagens resp.data` | `modalAnimal.jsx:40` | Usar `resp` campos `id,tipo` direto, não `resp.data` |
| 1.5 | P1-07 | `GET /animal/{id}` Optional | `AnimalController.java:30` | `findById.map(ResponseEntity::ok).orElse(notFound())` |
| 1.6 | P1-06 | `DELETE /animal/{id}` 500 | `AnimalController.java:57` | Checar `existsById` antes ou `try delete` → 404 |
| 1.7 | P1-05 | `UsuarioRepository findByEmail List` | `repositories/UsuarioRepository.java:12` | `Optional<Usuario> findByEmail` + `@Column(unique=true)` + migration |
| 1.8 | P1-F03 | `paginaInicial config.config=self` | `pages/paginaInicial.js:37` | Remover linha auto-ref |
| 1.9 | P1-F04 | `paginaQuiz tempoOriginal race` | `pages/paginaQuiz.js:87` | `tempoOriginal = config.tempo` direto, não `this.state.tempo` |
| 1.10 | P1-F05 | `paginaQuiz mutação state` | `pages/paginaQuiz.js:258` | Clonar `[...animais]` + `map` + spread antes de set |
| 1.11 | P1-04 | `Usuario.role` string livre | `models/Usuario.java:28` | Criar `enum Role {ROLE_ADMIN,ROLE_TECNICO,ROLE_USER}` + `mostrarRole` já em `adminUsuarios.js:41` |
| 1.12 | P1-01 | `OneToOne → ManyToOne` | `ImagemJanela.java:24`, `Feedback.java:27` | Trocar anotação + `ddl-auto:validate` + `Flyway V2__fix_relations.sql` |
| 1.13 | P1-08 | `Feedback.data` sem validação | `Feedback.java:22` | Add `@NotBlank` + `jackson` `JsonNode` validate, preparar `jsonb` futuro |
| 1.14 | P1-11/F02 | `Files.delete` + `temLiquido` | `ImagemJanelaController.java:135` | `try/catch` com `log.error`, não vazio |
| 1.15 | P1-F08 | `PrivateRoute level0` login | `App.js:39` | Se `nivelAcesso>=1` e path `/login|/cadastro` → `Navigate to="/"` |

**Extra Fase 1:** extrair `StorageService` interface (`06-file-storage.md` §4) com `LocalStorageService` (`./uploads`) – resolve F01 definitivamente.

---

## Fase 2 – Qualidade (P2) – 4 dias

| # | ID | Título | Ação |
|---|----|--------|------|
| 2.1 | P2-04 | `validation` | Add `spring-boot-starter-validation` + `@NotNull @Email @Size` em `Usuario`, `Animal`, `LoginRequest` |
| 2.2 | P2-05 | Paginação | `AnimalController:25` `Pageable`, `FeedbackController:39` `Page<FeedbackPOJO>` com `?page&size` |
| 2.3 | P2-08 | `RELEASE` pin | `pom.xml:57` `24.1.0` |
| 2.4 | P2-F02 | `window.location` → `useNavigate` | `login.js:40`, `adminUsuarios.js:30`, `modalAnimal.jsx:251`, `modalFeedback.jsx:84` |
| 2.5 | P2-F01 | Class → hooks | `paginaInicial.js:10`, `paginaQuiz.js:40` migrar para function + `useState/useEffect` |
| 2.6 | P2-F04/05/06 | Limpeza | Deletar `Topo.js`, `_index.css`, `drawer.jsx`, `axios`/`react-icons` mortos, `UsuarioServiceImpl.java` 0 linhas |
| 2.7 | P2-09 | Profiles `application-dev/prod.yaml` | Criar 2 arquivos, `prod` com `ddl-auto:validate` |
| 2.8 | P2-F10/12 | `menuAreas` + `env-cmd` | `useLocation`, remover `env-cmd` `package.json:25` |

---

## Fase 3 – Operação e Docs (P3 + guias) – 2 dias

| # | ID | Ação |
|---|----|------|
| 3.1 | P3-01/P3-02 | `actuator` + `Flyway` |
| 3.2 | P3-05 | `GlobalExceptionHandler` `@ControllerAdvice` padroniza `ReturnResponse` |
| 3.3 | `08-tech-debt` | `postgres:9.6` → `15-alpine` + healthcheck `05-configuration.md` §6 |
| 3.4 | Guias | Já criados `docs/guias/instalacao.md, configuracao.md, uso.md, desenvolvimento.md` – validar com Fase 0/1 |
| 3.5 | README | Atualizar `README.md` raiz com `docker compose up` pós-fix |

---

## Ordem de execução visual

```
Fase 0 (4d) ████████  P0 estabiliza
Fase 1 (5d) ██████████ P1 + StorageService
Fase 2 (4d) ████████  P2 qualidade
Fase 3 (2d) ████      P3 + guias
```

**Total:** ~15 dias úteis 1 dev (3 semanas).

## Critérios de aceite

- `mvn verify -Dspring.profiles.active=test` passa (H2) + `npm run build` sem warnings.
- `curl` login + `GET /sortear-animais/1` retorna `AnimalPOJO` com 4 `imgs` ordenadas.
- Upload `POST /animal/1/imagens` persiste em `./uploads/animal_1_hd.png` e sobrevive a `docker compose restart`.
- `GET /ws/images/../application.yaml` → 400 (não vaza).
- Docs `guias/instalacao.md` seguido do zero por nova pessoa sem perguntar.

## Próximos passos imediatos (você decide)

1. Aprovar este plano (ou ajustar fases).
2. Eu começo pela **Fase 0.2** (`application.yaml` placeholders) como primeiro PR.

---
*Base: `backend/08-tech-debt.md`, `frontend/07-tech-debt.md`, `backend/05-configuration.md`, `guias/*`*
