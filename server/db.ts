import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "../shared/schema.js";

neonConfig.webSocketConstructor = ws;

// For development, use a fallback SQLite database if no DATABASE_URL is provided
if (!process.env.DATABASE_URL) {
  console.warn("DATABASE_URL not set. Using fallback configuration for development.");
  // You can set a default development database URL here
  process.env.DATABASE_URL = "postgresql://dev:dev@localhost:5432/dsa_tracker";
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });