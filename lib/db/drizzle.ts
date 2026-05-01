import { neon } from '@neondatabase/serverless';
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import dotenv from 'dotenv';
import postgres from 'postgres';
import * as schema from './schema';

dotenv.config({ path: '.env' });
dotenv.config({ path: '.env.local', override: true });

const legacyLocalFallbackDatabaseUrl =
  'postgres://postgres:postgres@localhost:54322/postgres';

function resolveDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  if (process.env.VERCEL || process.env.VERCEL_ENV) {
    throw new Error(
      'DATABASE_URL is required for Vercel runtime. Attach Neon Postgres in the Vercel project before deploying.'
    );
  }

  if (process.env.POSTGRES_URL) {
    // Legacy fallback kept only for local migration/bootstrap compatibility.
    return process.env.POSTGRES_URL;
  }

  return legacyLocalFallbackDatabaseUrl;
}

function resolveLocalDirectDatabaseUrl() {
  return (
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL ||
    legacyLocalFallbackDatabaseUrl
  );
}

export type AppDb = PostgresJsDatabase<typeof schema>;

function createDb(): AppDb {
  if (!process.env.VERCEL && !process.env.VERCEL_ENV) {
    const sql = postgres(resolveLocalDirectDatabaseUrl(), {
      max: 1,
      prepare: false,
      idle_timeout: 20,
      connect_timeout: 15,
    });
    return drizzlePostgres(sql, { schema }) as AppDb;
  }

  const sql = neon(resolveDatabaseUrl());
  return drizzleNeon(sql, { schema }) as unknown as AppDb;
}

let dbInstance: AppDb | null = null;

export function getDb(): AppDb {
  if (!dbInstance) {
    dbInstance = createDb();
  }

  return dbInstance;
}

export const isUsingFallbackDatabaseUrl =
  !process.env.DATABASE_URL && !process.env.POSTGRES_URL;
export const isUsingLegacyPostgresUrl =
  !process.env.DATABASE_URL && Boolean(process.env.POSTGRES_URL);
export const db: AppDb = getDb();
