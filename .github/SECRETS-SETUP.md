# Secrets do workflow Sync Beds24

## Chave gerada (CRON_SECRET)

```
a74f45a492b069d5a97a315f59dd5864c7ff61eb54fdee2cfb7a58d808d338fb
```

## Já configurado na Vercel

- **CRON_SECRET** foi adicionado nos ambientes: production, preview, development.

## Configurar no GitHub

### Se `gh` não for reconhecido no terminal (Windows)

O GitHub CLI costuma estar em `C:\Program Files\GitHub CLI\gh.exe`. Use o caminho completo:

```powershell
cd C:\Users\denis\Desktop\Anaue_Chales-main

# Login (só uma vez)
& "C:\Program Files\GitHub CLI\gh.exe" auth login

# Definir os secrets
& "C:\Program Files\GitHub CLI\gh.exe" secret set SYNC_API_URL --body "https://www.anauejunglechales.com.br/api/sync/beds24"
& "C:\Program Files\GitHub CLI\gh.exe" secret set CRON_SECRET --body "a74f45a492b069d5a97a315f59dd5864c7ff61eb54fdee2cfb7a58d808d338fb"
```

Para que `gh` funcione sem caminho completo, feche e abra o terminal de novo (ou reinicie o Cursor) após a instalação do GitHub CLI.

Se preferir configurar pela interface: **GitHub → repositório → Settings → Secrets and variables → Actions** e crie:

| Nome           | Valor                                                                 |
|----------------|-----------------------------------------------------------------------|
| SYNC_API_URL   | `https://www.anauejunglechales.com.br/api/sync/beds24`               |
| CRON_SECRET    | `a74f45a492b069d5a97a315f59dd5864c7ff61eb54fdee2cfb7a58d808d338fb`   |

**Nota:** O valor de `CRON_SECRET` acima já está configurado na Vercel; use o mesmo no GitHub.
