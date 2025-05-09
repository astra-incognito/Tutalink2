import { defineConfig } from "drizzle-kit";
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Only add the next line if you use the external URL:
  // ssl: { rejectUnauthorized: false }
});

const db = drizzle(pool);

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
