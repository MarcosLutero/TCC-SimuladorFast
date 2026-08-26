# Guia de Instalação – Simulador A-Fast

> Para quem vai rodar o projeto pela primeira vez (dev local). Ver também `backend/05-configuration.md` e `backend/07-operations.md` para detalhes.

## 1. Pré-requisitos

| Ferramenta | Versão testada | Verificação |
|------------|----------------|-------------|
| JDK | 11 (OpenJDK) | `java -version` |
| Maven | 3.8.4 (ou `mvnw` incluído `wrapper/maven-wrapper.properties:2`) | `mvn -version` ou `./mvnw -version` |
| Node.js | 18+ | `node -v` |
| npm | 8+ | `npm -v` |
| Docker + Docker Compose | 20+ / v2 | `docker --version`, `docker compose version` |
| Git | 2+ | `git --version` |
| PostgreSQL (opcional, se não usar Docker) | 15 recomendado (repo usa 9.6 `postgres/docker-compose.yml:5`) | `psql --version` |

## 2. Clonar repositórios

```bash
# Frontend (monorepo com docs)
git clone git@github.com:MarcosLutero/TCC-SimuladorFast.git
cd TCC-SimuladorFast

# Backend (repo separado)
cd ..
git clone <URL_SIMULADOR_AFAST_BACKEND> simulador-afast-backend
# ou se já existe em /home/dev/TCC/simulador-afast-backend, apenas:
cd simulador-afast-backend && git status
```

Estrutura esperada:
```
/home/dev/TCC/
  TCC-SimuladorFast/       → frontend + docs/backend + docs/frontend + docs/guias
  simulador-afast-backend/ → Spring Boot
```

## 3. Backend – subir e testar

### 3.1 Subir Postgres via Docker

```bash
cd simulador-afast-backend/postgres
docker compose up -d
# Verifica
docker logs postgres
psql -h localhost -U jr -d simulador -c "\dt"  # pass 123654789
```

Se usar `postgres/docker-compose.yml:5` (`postgres:9.6`), considere migrar para `postgres:15-alpine` (ver `backend/08-tech-debt.md` P2-13).

### 3.2 Configurar `application.yaml`

Antes do fix P0-02, o arquivo tem placeholders literais `src/main/resources/application.yaml:4` `{bdHOST}` que não resolvem env.

**Opção rápida (temporária) – editar arquivo:**
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/simulador
    username: jr
    password: 123654789
```

**Opção futura (após Fase 0):**
```bash
export DB_HOST=localhost DB_PORT=5432 DB_NAME=simulador DB_USER=jr DB_PASSWORD=123654789 JWT_SECRET=troque_aqui_32chars
mvn spring-boot:run
```

Ver `backend/05-configuration.md` §1.1 para fix `${DB_HOST}`.

### 3.3 Rodar

```bash
cd simulador-afast-backend
mvn spring-boot:run
# ou
./mvnw spring-boot:run
```

Teste:
```bash
curl http://localhost:8080/ws/images/animal_12_hd.png --output /tmp/test.png && ls -lh /tmp/test.png
curl -X POST http://localhost:8080/auth/login -H "Content-Type: application/json" \
  -d '{"email":"admin@admin.com","password":"123456"}'
```

Seeds: `src/main/resources/arquivos/inserts.sql` está com sintaxe inválida (`02-data-model.md` §5). Para teste inicial, o `ddl-auto:update` cria schema vazio; cadastre manualmente via `POST /usuarios` ou corrija seeds.

### 3.4 Build Docker (após Fase 0)

```bash
mvn clean package -DskipTests
docker build -t simulador-afast-backend .
docker compose -f docker-compose.yml -f postgres/docker-compose.yml up --build
```

**Atenção:** `Dockerfile:2` atual `ENTRYPOINT ["mvn","-jar"]` está quebrado (P0-01). Usar fix `backend/07-operations.md` §4.

## 4. Frontend – instalar e rodar

```bash
cd TCC-SimuladorFast/frontend
npm install
echo "REACT_APP_API_URL=http://localhost:8080" > .env
npm start  # porta 3000
```

Ou via Docker (compose na raiz `TCC-SimuladorFast`):
```bash
cd TCC-SimuladorFast
docker compose up --build  # 3000:3000
```

Ver `frontend/01-architecture.md` §5 e `frontend/02-routes.md`.

## 5. Verificação fim-a-fim

1. Abra `http://localhost:3000/login` → faça cadastro (`/cadastro`) ou use seed `admin@admin.com / 123456` (senha BCrypt `inserts.sql:4`).
2. Login → `/` → Configurar `qtd=1, tempo=1` → Começar → `/quiz` deve listar animal com `sortearAnimaisReq` `frontend/06-api-contract.md:10`.
3. Clique nas 4 áreas `hd/er/cc/hr` (`frontend/04-pages.md` §5) → Enviar → deve criar `feedback` (`POST /feedbacks`).

Se `quiz` ficar vazio: verifique `animal.isActive=true` + `imagem_janela` com 4 linhas (`http://localhost:8080/animal` e `/animal/1/imagens`).

## 6. Troubleshooting

| Problema | Causa | Solução |
|----------|-------|---------|
| `jdbc:postgresql://{bdHOST}` | `application.yaml:4` placeholder sem `$` | Editar para `localhost:5432` temporário |
| `NoSuchFileException arquivos/` em `java -jar` | Storage classpath `06-file-storage.md` F01 | Rodar via `mvn spring-boot:run` com volume, não `java -jar` antes do fix |
| `401` em `/animal` | `sessionStorage access` ausente | Fazer login e verificar `sessionStorage` em DevTools Application |
| `CORS` `*` com credentials | `WebSecurityConfig.java:64` | Após fix, setar `FRONTEND_URL=http://localhost:3000` |
| `npm ERR! env-cmd` | `.env` não encontrado | `echo REACT_APP_API_URL=... > .env` |

---
*Ver `backend/07-operations.md` e `frontend/07-tech-debt.md` para próximos passos.*
