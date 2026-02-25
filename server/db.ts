import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

// Don't throw during build time - check at runtime instead
const DATABASE_URL = process.env.DATABASE_URL;

let pool: pg.Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

if (DATABASE_URL) {
  // Clean URL - remove channel_binding parameter if present (not needed for Neon pooler)
  const cleanUrl = DATABASE_URL.replace(/&channel_binding=require/g, '');
  pool = new Pool({
    connectionString: cleanUrl,
    ssl: { rejectUnauthorized: false },
  });
  db = drizzle(pool, { schema });
}

// Export a function that throws if db not available (for runtime checks)
export function getDb() {
  if (!db) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?"
    );
  }
  return db;
}

export function getPool() {
  if (!pool) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?"
    );
  }
  return pool;
}

// For backwards compatibility - these will throw if DATABASE_URL not set
export { pool, db };
