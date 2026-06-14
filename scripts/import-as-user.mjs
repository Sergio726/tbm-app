// Importa un backup a un proyecto nuevo autenticado COMO EL USUARIO (no service_role).
// Funciona porque el usuario es dueño de su empresa (companies.owner_id = su uid),
// así que las políticas RLS le permiten insertar sus propios datos en orden FK.
// Hace upsert (merge-duplicates) y remapea OLD_UID -> NEW_UID. Idempotente.
//
// Uso:
//   TARGET_URL=https://<ref>.supabase.co  TARGET_ANON=<anon key> \
//   IMP_EMAIL=...  IMP_PASSWORD=...  \
//   node scripts/import-as-user.mjs <carpeta_backup> <NEW_UID> [OLD_UID]

import { readFileSync, existsSync } from 'node:fs';
import { isAbsolute, join } from 'node:path';

const DEFAULT_OLD_UID = 'ee600008-2c94-43e1-ba06-6c521590c50e';

const ORDER = [
  'companies', 'profiles', 'scorecards', 'kpis', 'energy_logs', 'invitations',
  'ritual_configs', 'pre_games', 'los_5_grandes', 'los_5_grandes_items',
  'war_ups', 'war_up_entries', 'cool_downs', 'parking_lot', 'weekly_reports',
  'disc_assessments', 'authority_matrix', 'tasks', 'task_updates',
  'rocks', 'rock_updates', 'idea_parking', 'decisions', 'leading_indicators',
  'feedbacks', 'workbook_responses', 'workbook_progress',
];

// Columnas GENERATED ALWAYS (no se pueden enviar por REST).
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
const url = (process.env.TARGET_URL || '').replace(/\/$/, '');
const anon = process.env.TARGET_ANON;
const email = process.env.IMP_EMAIL;
const password = process.env.IMP_PASSWORD;

if (!backupArg || !NEW_UID || !url || !anon || !email || !password) {
  console.error('Faltan args/env. Uso: TARGET_URL, TARGET_ANON, IMP_EMAIL, IMP_PASSWORD + <backup> <NEW_UID> [OLD_UID]');
  process.exit(1);
}
const backupDir = isAbsolute(backupArg) ? backupArg : join(process.cwd(), backupArg);

async function main() {
  // Login -> access token del usuario
  const lr = await fetch(`${url}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: anon, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const lj = await lr.json();
  if (!lr.ok) { console.error('Login falló:', lj.error_description || lj.msg || JSON.stringify(lj)); process.exit(1); }
  console.log(`Sesión OK como ${lj.user?.email} (id ${lj.user?.id})`);

  const headers = {
    apikey: anon,
    Authorization: `Bearer ${lj.access_token}`,
    'Content-Type': 'application/json',
    Prefer: 'resolution=merge-duplicates,return=minimal',
  };

  let totalOk = 0;
  const fails = [];
  for (const table of ORDER) {
    const file = join(backupDir, `${table}.json`);
    if (!existsSync(file)) continue;
    let rows = JSON.parse(readFileSync(file, 'utf8'));
    if (!Array.isArray(rows) || rows.length === 0) continue;

    rows = rows.map((r) => remap(r, OLD_UID, NEW_UID));
    const drop = GENERATED[table] || [];
    if (drop.length) rows = rows.map((r) => { const c = { ...r }; for (const k of drop) delete c[k]; return c; });

    process.stdout.write(`  ${table} (${rows.length}) ... `);
    const res = await fetch(`${url}/rest/v1/${table}`, { method: 'POST', headers, body: JSON.stringify(rows) });
    if (res.ok) { console.log('OK'); totalOk += rows.length; }
    else {
      const txt = await res.text();
      console.log(`ERROR ${res.status} (${txt.slice(0, 200)})`);
      fails.push({ table, status: res.status, body: txt.slice(0, 300) });
    }
  }

  console.log(`\nImport: ${totalOk} filas OK.`);
  if (fails.length) { console.log('Fallas:'); for (const f of fails) console.log(`  - ${f.table}: ${f.status} ${f.body}`); process.exit(1); }
}

main().catch((e) => { console.error(e); process.exit(1); });
