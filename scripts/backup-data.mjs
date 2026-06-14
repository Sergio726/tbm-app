// Backup de datos vía API REST (no requiere la librería supabase-js ni WebSocket).
// Funciona con Node 18+.
//
// Uso:
//   node scripts/backup-data.mjs
//
// Dos modos automáticos:
//   1) SERVICE_ROLE (backup COMPLETO): si en el entorno / .env.local existe
//      SUPABASE_SERVICE_ROLE_KEY, se usa esa clave y se exportan TODAS las filas
//      de todas las tablas (bypass de RLS) + todos los usuarios de auth.
//   2) RLS (backup PARCIAL): si no hay service_role, te pide email y contraseña
//      de USUARIO de la app y exporta solo lo visible por RLS para ese usuario.
//      La contraseña no se muestra en pantalla ni se guarda en ningún lado.
//
// Salida: ./backups/<fecha>/  con un .json por tabla + metadatos:
//   _resumen.json         resumen, modo, validación de integridad, huecos
//   _auth_user.json       (modo RLS) registro de auth del propio usuario
//   _auth_users.json      (modo service_role) todos los usuarios de auth
//   _schema_snapshot.json  columnas observadas por tabla (no es DDL completo)

import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import readline from 'node:readline';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

// --- 1. Leer credenciales del .env.local ----------------------------------
function loadEnv() {
  let raw = '';
  try {
    raw = readFileSync(join(ROOT, '.env.local'), 'utf8');
  } catch {
    return {};
  }
  const env = {};
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) env[m[1]] = m[2].trim();
  }
  return env;
}

// --- 2. Prompts (email visible, password oculta) --------------------------
function ask(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((res) => rl.question(question, (a) => { rl.close(); res(a.trim()); }));
}

function askHidden(question) {
  return new Promise((res) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl._writeToOutput = (s) => {
      if (s.includes('\n') || s.includes('\r')) process.stdout.write(s);
    };
    process.stdout.write(question);
    rl.question('', (value) => { rl.close(); process.stdout.write('\n'); res(value.trim()); });
  });
}

// --- 3. Tablas a exportar (todas las del esquema) -------------------------
const TABLES = [
  'companies', 'profiles', 'scorecards', 'kpis', 'energy_logs', 'invitations',
  'ritual_configs', 'pre_games', 'los_5_grandes', 'los_5_grandes_items',
  'war_ups', 'war_up_entries', 'cool_downs', 'parking_lot', 'weekly_reports',
  'disc_assessments', 'authority_matrix', 'tasks', 'task_updates',
  'rocks', 'rock_updates', 'idea_parking', 'decisions', 'leading_indicators',
  'feedbacks', 'workbook_responses', 'workbook_progress',
  // Sprint 12-15 (rama main): activos, notificaciones, tour, super coach.
  'process_assets', 'notifications', 'coach_assignments', 'coaching_notes',
];

