// server/db.ts
import { sql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";
import * as schema from "@shared/schema";
import "dotenv/config";

if (!process.env.POSTGRES_URL) {
  throw new Error("POSTGRES_URL must be set");
}

export const db = drizzle(sql, { schema });
export default db;