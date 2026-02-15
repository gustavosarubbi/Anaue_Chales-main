/**
 * Ajusta o state.vscdb do Cursor para não pedir permissão ao usar ferramentas MCP.
 * Execute com o Cursor FECHADO (feche o Cursor antes de rodar).
 *
 * Uso: node scripts/fix-cursor-mcp-permissions.js
 */

const fs = require('fs');
const path = require('path');

const STORAGE_KEY =
  'src.vs.platform.reactivestorage.browser.reactiveStorageServiceImpl.persistentStorage.applicationUser';

function getStatePath() {
  const appdata = process.env.APPDATA;
  if (!appdata) {
    throw new Error('APPDATA não definido (não é Windows?)');
  }
  return path.join(appdata, 'Cursor', 'User', 'globalStorage', 'state.vscdb');
}

async function main() {
  const statePath = getStatePath();
  if (!fs.existsSync(statePath)) {
    console.error('Ficheiro não encontrado:', statePath);
    process.exit(1);
  }

  const backupPath = statePath + '.backup-' + Date.now();
  console.log('A fazer backup para:', backupPath);
  fs.copyFileSync(statePath, backupPath);

  const initSqlJs = require('sql.js');
  const SQL = await initSqlJs();
  const fileBuffer = fs.readFileSync(statePath);
  const db = new SQL.Database(fileBuffer);

  const result = db.exec(
    "SELECT value FROM ItemTable WHERE key = '" + STORAGE_KEY.replace(/'/g, "''") + "'"
  );
  if (!result.length || !result[0].values.length) {
    console.error('Chave de estado não encontrada na base de dados.');
    db.close();
    process.exit(1);
  }

  const value = result[0].values[0][0];
  let data;
  try {
    data = typeof value === 'string' ? JSON.parse(value) : JSON.parse(value.toString());
  } catch (e) {
    console.error('Erro ao interpretar JSON do estado:', e.message);
    db.close();
    process.exit(1);
  }

  if (!data.composerState) {
    data.composerState = {};
  }

  const changes = [];
  if (data.composerState.yoloMcpToolsDisabled === true) {
    data.composerState.yoloMcpToolsDisabled = false;
    changes.push('yoloMcpToolsDisabled -> false');
  }
  if (data.composerState.useYoloMode !== true) {
    data.composerState.useYoloMode = true;
    changes.push('useYoloMode -> true');
  }

  if (changes.length === 0) {
    console.log('Nada a alterar (já está configurado para não pedir permissão MCP).');
    db.close();
    return;
  }

  console.log('A aplicar:', changes.join(', '));
  const newValue = JSON.stringify(data);
  db.run(
    "UPDATE ItemTable SET value = ? WHERE key = ?",
    [newValue, STORAGE_KEY]
  );
  const exported = db.export();
  db.close();
  fs.writeFileSync(statePath, Buffer.from(exported));
  console.log('Feito. Reabra o Cursor para as alterações terem efeito.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
