import { createPool } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";
import * as schema from "./shared/schema.js";

let pool: ReturnType<typeof createPool> | null = null;
let drizzleDb: any = null;

export function getDb() {
  if (!pool) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL not set");
    pool = createPool({ connectionString: url });
    drizzleDb = drizzle(pool, { schema });
  }
  return pool;
}

export function getDrizzleDb() {
  if (!drizzleDb) {
    getDb();
  }
  return drizzleDb;
}
