# 08 – Dívida Técnica (Tech Debt)

> Priorizado P0 (quebra build/prod) → P3 (melhoria). Cada item tem `arquivo:linha` e esforço estimado.

## P0 – Quebra produção / build

| ID | Título | Arquivo:linha | Descrição | Esforço | Consequência se não fizer |
|----|--------|---------------|-----------|---------|---------------------------|
| P0-01 | Dockerfile ENTRYPOINT inválido | `Dockerfile:2` | `["mvn","-jar","/app.jar"]` deveria ser `java -jar` | 30m | Container não sobe em prod |
| P0-02 | application.yaml placeholders não resolvem env | `application.yaml:4` `{bdHOST}` | Spring não interpola `{bdHOST}` sem `$` | 30m | `jdbc:postgresql://{bdHOST}` → `Connection refused` fora do Maven manual |
| P0-03 | CORS `*` + `allowCredentials:true` | `security/WebSecurityConfig.java:64` | Browser bloqueia `Access-Control-Allow-Origin: *` com credenciais | 15m | Frontend falha em prod com cookie/auth |
| P0-04 | Secret JWT hardcoded no repo | `application.yaml:31` | `verysecretkey...` no git | 1h | Vazamento, rotação impossível, não atende LGPD |
| P0-05 | Storage em classpath | `controllers/ImagemJanelaController.java:35` `ClassPathResource("arquivos/")` | Writes em `target/classes` efêmero / read-only em jar | 4h | Perda de imagens em redeploy |
| P0-06 | inserts.sql sintaxe inválida | `src/main/resources/arquivos/inserts.sql:8` | `insert into animal values (1, 2024-01-22 ...)` sem quotes, ordem colunas errada | 1h | Seed falha, FK animal 12/24 inexistente |

## P1 – Bugs funcionais / segurança

| ID | Título | Arquivo:linha | Descrição | Esforço |
|----|--------|---------------|-----------|---------|
| P1-01 | `@OneToOne` deveria ser `@ManyToOne` | `models/ImagemJanela.java:24`, `models/Feedback.java:27` | 1 animal tem 4 imagens, 1 usuário tem N feedbacks | 2h + migration |
| P1-02 | Path traversal em /ws/images | `controllers/ImagemJanelaController.java:182` `new File(pasta+nome)` | `GET /ws/images/../../application.yaml` | 1h |
| P1-03 | `janela` sem validação bounds | `controllers/ImagemJanelaController.java:102` `AREAS.get(janela)` | `janela=99` → 500 | 30m |
| P1-04 | `Usuario.role` string livre sem enum | `models/Usuario.java:28` | `role="batman"` aceito, `hasRole("ADMIN")` desencontrado com `ROLE_ADMIN` | 2h |
| P1-05 | `UsuarioRepository.findByEmail` retorna List | `repositories/UsuarioRepository.java:12` | Permite duplicatas, `CustomUserDetailsService:19` `orElseThrow()` sem msg → 500 | 30m |
| P1-06 | `DELETE /animal/{id}` sem checar existência | `controllers/AnimalController.java:57` `deleteById` | 500 `EmptyResultDataAccessException` se id não existe | 30m |
| P1-07 | `GET /animal/{id}` retorna Optional direto | `controllers/AnimalController.java:30` | 200 com `null` em vez de 404 | 15m |
| P1-08 | `Feedback.data` TEXT sem validação | `models/Feedback.java:22` | JSON inválido salvo, `RelatorioPOJO.java:26` nunca valida | 2h (JSONB + @Valid) |
| P1-09 | `WebSecurityConfig:45` `hasRole("ADMIN")` vs `ROLE_ADMIN` | `security/WebSecurityConfig.java:45` | Funciona por prefixo, mas confuso; `ROLE_TECNICO` não tem rota | 15m doc |
| P1-10 | Frontend refresh token endpoint inexistente | `TCC-SimuladorFast/frontend/src/api/index.js:12` `/api/token/refresh/` | Loop infinito em 401, `localStorage.refresh` nunca setado | 1h (remover ou implementar) |
| P1-11 | `Files.delete` sem tratamento | `controllers/ImagemJanelaController.java:135,165` | `catch(Exception){}` vazio, `getById` deprecated | 30m |
| P1-12 | `produces=IMAGE_JPEG_VALUE` para PNG | `controllers/ImagemJanelaController.java:182` | Content-Type errado | 10m |

