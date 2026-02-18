# Verificação Vercel + GitHub (Sync Beds24)

**Data:** 15/02/2026 — feita via MCP (Chrome DevTools) nas abas abertas.

---

## GitHub Actions — OK

| Item | Status |
|------|--------|
| **CRON_SECRET** | Configurado (atualizado há 12 min) |
| **SYNC_API_URL** | Configurado (atualizado há 12 min) |
| Repositório | `gustavosarubbi/Anaue_Chales-main` |
| Workflow | `.github/workflows/sync-beds24.yml` com novo script (HTTP + Response no log) |

---

## Vercel — Problemas encontrados

### 1. Variáveis de ambiente: BEDS24 ausentes

- **Busca por "BEDS24" nas Environment Variables:** *"No Results Found"*.
- **Conclusão:** Não existem no projeto:
  - `BEDS24_API_KEY`
  - `BEDS24_PROP_KEY`
  - `BEDS24_ROOM_ID`

Sem essas variáveis, a rota `/api/sync/beds24` retornaria "Beds24 não configurado" (ou não rodaria o sync).

**O que já está na Vercel (visto na tela):**
- CRON_SECRET (Development, Preview, Production)
- SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ANON_KEY, SUPABASE_JWT_SECRET
- CHANNEX_* (projeto antigo; hoje usa Beds24)
- NEXT_PUBLIC_BASE_URL, MERCADOPAGO_*, POSTGRES_PASSWORD, etc.

### 2. Produção está em deploy antigo (rollback)

- **Produção atual (domínio anauejunglechales.com.br):** deploy **C41JfkhR9** — **Rolled Back**, commit **f203336 "update"** (2 dias atrás).
- **Deploys mais recentes:** **78qyJ2Cwq** e **6Nw624qU5** — commit **9ec2472 "emfevereiro"** (9 min e 1 h atrás), status **"Production: Staged"** (ainda não são a Produção ativa).

Ou seja: o domínio está servindo um deploy antigo (f203336), que **não** tem a rota `/api/sync/beds24` (que entrou em commits posteriores). Por isso a API em produção retorna **404/405**.

---

## O que fazer

### Na Vercel

1. **Environment Variables (Production, e Preview se usar)**  
   Adicionar (com os valores do seu `.env.local` ou do Beds24):
   - `BEDS24_API_KEY`
   - `BEDS24_PROP_KEY`
   - `BEDS24_ROOM_ID`  
   Conferir também se existe `NEXT_PUBLIC_SUPABASE_URL` em Production (o código usa essa chave).

2. **Colocar o código novo em Produção**  
   - Opção A: Em **Deployments**, abrir o deploy **9ec2472 emfevereiro** (ex.: 78qyJ2Cwq) e usar **Promote to Production** (ou equivalente).  
   - Opção B: Fazer um novo deploy a partir de `main` (push ou “Redeploy” no último deploy de main) e garantir que o domínio de produção aponte para esse deploy.

Depois disso, `https://www.anauejunglechales.com.br/api/sync/beds24` deve existir e responder 200 (desde que CRON_SECRET e BEDS24_* estejam corretos).

### No GitHub

- Nada a alterar: secrets e workflow estão corretos para o sync.

---

## Resumo

| Onde | Status | Ação |
|------|--------|------|
| GitHub Secrets | OK | Nenhuma |
| GitHub Workflow | OK | Nenhuma |
| Vercel BEDS24_* | Faltando | Adicionar as 3 variáveis em Production (e Preview se aplicar) |
| Vercel Produção | Deploy antigo (f203336) | Promover 9ec2472 para Production ou redeploy de main |

Depois de configurar as env vars e promover/redeploy, rodar de novo o workflow **Sync Beds24** e conferir o log (HTTP 200 e corpo da resposta).
