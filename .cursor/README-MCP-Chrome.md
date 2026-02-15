# Cursor + Chrome (MCP servers com sinergia ao Chrome)

Este projeto configura vários MCP servers no `.cursor/mcp.json` para automação, debug e fetch de páginas, todos com suporte ao Chrome instalado na máquina.

---

## Usar só Chrome por padrão (sem browser dentro do Cursor)

Para a automação **sempre usar o Chrome** instalado e nunca abrir o navegador embutido do Cursor:

1. Abra **Cursor** → **Settings** (Ctrl+,).
2. Vá em **Tools & MCP** (ou **Features** → **MCP**).
3. Em **Browser Automation**, deixe em **Off** (não use "Browser Tab").
4. Mantenha os MCPs **playwright** e **browsermcp** ativados (Enabled).

Assim, quando você pedir algo no Agent (abrir site, YouTube, etc.), o Cursor **não** usará o browser interno; só os MCPs que abrem o **Chrome** (Playwright ou Browser MCP com a aba conectada) serão usados.

---

## Parar de pedir permissão para MCP (sempre permitir)

Se o Cursor ficar a pedir permissão cada vez que o Agent usa uma ferramenta MCP e a opção "Add to allowlist" não funcionar, pode corrigir editando o estado interno do Cursor:

1. **Feche o Cursor por completo** (todas as janelas).
2. No terminal (PowerShell ou CMD), na pasta do projeto:
   ```bash
   npm run fix-cursor-mcp
   ```
3. O script faz backup do `state.vscdb`, define `yoloMcpToolsDisabled = false` e `useYoloMode = true` para não pedir confirmação.
4. Abra o Cursor de novo.

**Atenção:** Isto permite que o Agent execute ferramentas MCP e comandos sem pedir confirmação. Use por sua conta e risco.

---

## Servidores configurados

| Servidor | Função | Como usar |
|----------|--------|-----------|
| **browsermcp** | Controlar uma aba já aberta no Chrome | Extensão no Chrome → Connect |
| **playwright** | Abrir/controlar Chrome, testes E2E, inspecionar | Agent pede para abrir página; usa Chrome do path |
| **chrome-devtools** | Debug, performance, network, console, DOM | Chrome com remote debugging (veja abaixo) |
| **puppeteer** | Automação com janela visível (navegar, screenshots, JS) | Agent usa ferramentas Puppeteer; abre Chrome do path |
| **fetch** | Buscar URL → HTML/Markdown sem abrir browser | Agent usa para obter conteúdo de páginas |

---

## 1. Browser MCP (browsermcp)

Controla uma aba do Chrome que você já abriu e conectou.

- **Extensão:** instale [Browser MCP](https://browsermcp.io/install) no **Chrome**.
- No Chrome: abra uma aba → clique no ícone da extensão → **Connect**.
- No Cursor: use o chat com **Agent**; o agente usa essa aba.

**Path do Chrome:** `env.CHROME_EXECUTABLE_PATH` no `mcp.json` = `C:\Program Files\Google\Chrome\Application\chrome.exe`.

---

## 2. Playwright MCP (playwright)

Abre e controla o Chrome instalado (sem precisar da extensão). Útil para abrir páginas, inspecionar e conectar ao dev.

- Em **Cursor** → **Settings** → **Tools & MCP**: confira se **playwright** está **Enabled** e dê **Refresh**.
- No Agent, peça para abrir uma URL ou inspecionar uma página.

**Path do Chrome:** `env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` aponta para o `chrome.exe` da máquina.

---

## 3. Chrome DevTools MCP (chrome-devtools)

Conecta ao Chrome em execução para debug, performance, network e console.

**Requisitos:**

- **Chrome 144+** (ou atual estável).
- **Remote debugging:** o Chrome precisa estar acessível com debugging (uma das opções abaixo):
  - Abra `chrome://inspect/#remote-debugging` e ative remote debugging; ou
  - Inicie o Chrome com: `--remote-debugging-port=9222`.

O servidor usa `--autoConnect` e tenta conectar automaticamente ao Chrome. Quando o MCP pede conexão, o Chrome pode exibir um diálogo de permissão.

---

## 4. Puppeteer MCP (puppeteer)

Automação com janela visível do Chrome: navegar, screenshots, executar JavaScript na página.

- O Agent pode usar as ferramentas do Puppeteer (ex.: navegar, capturar tela).
- O Chrome é aberto com o executável definido em `PUPPETEER_LAUNCH_OPTIONS` (path no `mcp.json`).
- `ALLOW_DANGEROUS: true` é necessário para modo não-headless em alguns ambientes.

**Path do Chrome:** definido em `env.PUPPETEER_LAUNCH_OPTIONS` no `mcp.json`.

---

## 5. Fetch (fetch)

Busca conteúdo de URLs (HTML, Markdown, etc.) sem abrir o browser. Complementa a automação quando o Agent só precisa do conteúdo da página.

- **Implementação:** script `npm run mcp-fetch` no projeto, que roda `mcp-node-fetch`.
- **Dependência:** `mcp-node-fetch` em `devDependencies` no `package.json`.
- Ferramentas típicas: `fetch-url`, `extract-html-fragment`, `check-status`.

Se aparecer erro "No server info found" para um servidor fetch antigo nas configurações globais do Cursor, remova-o em **Settings → MCP** e use o **fetch** configurado no `.cursor/mcp.json` deste projeto.

---

## 6. Firecrawl (opcional)

**Não está no `mcp.json` por padrão.** Scraping e busca web avançada; usa API na nuvem.

- Requer **API key** em [firecrawl.dev](https://firecrawl.dev).
- Para ativar: adicione no `mcp.json` um servidor com `env.FIRECRAWL_API_KEY` e o comando do Firecrawl MCP (ex.: `npx -y firecrawl-mcp`).

---

## Automação interna do Cursor (Browser Automation)

Se quiser que a automação *embutida* do Cursor use o Chrome:

1. **Cursor** → **Settings** (Ctrl+,).
2. **Features** → **Tools & MCP**.
3. Em **Browser Automation**, escolha **Browser Tab** (não "Off").
4. Se existir opção **Chrome**, pode selecioná-la; caso contrário, use Browser Tab ou os MCPs acima.

---

## Outros problemas

- **“Client closed”:** no `browsermcp`, troque `["@browsermcp/mcp@latest"]` por `["@browsermcp/mcp"]` nos `args`.
- **Nada acontece no Chrome (Browser MCP):** confira se clicou em **Connect** na extensão e se a aba está aberta.
- **Servidor não inicia:** em **Settings → MCP** confira se o servidor está **Enabled** e clique em **Refresh**.
- **"Access token expired or revoked":** aviso do npm (login); não impede o uso dos outros servidores (browsermcp, playwright, etc.).
