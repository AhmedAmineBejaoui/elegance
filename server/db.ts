import { createPool } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";
import * as schema from "@shared/schema";

export const config = { runtime: "nodejs" };

const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!url) throw new Error("DATABASE_URL/POSTGRES_URL is not set");

export const db = createPool({ connectionString: url });
export const drizzleDb = drizzle(db, { schema });
export default drizzleDb;
