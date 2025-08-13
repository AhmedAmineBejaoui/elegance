import 'dotenv/config';
import type { Config } from 'drizzle-kit';

export default {
  schema: './shared/schema.ts',   // <-- chemin VERS ton @shared/schema
  out: './drizzle',               // dossier où écrire les migrations
  dialect: 'postgresql',          // (nouveau drizzle-kit) ou driver: 'pg' pour anciennes versions
  dbCredentials: {
    url: process.env.DATABASE_URL!, // exemple: postgres://user:pass@localhost:5432/ma_base
  },
} satisfies Config;
