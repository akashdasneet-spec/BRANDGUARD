import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

const connectionString =
  process.env.DATABASE_URL ||
  process.env.STORAGE_URL ||
  process.env.POSTGRES_URL ||
  process.env.NEON_DATABASE_URL ||
  '';

const sql = neon(connectionString);
export const db = drizzle(sql, { schema });
export * from './schema';
