require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const hasSupabaseCredentials = Boolean(
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY
);

const defaultDumpPath = path.resolve(
  __dirname,
  'backup',
  'db_cluster-30-04-2025@06-21-15.sql'
);
const dumpPath = process.env.PG_DUMP_PATH
  ? path.resolve(process.env.PG_DUMP_PATH)
  : defaultDumpPath;

let scriptToRun = null;

if (hasSupabaseCredentials) {
  scriptToRun = path.resolve(__dirname, 'migrate-to-mongodb.js');
  console.log('Using Supabase API migration (SUPABASE_URL + SUPABASE_SERVICE_KEY found)');
} else if (fs.existsSync(dumpPath)) {
  scriptToRun = path.resolve(__dirname, 'import-pg-dump-to-mongodb.js');
  if (!process.env.PG_DUMP_PATH) {
    process.env.PG_DUMP_PATH = dumpPath;
  }
  console.log(`Supabase credentials missing, using SQL dump migration: ${dumpPath}`);
} else {
  console.error(
    'Cannot migrate: provide SUPABASE_URL and SUPABASE_SERVICE_KEY, or place a SQL dump at ' +
      dumpPath
  );
  process.exit(1);
}

const result = spawnSync(process.execPath, [scriptToRun], {
  stdio: 'inherit',
  env: process.env,
});

if (result.error) {
  console.error(`Migration runner failed: ${result.error.message}`);
  process.exit(1);
}

process.exit(result.status || 0);
