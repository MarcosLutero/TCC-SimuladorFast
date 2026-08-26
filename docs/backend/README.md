# Simulador A-Fast – Documentação do Backend

> **Projeto:** `simulador-afast-backend` (`br.com.ufra:simulator.afast:0.0.1-SNAPSHOT`)  
> **Stack:** Spring Boot 2.7.15 / Java 11 / Maven / PostgreSQL 9.6 / Spring Security + JWT (auth0 java-jwt 4.2.2)  
> **Repositório backend:** `/home/dev/TCC/simulador-afast-backend` (separado de `TCC-SimuladorFast` que contém só o frontend)  
> **Data da documentação:** 2026-08-26  
> **Objetivo:** servir de base única e auditável para manutenção, evolução e evolução

## Como usar esta pasta

| # | Arquivo | O que contém | Quando consultar |
|---|---------|--------------|------------------|
| 01 | [01-architecture.md](./01-architecture.md) | Visão C4, fluxo request, estrutura de pacotes, dependências | Onboarding, revisão de arquitetura |
| 02 | [02-data-model.md](./02-data-model.md) | ER Mermaid, 4 entidades, constraints, inserts, dívidas de modelagem | Migrations, queries, schema futuro |
| 03 | [03-api-spec.md](./03-api-spec.md) | Tabela completa de 18 endpoints, exemplos curl, códigos HTTP | Integração frontend, testes, geração OpenAPI |
| 04 | [04-security.md](./04-security.md) | Fluxo JWT, WebSecurityConfig, roles, CORS, BCrypt, OWASP checklist | Auth, hardening |
| 05 | [05-configuration.md](./05-configuration.md) | `application.yaml`, env vars, profiles, portas | Rodar local, Docker, produção |
| 06 | [06-file-storage.md](./06-file-storage.md) | `ImagemJanelaController` + `arquivos/` classpath, risco efêmero, | Upload de imagens, persistência |
| 07 | [07-operations.md](./07-operations.md) | Build Maven, docker-compose, testes, logs, deploy | CI/CD, troubleshooting |
| 08 | [08-tech-debt.md](./08-tech-debt.md) | Backlog priorizado P0–P3 com arquivo:linha | Planejamento sprints |
| 09 | [09-decisions.md](./09-decisions.md) | ADRs (ddl-auto, JWT lib, storage local) | Entender “porquês” históricos |
| 10 | [10-frontend-integration.md](./10-frontend-integration.md) | Mapeamento `frontend/src/api/*` ↔ backend, divergências (refresh token) | Integração e contrato |

## Resumo executivo (1 página)

**O que o backend faz:** Simulador de exame A-Fast veterinário. Cadastra animais (`Animal`), cada animal tem 4 janelas de ultrassom (`ImagemJanela` hd/hr/er/cc) com flag `temLiquido`. Alunos autenticados sorteiam animais ativos (`/sortear-animais/{qtd}`), respondem quiz, submeter feedback (`Feedback.data` JSON com tempo/escore por janela). Admin (ROLE_ADMIN) gerencia usuários e animais.

**4 entidades JPA:** `Usuario` (`models/Usuario.java:9`), `Animal` (`models/Animal.java:11`), `ImagemJanela` (`models/ImagemJanela.java:7`), `Feedback` (`models/Feedback.java:9`). Todas `GenerationType.AUTO`, sem migrations ( `ddl-auto:update` em `src/main/resources/application.yaml:11`).

**18 endpoints** em 5 controllers (`controllers/*`), 4 repositories Spring Data JPA, Security stateless JWT 1 dia (`security/JwtIssuer.java:17`), CORS `*` com `allowCredentials:true` (`security/WebSecurityConfig.java:62`).

**Pontos críticos para futuras alterações:**
- **Storage acoplado ao classpath** (`controllers/ImagemJanelaController.java:35` `ClassPathResource("arquivos/")`) – perde arquivos em redeploy/container. Abstrair via interface `StorageService` antes de qualquer migração.
- **`@OneToOne` incorreto** onde deveria ser `@ManyToOne` (`ImagemJanela.animal`, `Feedback.usuario`) – impede múltiplos feedbacks por usuário no nível JPA sem gambiarra.
- **`Feedback.data` TEXT JSON** sem validação (`pojos/RelatorioPOJO.java:19` dead code) – dificulta queries analíticas.
- **Dockerfile quebrado** (`Dockerfile:2` `ENTRYPOINT ["mvn","-jar"]`) e `application.yaml:4` placeholders `{bdHOST}` que não resolvem env.
- **Secret JWT hardcoded** (`application.yaml:31`) e refresh token frontend aponta para endpoint inexistente (`frontend/src/api/index.js:12`).

> Próximo passo recomendado: corrigir P0 de `08-tech-debt.md` (Dockerfile, placeholders env, CORS, secret externo) antes de extrair `StorageService`.

## Convenções usadas

- Referências `arquivo:linha` permitem navegação direta (ex: `security/WebSecurityConfig.java:40`).
- Trechos `sql`, `yaml`, `java` copiados do repo e marcados com `<!-- fonte: path -->`.
- Mermaid para ER e sequência (renderiza no GitHub/GitLab).

## Como rodar (TL;DR)

```bash
cd simulador-afast-backend
# 1. Subir Postgres 9.6
docker-compose -f postgres/docker-compose.yml up -d   # user:jr db:simulador pass:123654789 5432:5432
# 2. Configurar env (ver 05-configuration.md)
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/simulador
export SPRING_DATASOURCE_USERNAME=jr
export SPRING_DATASOURCE_PASSWORD=123654789
# 3. Rodar
mvn spring-boot:run
# 4. Frontend (repo separado)
cd ../TCC-SimuladorFast/frontend && npm start   # REACT_APP_API_URL=http://localhost:8080
```

Ver `05-configuration.md` e `07-operations.md` para detalhes e `docker-compose.override.yml` / `prod.yml`.

## Glossário rápido

| Termo | Significado |
|-------|-------------|
| A-Fast | Avaliação ultrassonográfica focada abdominal (4 janelas: DH, CC, ER, HR) |
| hd/hr/er/cc | `AREAS = [hd,hr,er,cc]` em `ImagemJanelaController.java:37` – mapeia `janela 0..3` |
| pontuacao | `Animal.pontuacao` = `count(ImagemJanela.temLiquido==true)` (`ImagemJanelaController.java:193`) |
| ROLE_* | `ROLE_ADMIN` (seed admin@admin.com), `ROLE_TECNICO`, `ROLE_USER` (`Usuario.role`) |

---
*Gerado a partir de leitura estática do código em `src/main/java`, `pom.xml`, `application.yaml`, `postgres/docker-compose.yml`, `src/main/resources/arquivos/inserts.sql` e `TCC-SimuladorFast/frontend/src/api/*`.*
