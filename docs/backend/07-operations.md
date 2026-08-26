# 07 – Operações (Build, Testes, Deploy)

## 1. Build Maven

**Requisitos:** JDK 11 (`pom.xml:17`), Maven 3.8.4 (via `mvnw` `wrapper/maven-wrapper.properties:2`).

```bash
mvn -version          # Apache Maven 3.8.4
java -version         # openjdk 11
mvn clean package -DskipTests  # gera target/simulator.afast-0.0.1-SNAPSHOT.jar
mvn spring-boot:run   # dev com hot reload (spring-boot-devtools pom.xml:30)
```

**Plugins (`pom.xml:81`):**

- `spring-boot-maven-plugin` (exclui Lombok do jar)
- `maven-surefire-plugin:2.22.2` com `testFailureIgnore=true` (`pom.xml:100`) – **tests falhando não quebram build** (ruim para CI).

**Dependências sem version lock:** `org.jetbrains:annotations:RELEASE` (`pom.xml:57`) resolve para latest (não determinístico); fixar `24.1.0`.

## 2. Testes

**Atuais:** 2 arquivos idênticos:

- `src/test/java/br/com/ufra/simulator_afast/ApplicationTests.java:10` `@SpringBootTest contextLoads()`
- `src/test/java/br/com/ufra/simulator/afast/ApplicationTests.java:10` (pacote errado `simulator.afast` vs `simulator_afast`)

Cada `contextLoads` tenta subir Spring + Postgres (sem Testcontainers, sem H2) – **falha se DB não estiver up** (`application.yaml` placeholders). Em CI, `mvn package` com `testFailureIgnore=true` ignora falha.

**Para rodar testes isolados:**

```bash
mvn test -Dspring.profiles.active=test -Dspring.datasource.url=jdbc:h2:mem:test
# ou adicionar H2 dependency test scope + application-test.yaml
```

**Proposta:**

- Add `com.h2database:h2` test scope + `src/test/resources/application-test.yaml` com H2.
- Trocar `surefire` `testFailureIgnore:false`.
- Escrever testes para `ImagemJanelaController.atualizarPontuacao`, `AuthController.login` com `@WebMvcTest`.

## 3. Rodando local (dev)

**Opção A – sem Docker (recomendado para debug):**

```bash
# 1. DB
docker run -d --name pg-sim -p 5432:5432 -e POSTGRES_USER=jr -e POSTGRES_PASSWORD=123654789 -e POSTGRES_DB=simulador postgres:9.6
# 2. Fix application.yaml temporário (ou env)
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/simulador
export SPRING_DATASOURCE_USERNAME=jr
export SPRING_DATASOURCE_PASSWORD=123654789
export JWT_SECRET=verysecretkeyohmygodwhyisitsosecretplsdonttellanybody
mvn spring-boot:run
# 3. Verificar
curl http://localhost:8080/ws/images/animal_12_hd.png --output test.png
curl -X POST http://localhost:8080/auth/login -H "Content-Type: application/json" -d '{"email":"admin@admin.com","password":"123456"}'
```

**Opção B – Docker Compose dev:**

```bash
# Após corrigir application.yaml placeholders para ${DB_HOST}
docker compose -f docker-compose.yml -f postgres/docker-compose.yml up --build
# com override (hot reload)
docker compose up
```

`docker-compose.override.yml:1` monta `.:/app` e roda `mvn spring-boot:run` – requer `~/.m2` cache.

## 4. Docker

| Arquivo | Problema | Fix |
|---------|----------|-----|
| `Dockerfile:1` | `ENTRYPOINT ["mvn","-jar","/app.jar"]` inválido | `["java","-jar","/app.jar"]` |
| `Dockerfile:1` | `FROM openjdk:11-jdk-slim` (JDK, não JRE) | `openjdk:11-jre-slim` p/ runtime |
| `docker-compose.yml:1` | `version 3.3` obsoleto, `container:` nome genérico | `services: app:` sem version |
| `postgres/docker-compose.yml:1` | `version 2`, `postgres:9.6` EOL | `postgres:15-alpine` + `healthcheck` |
| `docker-compose.prod.yml:1` | `replicas 2` sem swarm | Remover ou usar `deploy` com swarm/k8s |

