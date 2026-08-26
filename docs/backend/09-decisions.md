# 09 – Decisões de Arquitetura (ADRs)

> Formato: Título, Contexto, Decisão, Consequências. Status `Adotado` = vigente, `Proposto` = recomendado para futuro.

## ADR-001 – Spring Boot 2.7 + Java 11

- **Status:** Adotado ( `pom.xml:5` `parent 2.7.15`, `java.version 11` `pom.xml:17` )
- **Contexto:** Projeto TCC UFRA 2024, JDK 11 LTS, Spring Boot estável.
- **Decisão:** Usar Spring Boot 2.7.15, não 3.x (requer Java 17+).
- **Consequências:** `javax.persistence.*` (não `jakarta`), `postgres:9.6` compatível. Para migrar para Java 17/Spring 3, trocar imports `javax` → `jakarta` e atualizar `pom.xml`.

## ADR-002 – JPA `ddl-auto: update` em vez de Flyway/Liquibase

- **Status:** Adotado (`application.yaml:11` `ddl-auto: update`)
- **Contexto:** Prototipagem rápida TCC, sem DBA.
- **Decisão:** Deixar Hibernate criar/alterar schema automaticamente.
- **Consequências:** Rápido para dev, mas **arriscado em prod** (pode dropar coluna, não versiona). Ver `08-tech-debt.md` P3-02 propõe `validate` + Flyway.

## ADR-003 – JWT com auth0 `java-jwt` (HMAC) em vez de Spring OAuth2

- **Status:** Adotado (`pom.xml:65` `java-jwt:4.2.2`, `security/JwtIssuer.java:17`)
- **Contexto:** Auth simples sem provedor externo, sem refresh.
- **Decisão:** Implementar `JwtIssuer`, `JwtDecoder`, `JwtToPrincipalConverter`, `JwtAuthenticationFilter` manualmente.
- **Consequências:** Controle total, mas sem `jti`, `iss`, `refresh`, sem blacklist. Sem refresh token; considerar adicionar se necessário.

## ADR-004 – Armazenamento de imagens no classpath `src/main/resources/arquivos/`

- **Status:** Adotado (`controllers/ImagemJanelaController.java:35` `ClassPathResource("arquivos/")`)
- **Contexto:** TCC sem infra S3, 8 imagens seed pequenas.
- **Decisão:** Salvar PNGs como `animal_{id}_{area}.png` no filesystem do classpath.
- **Consequências:** Funciona em `mvn spring-boot:run` com volume, mas **quebra em jar** e perde dados em container (ver `06-file-storage.md` F01, `08-tech-debt.md` P0-05). ADR futuro: extrair `StorageService`.

## ADR-005 – BCrypt para senhas

- **Status:** Adotado (`security/WebSecurityConfig.java:51` `BCryptPasswordEncoder`)
- **Contexto:** Spring Security default, sem requisitos de política.
- **Decisão:** `passwordEncoder.encode` em `UsuarioController.create:35`, `matches` via `AuthenticationManager`.
- **Consequências:** Seguro para TCC..

## ADR-006 – Papéis como string `ROLE_*` em `Usuario.role`

- **Status:** Adotado (`models/Usuario.java:28` `String role`, seeds `ROLE_ADMIN` etc.)
- **Contexto:** Simplicidade, sem tabela `role`.
- **Decisão:** `List.of(new SimpleGrantedAuthority(user.getRole()))` (`CustomUserDetailsService.java:20`) e `hasRole("ADMIN")` (`WebSecurityConfig.java:45`).
- **Consequências:** Sem validação, toggle só `USER↔TECNICO` (`UsuarioController.promover:48`). Proposta: enum `Role` + `@Enumerated`.

## ADR-007 – `Feedback.data` como TEXT JSON

- **Status:** Adotado (`models/Feedback.java:22` `columnDefinition="TEXT"`)
- **Contexto:** Quiz gera array variável por tentativa, sem schema fixo.
- **Decisão:** `ObjectMapper.writeValueAsString(list)` no frontend? Backend só persiste `String data` vindo do frontend (`FeedbackController.novoFeedback:30`).
- **Consequências:** Flexível, mas não queryable (`SELECT ... WHERE data LIKE '%escore%'`). Proposta: `jsonb` no Postgres com GIN index.

## ADR-008 – Sem validação Bean Validation, sem OpenAPI

- **Status:** Adotado (ausência de `spring-boot-starter-validation` e `springdoc`)
- **Contexto:** TCC focado em funcional, não contrato.
- **Decisão:** Não adicionar `@NotNull`, `@Email`, nem gerar Swagger.
- **Consequências:** Frontend pode enviar `email=null` e persistir. Ver `08-tech-debt.md` P2-04, P2-06.

## ADR-009 – `RelatorioPOJO` e `UsuarioServiceImpl` mortos

- **Status:** Adotado (involuntário)
- **Contexto:** `RelatorioPOJO.java:12` criado como exemplo parse, nunca integrado; `UsuarioServiceImpl.java:1` vazio (0 linhas) deixado após refator `UsuarioService.java:10` para `@Service`.
- **Decisão:** Manter por enquanto (não quebra).
- **Consequências:** Confusão. Proposta `08-tech-debt.md` P2-01, P2-03 deletar ou usar.

## ADR-010 – Monorepo git com backend excluído

- **Status:** Histórico (`TCC-SimuladorFast:5916dea` `backexcluid` + `daa9777` `back excluido`)
- **Contexto:** Inicialmente `backend/` dentro de `TCC-SimuladorFast`, depois movido para `simulador-afast-backend` separado.
- **Decisão:** Backend hoje em `/home/dev/TCC/simulador-afast-backend` (repo próprio), frontend em `TCC-SimuladorFast`.
- **Consequências:** Docs duplicadas em `TCC-SimuladorFast/docs/backend` (espelho) para facilitar TCC banca; fonte canônica é `simulador-afast-backend/docs`.

## ADR-011 – Postgres 9.6

- **Status:** Adotado (`postgres/docker-compose.yml:5` `postgres:9.6`)
- **Contexto:** Imagem estável em 2023, Postgres 9.6 desatualizado.
- **Decisão:** Usar 9.6 com `PGDialect` (`application.yaml:16`).
- **Consequências:** EOL 2021, sem `jsonb` otimizado, sem `healthcheck`. Proposta `08-tech-debt.md` P2-13 migrar para 15.

## ADR-012 – Frontend `Api.request` com `fetch` + `sessionStorage`

- **Status:** Adotado (`TCC-SimuladorFast/frontend/src/api/index.js:21` `fetch`, `sessionStorage.getItem('access')`)
- **Contexto:** React sem axios interceptors, sem `react-query`.
- **Decisão:** `fetch` manual, `Authorization: Bearer <token>`, `retry` em 401 chamando `POST /api/token/refresh/` inexistente.
- **Consequências:** Refresh nunca funciona (ver `03-api-spec.md` divergência)..

---
*Para nova ADR, copiar template acima e numerar ADR-013...*
