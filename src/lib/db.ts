import { Pool } from 'pg';
import { createClient } from '@supabase/supabase-js';

let pool: Pool | null = null;

export const getDbPool = () => {
  if (pool) return pool;

  if (process.env.NODE_ENV === 'development') {
    // Use local PostgreSQL in development
    pool = new Pool({
      connectionString: process.env.LOCAL_DATABASE_URL,
    });
    console.log('Using local PostgreSQL database');
  } else {
    // Use Supabase in production
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      throw new Error('Missing Supabase environment variables');
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    console.log('Using Supabase PostgreSQL database');
  }

  return pool;
};

export const query = async (text: string, params?: any[]) => {
  const pool = getDbPool();
  return pool.query(text, params);
};

// Close the pool when the application shuts down
process.on('SIGTERM', () => {
  if (pool) {
    pool.end();
  }
}); 