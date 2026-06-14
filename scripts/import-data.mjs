// Importa un backup (generado por backup-data.mjs) a un proyecto Supabase NUEVO.
// Usa la SERVICE_ROLE key del proyecto destino (bypass de RLS) e inserta vía REST
// (PostgREST) con upsert, respetando el orden de dependencias FK y remapeando el
// id del usuario viejo -> nuevo.
//
// REQUISITOS previos en el proyecto destino:
//   1) Aplicar el esquema completo (ver docs/RECOVERY_SUPABASE.md, sección runbook).
//   2) Crear el usuario en Authentication y copiar su id (ese es NEW_UID).
//
// Uso:
//   TARGET_SUPABASE_URL="https://<nuevo-ref>.supabase.co" \
//   TARGET_SERVICE_ROLE_KEY="<service_role del proyecto NUEVO>" \
//   node scripts/import-data.mjs <carpeta_backup> <NEW_UID> [OLD_UID]
//
//   - <carpeta_backup>: ruta a backups/<fecha> (relativa o absoluta).
//   - <NEW_UID>: id del usuario recién creado en Auth del proyecto nuevo.
//   - [OLD_UID]: opcional; por defecto el id histórico del usuario original.
//
// Seguridad: se niega a escribir sobre el proyecto original (onzsxbghmyuqykiejpxw)
// salvo que pases --force, para no tocar la base bloqueada por accidente.

import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, isAbsolute } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const DEFAULT_OLD_UID = 'ee600008-2c94-43e1-ba06-6c521590c50e';
const PROD_REF = 'onzsxbghmyuqykiejpxw';

// Orden de inserción respetando dependencias FK (padres antes que hijos).
const ORDER = [
  'companies', 'profiles',
  'scorecards', 'kpis', 'energy_logs', 'invitations',
  'ritual_configs', 'pre_games', 'los_5_grandes', 'los_5_grandes_items',
  'war_ups', 'war_up_entries', 'cool_downs', 'parking_lot', 'weekly_reports',
  'disc_assessments', 'authority_matrix', 'tasks', 'task_updates',
  'rocks', 'rock_updates', 'idea_parking', 'decisions', 'leading_indicators',
  'feedbacks', 'workbook_responses', 'workbook_progress',
];

function loadEnv() {
  let raw = '';
  try { raw = readFileSync(join(ROOT, '.env.local'), 'utf8'); } catch { return {}; }
  const env = {};
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

// Reemplaza recursivamente cualquier valor string igual a OLD_UID por NEW_UID.
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

async function main() {
  const args = process.argv.slice(2).filter((a) => a !== '--force');
  const force = process.argv.includes('--force');
  const env = loadEnv();

  const backupArg = args[0];
  const NEW_UID = args[1];
  const OLD_UID = args[2] || DEFAULT_OLD_UID;
  const url = (process.env.TARGET_SUPABASE_URL || env.TARGET_SUPABASE_URL || '').replace(/\/$/, '');
  const serviceKey = process.env.TARGET_SERVICE_ROLE_KEY || env.TARGET_SERVICE_ROLE_KEY;

  if (!backupArg || !NEW_UID) {
    console.error('Uso: node scripts/import-data.mjs <carpeta_backup> <NEW_UID> [OLD_UID]');
    console.error('     (con TARGET_SUPABASE_URL y TARGET_SERVICE_ROLE_KEY en el entorno)');
    process.exit(1);
  }
  if (!url || !serviceKey) {
    console.error('Faltan TARGET_SUPABASE_URL y/o TARGET_SERVICE_ROLE_KEY (proyecto destino).');
    process.exit(1);
  }
  if (url.includes(PROD_REF) && !force) {
    console.error(`SEGURIDAD: el destino es el proyecto original (${PROD_REF}). Abortando.`);
    console.error('Si REALMENTE querés escribir ahí, repetí el comando con --force.');
    process.exit(1);
  }

  const backupDir = isAbsolute(backupArg) ? backupArg : join(process.cwd(), backupArg);
  if (!existsSync(join(backupDir, '_resumen.json'))) {
    console.error(`No encuentro _resumen.json en ${backupDir}. ¿Es la carpeta correcta?`);
    process.exit(1);
  }

  console.log(`\nDestino:  ${url}`);
  console.log(`Backup:   ${backupDir}`);
  console.log(`Remapeo:  ${OLD_UID}  ->  ${NEW_UID}\n`);

  const headers = {
    'apikey': serviceKey,
    'Authorization': `Bearer ${serviceKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'resolution=merge-duplicates,return=minimal',
  };

  let totalInserted = 0;
  const report = [];
  for (const table of ORDER) {
    const file = join(backupDir, `${table}.json`);
    if (!existsSync(file)) { report.push({ table, skipped: 'sin archivo' }); continue; }
    let rows;
    try { rows = JSON.parse(readFileSync(file, 'utf8')); } catch (e) {
      report.push({ table, error: `JSON inválido: ${e.message}` }); continue;
    }
    if (!Array.isArray(rows) || rows.length === 0) { report.push({ table, rows: 0 }); continue; }

    const payload = rows.map((r) => remap(r, OLD_UID, NEW_UID));
    process.stdout.write(`  ${table} (${payload.length}) ... `);
    try {
      const res = await fetch(`${url}/rest/v1/${table}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const txt = await res.text();
        console.log(`ERROR ${res.status} (${txt.slice(0, 160)})`);
        report.push({ table, rows: payload.length, error: `${res.status}: ${txt.slice(0, 200)}` });
        continue;
      }
      console.log('OK');
      totalInserted += payload.length;
      report.push({ table, rows: payload.length, ok: true });
    } catch (e) {
      console.log(`ERROR (${e.message})`);
      report.push({ table, rows: payload.length, error: e.message });
    }
  }

  console.log(`\nImportación terminada: ${totalInserted} filas insertadas/upserted.`);
  const fails = report.filter((r) => r.error);
  if (fails.length) {
    console.log('\nTablas con error (revisar orden FK / esquema aplicado):');
    for (const f of fails) console.log(`  - ${f.table}: ${f.error}`);
    process.exit(1);
  }
  console.log('\nRecordá: avatares/archivos de Storage NO se migran con este script');
  console.log('(las URLs apuntan al proyecto viejo). Re-subir avatar desde la app si hace falta.');
}

main().catch((e) => { console.error(e); process.exit(1); });
