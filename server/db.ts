// server/db.ts
import { createPool } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";
import * as schema from "@shared/schema";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL/POSTGRES_URL is missing");
}
export const pool = createPool({ connectionString });

export const db = drizzle(pool, { schema });
export default db;
