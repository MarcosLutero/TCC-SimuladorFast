# Guia de Configuração – Simulador A-Fast

> Referência técnica de todas as variáveis e arquivos de config. Ver também `backend/05-configuration.md`.

## 1. Backend – `src/main/resources/application.yaml:1`

```yaml
spring:
  datasource:
    url: jdbc:postgresql://{bdHOST}:{bdPORT}/{bdNAME} # P0-02: placeholder quebrado, deveria ser ${DB_HOST}
    username: {bdUSER}
    password: {bdPASS}
  jpa:
    hibernate:
      ddl-auto: update   # dev: update, prod: validate (após Flyway)
      show-sql: false
  jackson:
    serialization: { FAIL_ON_EMPTY_BEANS: false }
  servlet:
    multipart:
      enabled: true
      max-file-size: 20MB      # 05-configuration.md:22
      max-request-size: 215MB
security:
  jwt:
    secret-key: verysecretkeyohmygod... # P0-04: hardcoded, mover para env
```

**Variáveis de ambiente propostas (após Fase 0):**

| Var | Default dev | Onde usar | Exemplo |
|-----|-------------|-----------|---------|
| `DB_HOST` | `localhost` | `spring.datasource.url` | `localhost` ou `host.docker.internal` |
| `DB_PORT` | `5432` | url | `5432` |
| `DB_NAME` | `simulador` | url | `simulador` |
| `DB_USER` | `jr` | username | `jr` |
| `DB_PASSWORD` | `123654789` | password | `123654789` |
| `JWT_SECRET` | `verysecretkey...` | `security.jwt.secret-key` | `openssl rand -base64 32` |
| `JWT_EXP_DAYS` | `1` | `JwtIssuer.java:19` | `1` |
| `STORAGE_PATH` | `./uploads` | `storage.local.path` (pós StorageService) | `./uploads` |
| `FRONTEND_URL` | `http://localhost:3000` | CORS `WebSecurityConfig.java:64` | `http://localhost:3000` |
| `SPRING_PROFILES_ACTIVE` | `dev` | `docker-compose.override.yml:6` | `dev`/`prod` |

**Exemplo `.env` backend (não commitado):**
```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=simulador
DB_USER=jr
DB_PASSWORD=123654789
JWT_SECRET=coloque_aqui_min_32_chars_base64
FRONTEND_URL=http://localhost:3000
```

## 2. Frontend – `.env`

```
REACT_APP_API_URL=http://localhost:8080
```

- **Sem trailing slash**, sem `/api` prefix (backend não usa `/api` exceto refresh bug `api/index.js:12`).
- `env-cmd -f ./.env react-scripts start` `frontend/package.json:25` – CRA já lê `.env` automaticamente, `env-cmd` pode ser removido (P2-F12).
- Em produção: `REACT_APP_API_URL=https://api.seudominio.com`.

## 3. Docker Compose

| Arquivo | Quando usar | Comando |
|---------|-------------|---------|
| `simulador-afast-backend/docker-compose.yml:1` | base | `docker compose up` |
| `docker-compose.override.yml:1` | dev (auto) | `docker compose up` (monta `.:/app` + `SPRING_PROFILES_ACTIVE=dev`) |
| `docker-compose.prod.yml:1` | prod | `docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d` |
| `postgres/docker-compose.yml:1` | DB isolado | `docker compose -f postgres/docker-compose.yml up -d` |
| `TCC-SimuladorFast/docker-compose.yml:14` | frontend | `docker compose up` (3000:3000) |

**Após Fase 0:** usar `postgres:15-alpine` + `healthcheck` (`backend/05-configuration.md` §4).

## 4. Banco de Dados

- **Imagem:** `postgres:9.6` (`postgres/docker-compose.yml:5`) → migrar para `15` (P2-13).
- **Credenciais seed:** `POSTGRES_USER=jr`, `DB=simulador`, `PASS=123654789`.
- **Seeds:** `src/main/resources/arquivos/inserts.sql` corrigir quotes (`02-data-model.md` §5) antes de usar.
- **Migrations futura:** `backend/09-decisions.md` ADR-002 propõe Flyway `V1__init.sql`.

## 5. Segurança

- **JWT:** `JwtIssuer.java:17` `HMAC256(secret)` `exp 1d` com claims `sub=userId, e=email, a=roles`. Trocar secret via env (P0-04).
- **CORS:** `WebSecurityConfig.java:62` hoje `allowedOriginPatterns *` + `allowCredentials true` (inválido). Após fix: `FRONTEND_URL`.
- **Senhas:** BCrypt `WebSecurityConfig.java:51`.

## 6. Storage

- **Atual:** `src/main/resources/arquivos/` classpath (`06-file-storage.md` F01).
- **Após Fase 1:** `STORAGE_PATH=./uploads` fora do classpath, `StorageService` interface.

## 7. Validação

```bash
# Backend
curl http://localhost:8080/ws/images/animal_12_hd.png -I  # 200 + image/jpeg (deveria png)
curl http://localhost:8080/animal -H "Authorization: Bearer <token>"  # 200

# Frontend
cat frontend/.env  # REACT_APP_API_URL
```

---
*Fonte: `backend/05-configuration.md`, `07-operations.md`, `04-security.md`*
