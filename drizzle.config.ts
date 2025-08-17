import 'dotenv/config';
import type { Config } from 'drizzle-kit';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL must be set');
}

export default {
  schema: './shared/schema.ts',   // <-- chemin VERS ton @shared/schema
  out: './drizzle',               // dossier où écrire les migrations
  dialect: 'postgresql',          // (nouveau drizzle-kit) ou driver: 'pg' pour anciennes versions
  dbCredentials: {
    url: process.env.DATABASE_URL!, // exemple: postgres://user:pass@localhost:5432/ma_base
  },
} satisfies Config;
