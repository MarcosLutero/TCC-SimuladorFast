# 05 – Configuração

## 1. application.yaml (`src/main/resources/application.yaml:1`)

```yaml
spring:
    datasource:
        url: jdbc:postgresql://{bdHOST}:{bdPORT}/{bdNAME}
        username: {bdUSER}
        password: {bdPASS}
        driver-class-name: org.postgresql.Driver
    jpa:
        hibernate:
            ddl-auto: update
            show-sql: false
    properties:
        hibernate:
            dialect: org.hibernate.dialect.PostgreSQLDialect
    jackson:
        serialization: 
            FAIL_ON_EMPTY_BEANS: false
    servlet:
        multipart:
            enabled: true
            file-size-threshold: 2KB
            max-file-size: 20MB
            max-request-size: 215MB
security:
    jwt:
        secret-key: verysecretkeyohmygodwhyisitsosecretplsdonttellanybody
```

### 1.1 Problemas – placeholders não resolvem env

- `{bdHOST}` sem `$` nem `:` default – **não é placeholder Spring**. Spring tenta literal `jdbc:postgresql://{bdHOST}:...` e falha. Correto: `${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:simulador}`.
- Mesmo para `username: {bdUSER}` → `${DB_USER:jr}`.
- Evidência: `postgres/docker-compose.yml:7` usa `POSTGRES_USER=jr`, `POSTGRES_DB=simulador`, mas `application.yaml` nunca lê essas envs.

**Correção proposta:**

```yaml
spring:
  datasource:
    url: jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:simulador}
    username: ${DB_USER:jr}
    password: ${DB_PASSWORD:123654789}
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: validate # em prod, update só em dev
      show-sql: ${SHOW_SQL:false}
security:
  jwt:
    secret-key: ${JWT_SECRET:verysecretkey...} # 256+ bits base64
    expiration-days: ${JWT_EXP_DAYS:1}
```

Criar `application-dev.yaml` e `application-prod.yaml` com overrides.

## 2. Profiles e docker-compose

| Arquivo | Propósito | Conteúdo chave |
|---------|-----------|----------------|
| `docker-compose.yml:1` | base | `container: build .`, `ports 8080:8080`, `extra_hosts host.docker.internal:host-gateway` |
| `docker-compose.override.yml:1` | dev (auto em `docker compose up`) | `volumes .:/app, ~/.m2:/root/.m2`, `environment SPRING_PROFILES_ACTIVE=dev`, `command mvn spring-boot:run` |
| `docker-compose.prod.yml:1` | prod (usar `-f docker-compose.yml -f docker-compose.prod.yml`) | `ports 80:8080`, `SPRING_PROFILES_ACTIVE=prod`, `deploy replicas 2` |
| `postgres/docker-compose.yml:1` | DB isolado | `image postgres:9.6`, `volumes ./data:/var/lib/postgresql/data`, `ports 5432:5432`, `environment POSTGRES_USER=jr POSTGRES_DB=simulador POSTGRES_PASSWORD=123654789` |
| `Dockerfile:1` | build jar | `FROM openjdk:11-jdk-slim`, `COPY target/...jar /app.jar`, `ENTRYPOINT ["mvn","-jar","/app.jar"]` **BUG** (ver §5) |

**Como rodar hoje (workaround):**

