# Simulador A-Fast – Documentação

> **TCC MedVet UFRA** – Simulador de Exame A-Fast (HD/HR/ER/CC)  
> **Repos:** `simulador-afast-backend` (Spring Boot 2.7.15, `:8080`) + `TCC-SimuladorFast/frontend` (React 18, `:3000`)  
> **Objetivo:** base auditável para manutenção e evolução (sem Supabase)

## Estrutura

| Pasta | O que tem | Quando usar |
|-------|-----------|-------------|
| [backend/](./backend/README.md) | 10 docs técnicos backend (arquitetura, ER, 18 endpoints, security, config, storage, operations, tech-debt, ADRs, integração) | Manter Spring, debug |
| [frontend/](./frontend/README.md) | 7 docs frontend (arquitetura, rotas `App.js:39`, state `sessionStorage`, 8 páginas, 7 componentes, contrato api, tech-debt) | Manter React |
| [guias/](./guias/instalacao.md) | Guias práticos: instalação, configuração, uso, desenvolvimento | **Comece aqui** para rodar |
| [PLANO_ACAO.md](./PLANO_ACAO.md) | **Plano de ação Fase 0–3** (15 dias, P0→P3) | Antes de codar |

## Início rápido (guias)

1. **Instalar:** [`guias/instalacao.md`](./guias/instalacao.md) – pré-requisitos JDK 11, Maven, Node, Docker + `docker compose up` Postgres + `mvn spring-boot:run` + `npm start`
2. **Configurar:** [`guias/configuracao.md`](./guias/configuracao.md) – `application.yaml`, `REACT_APP_API_URL`, `JWT_SECRET`, `STORAGE_PATH`
3. **Usar:** [`guias/uso.md`](./guias/uso.md) – cadastro/login, `/quiz` áreas, `/animais` CRUD, `/feedbacks`
4. **Desenvolver:** [`guias/desenvolvimento.md`](./guias/desenvolvimento.md) – stack, testes, debug

## Estado atual

- Docs backend/frontend completas (2564 linhas backend + 883 frontend).
- Supabase removido (docs e menções).
- Plano de ação pronto (Fase 0 estabilização 4 dias → Fase 3 polish 2 dias).

**Próximo passo:** aprovar `PLANO_ACAO.md` e iniciar Fase 0.2 (`application.yaml` placeholders).

---
*Gerado 2026-08-26 a partir de leitura estática `src/main/java`, `src/api`, `src/pages`, `pom.xml`, `application.yaml`.*