## P2 – Qualidade / manutenibilidade

| ID | Título | Arquivo:linha | Descrição | Esforço |
|----|--------|---------------|-----------|---------|
| P2-01 | `UsuarioServiceImpl.java` vazio (0 linhas) | `services/UsuarioServiceImpl.java:1` | Classe morta | 10m (deletar) |
| P2-02 | Duplicata `ApplicationTests` pacote errado | `src/test/java/br/com/ufra/simulator/afast/ApplicationTests.java:1` vs `simulator_afast` | Confusão | 10m |
| P2-03 | `RelatorioPOJO` dead code | `pojos/RelatorioPOJO.java:12` | Nunca usado em controller, só exemplo parse | 30m (usar ou deletar) |
| P2-04 | Sem `spring-boot-starter-validation` | `pom.xml:19` | `@Validated` em `AuthController:29` sem efeito | 1h |
| P2-05 | Sem paginação | `controllers/AnimalController.java:25` `findAll()` | `GET /animal`, `/feedbacks` podem retornar milhares | 2h |
| P2-06 | Sem OpenAPI / Swagger | – | Sem `springdoc-openapi` | 1h |
| P2-07 | `jackson-databind` pin 2.12.7.1 | `pom.xml:76` | Já vulnerável, parent 2.7.15 gerencia 2.13.5 | 15m (remover version) |
| P2-08 | `org.jetbrains:annotations:RELEASE` | `pom.xml:57` | Não determinístico | 10m fixar `24.1.0` |
| P2-09 | `application.yaml` sem profiles | `src/main/resources/application.yaml:1` | Sem `application-dev.yaml`/`prod.yaml` | 1h |
| P2-10 | `pontuacao` armazenada derivada | `models/Animal.java:26` | Poderia ser `@Formula` ou calculada | 1h |
| P2-11 | `Usuario.password` sem length, `email` sem unique | `models/Usuario.java:13` | Sem `@Column(length=60)`, sem `unique` | 30m |
| P2-12 | Logs `System.out.println` | `controllers/ImagemJanelaController.java:117,128`, `FeedbackController:39` commented | Sem SLF4J | 30m |
| P2-13 | `postgres:9.6` EOL | `postgres/docker-compose.yml:5` | Sem patches desde 2021 | 30m → 15 |

## P3 – Melhorias / nice to have

| ID | Título | Descrição | Esforço |
|----|--------|-----------|---------|
| P3-01 | Add `actuator` + healthcheck | Sem `/health` para Docker/K8s | 1h |
| P3-02 | Add `Flyway` migrations | Trocar `ddl-auto:update` → `validate` | 4h |
| P3-03 | Extrair `StorageService` interface | Desacoplar `ImagemJanelaController` de `Files` | 3h |
| P3-04 | Add `Pageable` e `Sort` | `findAllByOrderByCreatedAt` → `Pageable` | 2h |
| P3-05 | Add `GlobalExceptionHandler` (`@ControllerAdvice`) | Padronizar `ReturnResponse` vs `POJO` vs `String` | 2h |
| P3-06 | Add `CORS` `FRONTEND_URL` env | Em vez de `*` | 30m |
| P3-07 | Add `RateLimiter` em login | `POST /auth/login` | 2h |
| P3-08 | Add `H2` para testes + `testFailureIgnore=false` | `pom.xml:100` | 1h |
| P3-09 | Documentar `Animal.tipo` enum (cachorro/gato) | Hoje string livre | 30m |
| P3-10 | Add `Cache-Control` em `/ws/images` | Sem cache hoje | 30m |

## Gráfico esforço vs impacto

```
Impacto ↑
   P0 ██████████  (quebra prod)
   P1 ████████    (bug/segurança)
   P2 █████       (manutenção)
   P3 ██         (melhoria)
         ──────── Esforço →
```

## Ordem sugerida de execução (sprints)

**Sprint 0 (antes de qualquer feature):** P0-01, P0-02, P0-04, P0-06 (build volta a funcionar).

**Sprint 1:** P0-03, P0-05 (StorageService interface local), P1-02, P1-03, P1-05, P1-07.

**Sprint 2:** P1-01 (ManyToOne + Flyway V2), P1-04, P2-04 (validation), P2-08, P2-09.


---
---
*Fontes: todos `*.java`, `*.yaml`, `*.yml`, `Dockerfile`, `inserts.sql`, `frontend/src/api/index.js`*
