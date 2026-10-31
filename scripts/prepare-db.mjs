#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Normalize Vercel PostgreSQL connection variables if DATABASE_URL is not set
if (!process.env.DATABASE_URL) {
  if (process.env.POSTGRES_PRISMA_URL) {
    process.env.DATABASE_URL = process.env.POSTGRES_PRISMA_URL;
  } else if (process.env.POSTGRES_URL) {
    process.env.DATABASE_URL = process.env.POSTGRES_URL;
  }
}

const args = process.argv.slice(2);
const explicitMode = args[0]; // 'local', 'sqlite', 'postgres', 'production'

const isVercel = Boolean(process.env.VERCEL);
const dbUrl = process.env.DATABASE_URL || '';
const isPostgresUrl =
  dbUrl.startsWith('postgres://') ||
  dbUrl.startsWith('postgresql://') ||
  dbUrl.startsWith('prisma+postgres://');

let usePostgres = false;
if (explicitMode === 'postgres' || explicitMode === 'production') {
  usePostgres = true;
} else if (explicitMode === 'local' || explicitMode === 'sqlite') {
  usePostgres = false;
} else {
  // Automatic mode: if building on Vercel or PostgreSQL connection string is provided
  usePostgres = isVercel || isPostgresUrl;
}

const prismaDir = path.join(rootDir, 'prisma');
const activeSchemaPath = path.join(prismaDir, 'schema.prisma');
const postgresSchemaPath = path.join(prismaDir, 'schema.postgresql.prisma');
const sqliteSchemaPath = path.join(prismaDir, 'schema.sqlite.prisma');

console.log(
  `[prepare-db] Target database engine: ${
    usePostgres ? 'PostgreSQL (Vercel / Production)' : 'SQLite (Local Development)'
  }`
);

// Ensure canonical schema files exist
if (!fs.existsSync(postgresSchemaPath)) {
  console.error(`[prepare-db] Error: Missing PostgreSQL schema at ${postgresSchemaPath}`);
  process.exit(1);
}
if (!fs.existsSync(sqliteSchemaPath) && fs.existsSync(activeSchemaPath)) {
  fs.copyFileSync(activeSchemaPath, sqliteSchemaPath);
}

// Copy appropriate schema to active prisma/schema.prisma
const sourceSchema = usePostgres ? postgresSchemaPath : sqliteSchemaPath;
const sourceContent = fs.readFileSync(sourceSchema, 'utf8');
const currentContent = fs.existsSync(activeSchemaPath) ? fs.readFileSync(activeSchemaPath, 'utf8') : '';

if (sourceContent !== currentContent) {
  fs.writeFileSync(activeSchemaPath, sourceContent, 'utf8');
  console.log(`[prepare-db] Synced prisma/schema.prisma with ${path.basename(sourceSchema)}`);
} else {
  console.log(`[prepare-db] prisma/schema.prisma is already up-to-date with ${path.basename(sourceSchema)}`);
}

// Generate Prisma Client
console.log(`[prepare-db] Generating Prisma Client...`);
try {
  execSync('npx prisma generate', { cwd: rootDir, stdio: 'inherit' });
} catch (error) {
  console.error(`[prepare-db] Failed to generate Prisma Client:`, error);
  process.exit(1);
}

// In Vercel production build, sync the database schema to PostgreSQL if connected
if (usePostgres && isPostgresUrl && isVercel) {
  console.log(`[prepare-db] Vercel deployment with PostgreSQL detected. Ensuring database schema is synced...`);
  try {
    execSync('npx prisma db push --skip-generate --accept-data-loss', {
      cwd: rootDir,
      stdio: 'inherit',
      env: process.env,
    });
    console.log(`[prepare-db] Database schema synced successfully with PostgreSQL.`);
  } catch (error) {
    console.warn(`[prepare-db] Note: Automatic prisma db push encountered a non-fatal warning during build.`);
  }
}
