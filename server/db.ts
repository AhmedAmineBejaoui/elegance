// server/db.ts
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "@shared/schema";
import "dotenv/config";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

// Use Neon serverless for Vercel deployment
const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });
export default db;