**Exemplo `docker-compose.yml` corrigido:**

```yaml
services:
  app:
    build: .
    ports: ["8080:8080"]
    environment:
      SPRING_DATASOURCE_URL: jdbc:postgresql://db:5432/simulador
      SPRING_DATASOURCE_USERNAME: jr
      SPRING_DATASOURCE_PASSWORD: 123654789
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      db:
        condition: service_healthy
  db:
    image: postgres:15-alpine
    environment: { POSTGRES_USER: jr, POSTGRES_DB: simulador, POSTGRES_PASSWORD: 123654789 }
    ports: ["5432:5432"]
    volumes: ["pgdata:/var/lib/postgresql/data"]
    healthcheck: { test: ["CMD-SHELL","pg_isready -U jr"], interval: 5s, retries: 5 }
volumes: { pgdata: {} }
```

## 5. Deploy produção

**Atual (`docker-compose.prod.yml:1`):**

```yaml
services:
  container:
    ports: ["80:8080"]
    environment: [SPRING_PROFILES_ACTIVE=prod]
    deploy: { replicas: 2, update_config: { parallelism: 2, delay: 10s }, restart_policy: { condition: on-failure } }
```

- Sem `SPRING_PROFILES_ACTIVE=prod` file (`application-prod.yaml` inexistente).
- Sem `JVM_OPTS` (`-Xms -Xmx`), sem `healthcheck` (`/actuator/health` ausente).
- Sem reverse proxy (expor 80 direto do Spring).

**Recomendado:**

- Add `spring-boot-starter-actuator` + `management.endpoints.web.exposure.include=health,info`.
- Usar `JAVA_OPTS: -Xms256m -Xmx512m` em `Dockerfile`.
- Frente com Nginx/Caddy para TLS + `proxy_pass`.
- CI: `mvn verify` → `docker build` → push registry → `docker compose pull && up -d`.

## 6. Logs e observabilidade

- **Logs:** só `System.out.println(e)` em `ImagemJanelaController.java:117` e `System.out.println("file"+file)` `ImagemJanelaController.java:128`. Sem SLF4J `log.error`.
- **Actuator ausente:** sem `/health`, `/metrics`.
- **Show SQL:** `application.yaml:12` `show-sql:false` (ok).
- **Para debug:** set `logging.level.br.com.ufra=DEBUG` e `SPRING_JPA_SHOW_SQL=true` via env.

## 7. Monitoramento rápido

```bash
# Ver logs container
docker logs -f <container>
# Checar DB
psql -h localhost -U jr -d simulador -c "\dt; select count(*) from animal;"
# Checar storage
ls -lh src/main/resources/arquivos/ | head
```

## 8. Backup

- **DB:** `pg_dump -h localhost -U jr simulador > dump.sql` (não automatizado).
- **Imagens:** `tar czf arquivos-$(date +%F).tgz src/main/resources/arquivos/*.png` – mas em prod estão em `target/classes` efêmero (perda).

## 9. Roadmap operações

- [ ] Add `actuator`, `healthcheck` Docker, `H2` para testes.
- [ ] Corrigir `Dockerfile` + `testFailureIgnore=false`.
- [ ] Criar `application-prod.yaml` com `ddl-auto:validate`.
- [ ] CI GitHub Actions: `mvn verify`, `docker build`, `trivy scan`.

---
*Fontes: `pom.xml:1`, `Dockerfile:1`, `docker-compose*.yml`, `postgres/docker-compose.yml:1`, `src/test/java/**/ApplicationTests.java:1`, `application.yaml:1`*