async function main() {
  const env = loadEnv();
  const url = (process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL || '').replace(/\/$/, '');
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anonKey) {
    console.error('No encontré NEXT_PUBLIC_SUPABASE_URL / KEY en el entorno ni en .env.local');
    process.exit(1);
  }

  console.log(`\nProyecto: ${url}\n`);

  let mode, apikey, authHeaders, userEmail, userId, authToken;

  if (serviceKey) {
    // --- Modo SERVICE_ROLE: backup completo, bypass de RLS ------------------
    mode = 'service_role';
    apikey = serviceKey;
    authToken = serviceKey;
    authHeaders = { 'apikey': serviceKey, 'Authorization': `Bearer ${serviceKey}` };
    userEmail = 'service_role';
    console.log('Modo: SERVICE_ROLE (backup completo, todas las filas)\n');
  } else {
    // --- Modo RLS: login de usuario normal, backup parcial ------------------
    mode = 'rls';
    apikey = anonKey;
    const email = process.env.TBM_APP_EMAIL || env.TBM_APP_EMAIL || await ask('Email de usuario de la app: ');
    const password = process.env.TBM_APP_PASSWORD || env.TBM_APP_PASSWORD || await askHidden('Contraseña: ');
    if (!email || !password) {
      console.error('Faltan credenciales (TBM_APP_EMAIL / TBM_APP_PASSWORD).');
      process.exit(1);
    }

    console.log('\nIniciando sesión...');
    const loginRes = await fetch(`${url}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: { 'apikey': anonKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const loginJson = await loginRes.json();
    if (!loginRes.ok) {
      console.error('Error al iniciar sesión:', loginJson.error_description || loginJson.msg || JSON.stringify(loginJson));
      process.exit(1);
    }
    authToken = loginJson.access_token;
    userId = loginJson.user?.id;
    userEmail = loginJson.user?.email;
    authHeaders = { 'apikey': anonKey, 'Authorization': `Bearer ${authToken}` };
    console.log(`Sesión OK como ${userEmail} (id: ${userId})`);
    console.log('Modo: RLS (backup parcial, solo lo visible por tu usuario)\n');
  }

  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outDir = join(ROOT, 'backups', stamp);
  mkdirSync(outDir, { recursive: true });

  // --- Export de tablas -----------------------------------------------------
  const summary = [];
  const schemaSnapshot = {};
  for (const table of TABLES) {
    process.stdout.write(`  ${table} ... `);
    try {
      const res = await fetch(`${url}/rest/v1/${table}?select=*`, { headers: authHeaders });
      if (!res.ok) {
        const txt = await res.text();
        console.log(`ERROR ${res.status} (${txt.slice(0, 120)})`);
        summary.push({ table, rows: 0, error: `${res.status}: ${txt.slice(0, 200)}` });
        continue;
      }
      const data = await res.json();
      writeFileSync(join(outDir, `${table}.json`), JSON.stringify(data, null, 2), 'utf8');
      // Snapshot de columnas observadas (unión de claves de todas las filas).
      if (Array.isArray(data) && data.length) {
        const cols = new Set();
        for (const row of data) for (const k of Object.keys(row)) cols.add(k);
        schemaSnapshot[table] = [...cols].sort();
      } else {
        schemaSnapshot[table] = [];
      }
      console.log(`${data.length} filas`);
      summary.push({ table, rows: data.length });
    } catch (e) {
      console.log(`ERROR (${e.message})`);
      summary.push({ table, rows: 0, error: e.message });
    }
  }

  // --- Export de auth -------------------------------------------------------
  let authNote = null;
  try {
    if (mode === 'service_role') {
      process.stdout.write('  auth.users (admin) ... ');
      const res = await fetch(`${url}/auth/v1/admin/users?per_page=1000`, { headers: authHeaders });
      if (res.ok) {
        const json = await res.json();
        writeFileSync(join(outDir, '_auth_users.json'), JSON.stringify(json, null, 2), 'utf8');
        const n = Array.isArray(json.users) ? json.users.length : (Array.isArray(json) ? json.length : '?');
        console.log(`${n} usuarios`);
        authNote = `_auth_users.json: ${n} usuarios`;
      } else {
        console.log(`ERROR ${res.status}`);
        authNote = `auth admin export falló (${res.status})`;
      }
    } else {
      process.stdout.write('  auth.user (propio) ... ');
      const res = await fetch(`${url}/auth/v1/user`, { headers: authHeaders });
      if (res.ok) {
        const json = await res.json();
        writeFileSync(join(outDir, '_auth_user.json'), JSON.stringify(json, null, 2), 'utf8');
        console.log('OK');
        authNote = `_auth_user.json: ${json.email} (id ${json.id})`;
      } else {
        console.log(`ERROR ${res.status}`);
        authNote = `auth user export falló (${res.status})`;
      }
    }
  } catch (e) {
    authNote = `auth export error: ${e.message}`;
  }

  writeFileSync(join(outDir, '_schema_snapshot.json'), JSON.stringify(schemaSnapshot, null, 2), 'utf8');

  // --- Validación de integridad post-export --------------------------------
  // Re-lee cada .json escrito, lo parsea, y compara el conteo con lo reportado.
  const validation = [];
  for (const t of summary) {
    if (t.error) { validation.push({ table: t.table, ok: false, reason: 'export error' }); continue; }
    try {
      const parsed = JSON.parse(readFileSync(join(outDir, `${t.table}.json`), 'utf8'));
      const ok = Array.isArray(parsed) && parsed.length === t.rows;
      validation.push({ table: t.table, ok, count: Array.isArray(parsed) ? parsed.length : null });
    } catch (e) {
      validation.push({ table: t.table, ok: false, reason: e.message });
    }
  }
  const allValid = validation.every((v) => v.ok);

  const total = summary.reduce((a, t) => a + (t.rows || 0), 0);
  const notes = [
    mode === 'rls'
      ? 'Backup PARCIAL: limitado por RLS al usuario autenticado. No incluye filas de otros usuarios/empresas, ni auth.users completo, ni triggers/funciones/policies. El DDL completo está en supabase/*.sql.'
      : 'Backup por service_role: incluye todas las filas de las tablas listadas y los usuarios de auth. NO es un pg_dump: no incluye triggers/funciones/policies/índices (esos están en supabase/*.sql).',
    '_schema_snapshot.json son columnas OBSERVADAS en los datos, no el DDL real.',
  ];

  writeFileSync(
    join(outDir, '_resumen.json'),
    JSON.stringify({
      exportedAt: stamp,
      project: url,
      mode,
      user: userEmail,
      userId: userId || null,
      totalRows: total,
      integrityOk: allValid,
      auth: authNote,
      notes,
      tables: summary,
      validation,
    }, null, 2),
    'utf8',
  );

  console.log(`\nBackup completo: ${total} filas en ${outDir}`);
  console.log(`Integridad: ${allValid ? 'OK (todos los conteos coinciden)' : 'REVISAR (hay tablas con discrepancia)'}`);
  if (!allValid) {
    console.log('Tablas con problema:', validation.filter((v) => !v.ok).map((v) => v.table).join(', '));
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
