import type { Config } from 'drizzle-kit';

export default {
  schema: './db/schema/schema.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url:
      process.env.DATABASE_URL ||
      process.env.STORAGE_URL ||
      process.env.POSTGRES_URL ||
      process.env.NEON_DATABASE_URL ||
      '',
  },
} satisfies Config;
