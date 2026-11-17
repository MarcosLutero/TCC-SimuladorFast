# Guia de Deploy — Frontend (`TCC-SimuladorFast`)

Arquitetura atual em produção gratuita:
- **Frontend (React / Create React App):** Vercel (`https://simulador-afast.vercel.app`)
- **Backend API:** Render (`https://simulador-afast-backend.onrender.com`)

---

## 1. Arquivos de Deploy no Repositório

- [`vercel.json`](./vercel.json) *(raiz do repo)*: configura `installCommand`, `buildCommand`, `outputDirectory` (`frontend/build`) e rewrite de SPA (`/(.*) -> /index.html`) para importar o repositório direto pela raiz.
- [`frontend/vercel.json`](./frontend/vercel.json): rewrite de SPA para quando o projeto é publicado a partir da pasta `frontend/` (via CLI ou *Root Directory* = `frontend`).
- [`frontend/.env`](./frontend/.env): usado no desenvolvimento local (`npm start` via `env-cmd`). Em produção na Vercel, **a variável configurada no painel da Vercel sobrescreve esse arquivo**.

---

## 2. Variáveis de Ambiente na Vercel

Configure no projeto da Vercel (**Settings → Environment Variables**) para *Production*, *Preview* e *Development*:

| Variável | Valor |
|---|---|
| `REACT_APP_API_URL` | `https://simulador-afast-backend.onrender.com` *(sem barra `/` e sem espaço no final)* |

> **Importante:** no Create React App, variáveis `REACT_APP_*` são embutidas no JavaScript **em tempo de build**. Se alterar `REACT_APP_API_URL`, é obrigatório fazer um novo deploy (**Redeploy**) para o bundle atualizar.

---

## 3. Regra de Build em CI (`CI=true`)

A Vercel executa o build com `CI=true`, o que transforma **qualquer warning de ESLint em erro de build**.
Antes de publicar ou commitar, valide localmente exatamente como na Vercel:

```bash
cd frontend
CI=true REACT_APP_API_URL=https://simulador-afast-backend.onrender.com npm run build
```

O comando precisa terminar com `Compiled successfully.` (sem warnings).

---

## 4. Como Publicar Atualizações

### Opção A — Deploy direto via Vercel CLI (usado atualmente)
Se o projeto já estiver vinculado (`frontend/.vercel/project.json`):

```bash
cd frontend
npx vercel --prod
```

*(Caso ainda não esteja autenticado/vinculado nessa máquina:)*
```bash
cd frontend
npx vercel login
npx vercel link --project simulador-afast --scope wagners-projects-5bd6cc43 --yes
npx vercel --prod
```

### Opção B — Deploy automático via GitHub
1. No painel da Vercel (**Settings → Git**), conecte o repositório `MarcosLutero/TCC-SimuladorFast` (branch `main`).
2. A cada `git push origin main`, a Vercel dispara um novo build automaticamente.

---

## 5. Verificação Pós-Deploy

1. Pelo terminal:
   ```bash
   cd frontend
   npx vercel ls
   ```
   Confirme que o deploy mais recente está **`Ready`** e com o alias `https://simulador-afast.vercel.app`.
2. No navegador:
   - Abra `https://simulador-afast.vercel.app` e teste o login (`OPTIONS` / `POST /auth/login` deve retornar `200`, não erro de CORS).
   - Se der erro de CORS ao usar uma nova URL de preview/domínio, adicione essa origem em `FRONTEND_URL` no painel do **Render** (sem espaços e sem `/` no final).
   - Se navegar direto para uma rota como `/relatorios` ou `/quiz` e recarregar a página (`F5`), o rewrite em `vercel.json` deve carregar o app normalmente sem `404`.
