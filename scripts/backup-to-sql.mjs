// Convierte un backup (JSON por tabla) en SQL idempotente para importar a un
// proyecto nuevo, remapeando el id del usuario viejo -> nuevo. Usa
// jsonb_populate_recordset para mapear el JSON directo a columnas (sin escapeo
// manual de tipos). Pensado para correr vía MCP execute_sql.
//
// Uso:
//   node scripts/backup-to-sql.mjs <carpeta_backup> <NEW_UID> [OLD_UID]
// Escribe scripts/_import.sql

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, isAbsolute } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DEFAULT_OLD_UID = 'ee600008-2c94-43e1-ba06-6c521590c50e';

// Orden FK: padres antes que hijos.
const ORDER = [
  'companies', 'profiles', 'scorecards', 'kpis', 'energy_logs', 'invitations',
  'ritual_configs', 'pre_games', 'los_5_grandes', 'los_5_grandes_items',
  'war_ups', 'war_up_entries', 'cool_downs', 'parking_lot', 'weekly_reports',
  'disc_assessments', 'authority_matrix', 'tasks', 'task_updates',
  'rocks', 'rock_updates', 'idea_parking', 'decisions', 'leading_indicators',
  'feedbacks', 'workbook_responses', 'workbook_progress',
];

// Columnas GENERATED ALWAYS que no se pueden insertar.
const GENERATED = { scorecards: ['total_score'] };

function remap(value, oldUid, newUid) {
  if (typeof value === 'string') return value === oldUid ? newUid : value;
  if (Array.isArray(value)) return value.map((v) => remap(v, oldUid, newUid));
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) out[k] = remap(v, oldUid, newUid);
    return out;
  }
  return value;
}

const backupArg = process.argv[2];
const NEW_UID = process.argv[3];
const OLD_UID = process.argv[4] || DEFAULT_OLD_UID;
if (!backupArg || !NEW_UID) {
  console.error('Uso: node scripts/backup-to-sql.mjs <carpeta_backup> <NEW_UID> [OLD_UID]');
  process.exit(1);
}
const backupDir = isAbsolute(backupArg) ? backupArg : join(process.cwd(), backupArg);

const TAG = '$tbmimport$';
const parts = ['begin;'];
const summary = [];

for (const table of ORDER) {
  const file = join(backupDir, `${table}.json`);
  if (!existsSync(file)) continue;
  let rows = JSON.parse(readFileSync(file, 'utf8'));
  if (!Array.isArray(rows) || rows.length === 0) continue;

  rows = rows.map((r) => remap(r, OLD_UID, NEW_UID));
  const drop = GENERATED[table] || [];
  if (drop.length) rows = rows.map((r) => { const c = { ...r }; for (const k of drop) delete c[k]; return c; });

  const json = JSON.stringify(rows);
  if (json.includes(TAG)) { console.error(`Conflicto de tag en ${table}`); process.exit(1); }

  // El perfil stub creado por el trigger handle_new_user debe ceder ante el real.
  if (table === 'profiles') parts.push(`delete from public.profiles where id = '${NEW_UID}';`);

  parts.push(
    `insert into public.${table} ` +
    `select * from jsonb_populate_recordset(null::public.${table}, ${TAG}${json}${TAG}::jsonb) ` +
    `on conflict (id) do nothing;`,
  );
  summary.push(`${table}: ${rows.length}`);
}

parts.push('commit;');
const outFile = join(ROOT, 'scripts', '_import.sql');
writeFileSync(outFile, parts.join('\n'), 'utf8');
console.log('Escrito:', outFile);
console.log('Tablas:', summary.join(', '));
