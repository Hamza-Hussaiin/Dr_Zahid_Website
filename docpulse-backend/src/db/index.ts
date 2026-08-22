import 'dotenv/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on('error', (err) => {
  // Prevent an idle client error from crashing the whole process
  console.error('Unexpected Postgres pool error', err);
});

export const db = drizzle(pool, { schema });
export { pool };
