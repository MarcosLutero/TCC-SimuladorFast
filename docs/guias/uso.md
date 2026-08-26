# Guia de Uso – Simulador A-Fast (Usuário Final)

> Como usar o sistema como aluno, técnico e admin. Baseado em `frontend/04-pages.md` e `backend/03-api-spec.md`.

## 1. Papéis

| Papel | `Usuario.role` | `nivelAcesso` `login.js:25` | Acesso |
|-------|----------------|----------------------------|--------|
| Usuário | `ROLE_USER` | 1 | `/`, `/quiz`, histórico próprio |
| Médico/Técnico | `ROLE_TECNICO` | 2 | + `/animais`, `/feedbacks` (todos) |
| Administrador | `ROLE_ADMIN` | 3 | + `/admin/usuarios` (promover) |

Seeds: `admin@admin.com`, `medico@medico.com`, `user@user.com` (`inserts.sql:4` senha BCrypt `123456`).

## 2. Cadastro e Login

**Cadastro:** `http://localhost:3000/cadastro` (`pages/cadastro.js:5`)
- Preencha `Nome*`, `Email*` (≥6 chars), `Senha*` (≥4) → `Cadastrar` → auto-login como `ROLE_USER` → `/`.

**Login:** `/login` (`pages/login.js:4`)
- `Email` + `Senha` → `Entrar` (ou Enter). Erro `Email e/ou senha inválidos!` se 401.
- Sucesso: `sessionStorage` 3 keys (`access` JWT, `usuario` JSON, `nivelAcesso`).

**Sair:** `MenuAreas → Sair` (`components/logout.jsx:10`) limpa session e volta para `/login`.

## 3. Página Inicial (`/` – `pages/paginaInicial.js:10`)

- **Título:** `Simulador de Exame A-FAST`.
- **Começar:** botão azul → `/quiz`.
- **Meu Histórico:** `onClick abrirHistoricoModal:51` → `GET /feedbacks/{id}` → tabela `Data, Tempo Total` + `CustomFeedbackModal` `Ver Feedbacks`.
- **Configurações:** modal com `Quantidade de Animais` (`qtd`) e `Temporizador - minuto(s) por imagem` (`tempo`). Salva em `sessionStorage config` `paginaInicial.js:47` (default `qtd:1, tempo:3`).

**Dica:** Configure `qtd=2, tempo=2` para treinar com 2 animais e 2 min cada.

## 4. Quiz (`/quiz` – `pages/paginaQuiz.js:40`)

**Fluxo:**
1. Ao entrar, `getAnimais:60` faz `GET /sortear-animais/{qtd}` (`Animais ativos` `isActive=true` + shuffle).
2. **Timer:** `tempo` em `mm:ss` `formatarTempo:105` decresce 1s; se zerar, abre `ModalFeedback` e envia feedback.
3. **Áreas:** imagem `doggo.png` com 4 hotspots `hd/er/cc/hr` (`css/index.css:81` `opacity 0.01`). Passe mouse → `onMouseLeave` limpa; clique 1º → mostra imagem `ws/images/{caminho}` (`paginaQuiz.js:240`); clique 2º → alterna `Tem liquido? Sim/Não` e atualiza `Escore`.
4. **Navegação:** `1/3` + `Proximo` (salva `tempo` gasto por animal `paginaQuiz.js:198`) ou `Enviar` no último → `cadastrarFeedbackReq` `paginaQuiz.js:155` com `data:JSON.stringify([{idAnimal, tempo, escore, escoreCorreto, janelas}])` + `tempoTotal`.
5. **Feedback:** `ModalFeedback.jsx:27` mostra tabela por animal: `Usuário vs Resposta` com ✔/✘ e `Escore | Correto`, botões `Voltar à Página Inicial` ou `Tentar novamente` (reload).

**Escore:** `pontuacaoSugerida` (cliques `Sim`) vs `pontuacao` real (`count temLiquido` `ImagemJanelaController:193`).

**Atalhos:** Não há teclado; todo clique é mouse.

## 5. Admin Animais (`/animais` – `pages/adminAnimais.js:9`, nível 2)

- Tabela `#, Espécie, Status (Ativo/Inativo), Escore, Cadastro, Ações`.
- **Cadastrar:** botão azul → `ModalAnimal.jsx:13` inputs `Espécie`, `Status` → `POST /animal` (sempre `isActive` escolhido, `pontuacao` 0).
- **Editar/lista imagens:** ícone azul `bi-info-circle` → modal com tabela `Arquivo, Janela, Tem líquido?, Ações`: `bi-info-circle` editar janela/`temLiquido` (PUT `animal/:id/imagens/:img`), `bi-image` abre `ws/images` em nova aba, `bi-trash` deleta (DELETE). `Novo` só se `<4` imagens (`modalAnimal.jsx:219`).
- **Deletar animal:** `bi-trash` vermelho → `DELETE /animal/:id`.

**Regra:** `caminho = animal_{id}_{hd,hr,er,cc}.png` `ImagemJanelaController:102`. Máx 4 janelas por animal.

## 6. Feedbacks (`/feedbacks` – `pages/feedbacks.js:7`, nível 2)

- Tabela `#, Data, Usuario (nome), Tempo Total, Ações` → `CustomFeedbackModal:4` `Ver Feedbacks` → modal com `Animal N | Usuário | Resposta` ✔/✘ e `Escore | Correto`.

## 7. Usuários (`/admin/usuarios` – `pages/adminUsuarios.js:6`, nível 3)

- Tabela `#, Nome, Email, Nivel (Administrador/Medico/Usuario), Data Criação, Ações`.
- **Promover/Despromover:** botão `Promover` se `ROLE_USER` → `ROLE_TECNICO`, `Despromover` se `ROLE_TECNICO` → `ROLE_USER` (`UsuarioController:48`). Admin não pode ser alterado. Reload após.

## 8. Navegação (`components/menuAreas.jsx:4`)

Nav mostra só telas com `nivel <= nivelAcesso` e não atual: `Inicio (1)`, `Animais (2)`, `Feedbacks (2)`, `Usuarios (3)`.

## 9. Dados mock

Para testar sem cadastrar animais: use `sortear-animais/1` com animais seed `id 1` (ativo) e imagens `animal_12_*` se corrigir FK 12.

---
*Base: `frontend/04-pages.md`, `05-components.md`, `03-state-auth.md`*
