# Plano P4 – Modernização e Hardening (pós P0-P3)

> **Data:** 2026-08-26  
> **Pré-requisito:** P0 (4d) ✔ P1 (5d) ✔ P2 (4d) ✔ P3 (2d) → 15 dias  
> **Objetivo P4:** tirar dívida de plataforma (Java 11 EOL, `openjdk` removido) e fechar gaps de qualidade/testes que ficaram para depois.  
> **Estimativa:** 5 dias úteis (1 dev) + 2 dias buffer  
> **Branch sugerido:** `feat/p4-modernizacao`

## Por que P4

- `Dockerfile:1` agora usa `eclipse-temurin:11-jre-jammy` (fix P0), mas `openjdk` base foi removida do Hub → Java 11 está em EOL estendido (suporte até 2024). `pom.xml:17` `java.version 11` + `spring-boot-starter-parent 2.7.15` (`javax.*`) não recebe patches de segurança.
- `frontend/package.json:16` React 18 + `react-scripts 5.0.1` (CRA deprecated) acumula 459 vulns `npm audit`.
- Sem `springdoc-openapi`, sem testes reais (`ApplicationTests.java:10` só `contextLoads`), sem `RateLimiter`.

## Escopo P4

### 4.1 – Java 11 → 17 + Spring Boot 2.7 → 3.2 (2,5 dias) – **maior risco**

| Passo | Arquivo | Ação | Estim. |
|-------|---------|------|--------|
| 4.1.1 | `pom.xml:5,17` | `java.version 11→17`, `spring-boot-starter-parent 2.7.15→3.2.5`, `maven:3.8.8-eclipse-temurin-11→3.9-eclipse-temurin-17`, `Dockerfile:1` `eclipse-temurin:17-jre-jammy` | 2h |
| 4.1.2 | `src/main/java/**/ *.java` | `javax.persistence.*` → `jakarta.persistence.*`, `javax.validation` → `jakarta.validation`, `javax.xml.bind` → remover (JDK 17 inclui) | 4h |
| 4.1.3 | `src/main/java/.../security/WebSecurityConfig.java:35` | `antMatchers` → `requestMatchers`, `antMatcher("/**")` → `securityMatcher` (SB3 API) | 2h |
| 4.1.4 | `src/main/resources/application.yaml:16` | `PostgreSQLDialect` → `org.hibernate.dialect.PostgreSQLDialect` ainda vale, mas testar | 1h |
| 4.1.5 | `mvn verify` | `PGPASSWORD=... psql` + `curl /actuator/health` | 4h + buffer 4h |

**Critério done:** `mvn verify` + `docker compose up --build` + `curl /auth/login` OK em Java 17.

**Risco:** `java-jwt 4.2.2` compatível com SB3 (testar), `lombok` precisa `1.18.30+`.

### 4.2 – Observabilidade e Docs API (0,5 dia)

| ID | Ação | Arquivo |
|----|------|---------|
| P2-06 | `springdoc-openapi-starter-webmvc-ui:2.2.0` → `http://localhost:8080/swagger-ui.html` | `pom.xml`, `application.yaml` |
| P3-08 | `H2` test + `testFailureIgnore:false` | `pom.xml:99`, `src/test/resources/application-test.yaml` |

### 4.3 – Hardening (1 dia)

| ID | Ação |
|----|------|
| P3-07 | `Bucket4j` ou `resilience4j` `RateLimiter` em `AuthController.java:28` `POST /auth/login` (5 req/min/IP) |
| P3-05 | `GlobalExceptionHandler.java:1` já em P3 – adicionar `MethodArgumentNotValid` → `400` com `fieldErrors` |
| `WebSecurityConfig.java:68` | `PasswordEncoder` `BCrypt 12` strength + `http.headers().frameOptions().sameOrigin()` |

### 4.4 – Frontend modernização (1 dia)

| ID | Ação | Estim. |
|----|------|--------|
| P2-F01 | `paginaInicial.js:10` `paginaQuiz.js:40` class → function hooks + `useNavigate` vs `window.location.href` (`login.js:40` etc.) | 4h |
| P2-F10 | `menuAreas.jsx:15` `window.location.pathname` → `useLocation()` | 1h |
| P3-F01 | `fetch` `api/index.js:21` → `axios` interceptors + `react-query` cache `sortearAnimaisReq` | 3h |
| CVE | `npm audit fix` + `browserslist --update-db` (atualmente 459 vulns) | 2h |

### 4.5 – Testes (1 dia, paralelo)

- Backend: `src/test/.../AnimalControllerTest.java` `@WebMvcTest` + `Testcontainers postgres:15`
- Frontend: `src/__tests__/paginaQuiz.test.jsx` `@testing-library` (já instalado `package.json:12`)

## Ordem

```
4.1 Java17 (2,5d) ████████████
4.2 OpenAPI (0,5d) ██
4.3 Hardening (1d) ████
4.4 Frontend (1d) ████
4.5 Testes (1d) ████  (paralelo)
```

## Critérios de aceite P4

- `java -version` 17, `mvn verify` `BUILD SUCCESS`, `docker compose up --build` `healthy`
- `http://localhost:8080/swagger-ui.html` lista 18 endpoints (`03-api-spec.md`)
- `http://localhost:8080/actuator/health` `UP`
- `npm audit` <50 vulns, `npm run build` sem warnings `Topo`/`drawer`
- `mvn test` 2 testes novos passando

## Fora de escopo P4 (futuro)

- `RateLimiter` distribuído Redis, `Flyway` `V2__pontuacao_jsonb`, `S3` storage, `Vite` migração CRA.

## Como começar

```bash
git checkout feat/p3-polish
git checkout -b feat/p4-modernizacao
# 4.1.1
# editar pom.xml + Dockerfile + javax->jakarta
mvn verify
```

---
*Base: `backend/08-tech-debt.md` P2-06/P3-07/P3-08 + `frontend/07-tech-debt.md` P3-F01 + `pom.xml:17` `java.version`*