```bash
# Terminal 1 – DB
cd simulador-afast-backend/postgres
docker compose up -d
# ou docker-compose -f docker-compose.yml up -d (versão 1)

# Terminal 2 – Backend (sem Docker, direto Maven com env fix)
cd ..
# Edite src/main/resources/application.yaml temporariamente para url real:
# url: jdbc:postgresql://localhost:5432/simulador
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.datasource.username=jr --spring.datasource.password=123654789 --security.jwt.secret-key=verysecretkeyohmygodwhyisitsosecretplsdonttellanybody"

# Com Docker (após corrigir application.yaml placeholders):
docker compose -f docker-compose.yml -f postgres/docker-compose.yml up --build
# dev com override
docker compose up
# prod
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## 3. Variáveis de ambiente necessárias (proposta)

| Var | Default dev | Em `application.yaml` | Nota |
|-----|-------------|-----------------------|------|
| `DB_HOST` | `localhost` | `${DB_HOST}` | `host.docker.internal` quando backend em container e DB fora |
| `DB_PORT` | `5432` | `${DB_PORT}` | |
| `DB_NAME` | `simulador` | `${DB_NAME}` | |
| `DB_USER` | `jr` | `${DB_USER}` | |
| `DB_PASSWORD` | `123654789` | `${DB_PASSWORD}` | |
| `JWT_SECRET` | (hardcoded) | `${JWT_SECRET}` | min 32 chars, base64 |
| `FRONTEND_URL` | `http://localhost:3000` | `${FRONTEND_URL}` para CORS | |
| `SPRING_PROFILES_ACTIVE` | `dev` | `env` | `docker-compose.override.yml:6` |

Frontend exige `REACT_APP_API_URL=http://localhost:8080` (`TCC-SimuladorFast/frontend/.env:1`, `TCC-SimuladorFast/.env:1`). Em prod, setar `REACT_APP_API_URL=https://api.seudominio.com`.

## 4. Multipart

`application.yaml:22` `max-file-size 20MB`, `max-request-size 215MB`. Suficiente para PNGs de ultrassom (ex: `animal_12_cc.png 80KB` em `src/main/resources/arquivos/`). Frontend envia `multipart/form-data` via `frontend/src/api/animal.js:24` (`contentType=""` deixa browser setar boundary).

## 5. Dockerfile – bug e fix

**Atual (`Dockerfile:1`):**
```dockerfile
FROM openjdk:11-jdk-slim
COPY target/simulator.afast-0.0.1-SNAPSHOT.jar /app.jar
ENTRYPOINT ["mvn","-jar","/app.jar"]
```
- `mvn -jar` não existe; deveria ser `java -jar`.
- `COPY target/...` assume `mvn package` rodado antes, mas `docker-compose.override.yml` tenta `mvn spring-boot:run` com volume `.:/app` (conflita).
- Sem `EXPOSE 8080`, sem `WORKDIR`.

**Fix proposto:**
```dockerfile
FROM maven:3.8.4-openjdk-11-slim AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn package -DskipTests

FROM openjdk:11-jre-slim
WORKDIR /app
COPY --from=build /app/target/simulator.afast-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]
```

Ou manter `docker-compose.override.yml` para dev sem Dockerfile.

## 6. Postgres – `postgres/docker-compose.yml:1`

```yaml
version: "2"
services:
  database:
    container_name: postgres
    image: postgres:9.6  # EOL desde 2021, migrar para 15+
    volumes: ["./data:/var/lib/postgresql/data"]
    ports: ["5432:5432"]
    environment:
      POSTGRES_USER: jr
      POSTGRES_DB: simulador
      POSTGRES_PASSWORD: 123654789
```

- `version "2"` obsoleto (compose v2 ignora).
- `postgres:9.6` sem patches segurança.
- `data/` não ignorado em `.gitignore`? Checar `ls postgres/data` antes de commit.

## 7. Jackson

`application.yaml:18` `FAIL_ON_EMPTY_BEANS: false` evita erro quando `AnimalPOJO` tem `imgs` vazia. Correto.

## 8. Checklist configuração para futuro

- [ ] Trocar placeholders `{bdHOST}` → `${DB_HOST}` em `application.yaml:4`.
- [ ] Criar `application-dev.yaml` (`ddl-auto:update`, `show-sql:true`) e `application-prod.yaml` (`validate`, `show-sql:false`).
- [ ] Externalizar `JWT_SECRET` para env/secret manager.
- [ ] Atualizar `postgres` para `15` e adicionar `healthcheck`.
- [ ] Corrigir `Dockerfile` ENTRYPOINT.
- [ ] Adicionar `.env.example` com todas vars documentadas.

---
*Fontes: `src/main/resources/application.yaml:1`, `docker-compose*.yml`, `postgres/docker-compose.yml:1`, `Dockerfile:1`, `wrapper/maven-wrapper.properties:1`*
