# Guia de Desenvolvimento – Simulador A-Fast

> Para devs que vão manter/evoluir. Ver `backend/01-architecture.md`, `frontend/01-architecture.md`, `backend/09-decisions.md`.

## 1. Stack e versões

- **Backend:** Spring Boot 2.7.15, Java 11, Maven 3.8.4, Postgres 9.6 (migrar 15), Lombok, `java-jwt 4.2.2`.
- **Frontend:** React 18.1, Router 6.3, Bootstrap 5 + react-bootstrap 2.4, MUI 5.15 (órfão), `fetch` (axios 0.27 morto).

## 2. Estrutura

```
simulador-afast-backend/
  src/main/java/br/com/ufra/simulator_afast/
    Application.java, controllers/5, models/7, pojos/5, repositories/4, security/8, services/3
  src/main/resources/application.yaml, arquivos/8 PNGs
  postgres/docker-compose.yml
TCC-SimuladorFast/frontend/
  src/api/4, pages/8, components/7, css/2, App.js, index.js
  public/index.html (Bootstrap CDN)
docs/
  backend/10, frontend/7, guias/4, PLANO_ACAO.md
```

## 3. Como rodar em dev

**Backend:**
```bash
cd simulador-afast-backend/postgres && docker compose up -d
cd .. && mvn spring-boot:run  # precisa fix application.yaml placeholders
```

**Frontend:**
```bash
cd TCC-SimuladorFast/frontend && npm install && echo "REACT_APP_API_URL=http://localhost:8080" > .env && npm start
```

**Hot reload:** Backend `spring-boot-devtools` `pom.xml:30`, frontend `react-scripts` HMR.

## 4. Testes

- **Backend:** `src/test/java/**/ApplicationTests.java:10` só `contextLoads` com `testFailureIgnore true` `pom.xml:100` → falhando não quebra build. Adicionar H2 `src/test/resources/application-test.yaml` + `mvn test` (ver `07-operations.md` §2).
- **Frontend:** sem testes (`App.test.js` deletado `daa9777`), `@testing-library` instalado mas não usado. `npm test` roda CRA jest.

## 5. Debugging

- **Backend logs:** só `System.out` `ImagemJanelaController:117`; após Fase 1 usar `log.error`. Ativar `logging.level.br.com.ufra=DEBUG` via env.
- **Frontend:** `console.log("deu ruim 23")` `paginaInicial.js:60`; usar `React DevTools`, `sessionStorage` em Application, Network `Authorization: Bearer`.
- **DB:** `psql -h localhost -U jr simulador -c "select * from animal;"`.

## 6. Padrões e convenções

- **Commits:** `git log --oneline | head -10` mostra `ajustes e correções` genéricos; usar Conventional Commits `feat:`, `fix:`.
- **Referências:** docs usam `arquivo:linha` (ex: `security/WebSecurityConfig.java:40`).
- **Estilo:** Backend Lombok `@Data`, frontend misto class/function → padronizar hooks (P2-F01).

## 7. Fluxo contribuição

1. Branch `feat/<id>-descricao` a partir de `main`.
2. Corrigir seguindo `PLANO_ACAO.md` fases (Fase 0 antes de feature).
3. `mvn verify` + `npm run build` sem erros.
4. PR com descrição + print.

## 8. Dívida técnica – onde continuar

Ver `backend/08-tech-debt.md` (P0–P3) e `frontend/07-tech-debt.md`. Começar por `PLANO_ACAO.md` Fase 0.

## 9. Troubleshooting dev

| Problema | Solução |
|----------|---------|
| `ClassPathResource` write fail em `java -jar` | Usar `mvn spring-boot:run` |
| `stored < level` string comp `App.js:13` | `parseInt` |
| `temliquido` typo `modalAnimal.jsx:289` | fix Fase 1 |

---
*Fontes: `backend/01-architecture.md`, `frontend/01-architecture.md`, `07-operations.md`*
