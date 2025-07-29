// neonDb.ts - Improved connection with better error handling
import { Pool, PoolClient, QueryResult, PoolConfig } from 'pg';

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_1rhBDq8vKexd@ep-tiny-lake-a1r5jlkw-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: {
    rejectUnauthorized: false
  },
  // Connection pool configuration
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
  maxUses: 7500, // Close (and replace) a connection after it has been used 7500 times
});

// Handle pool errors
pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Test initial connection
pool.connect()
  .then((client: PoolClient) => {
    console.log('Connected to Neon PostgreSQL!');
    client.release(); // Release the client back to the pool
  })
  .catch((err: Error) => console.error('Connection error', err.stack));

export default pool;

// Query wrapper with retry logic
export const queryWithRetry = async (
  text: string, 
  params?: any[], 
  maxRetries: number = 3
): Promise<QueryResult<any>> => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await pool.query(text, params);
      return result;
    } catch (error: any) {
      console.error(`Query attempt ${i + 1} failed:`, error.message);
      
      if (i === maxRetries - 1) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error('Max retries exceeded');
};

// Type-safe query wrapper