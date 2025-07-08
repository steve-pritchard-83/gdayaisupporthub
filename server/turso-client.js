import { createClient } from '@libsql/client';

// Turso client - drop-in replacement for PostgreSQL
class TursoClient {
  constructor() {
    this.client = createClient({
      url: process.env.TURSO_DATABASE_URL || 'file:support_tickets.db',
      authToken: process.env.TURSO_AUTH_TOKEN
    });
  }

  async query(sql, params = []) {
    try {
      const result = await this.client.execute({
        sql,
        args: params
      });
      
      // Format response to match PostgreSQL client
      return {
        rows: result.rows.map(row => {
          const obj = {};
          result.columns.forEach((col, index) => {
            obj[col] = row[index];
          });
          return obj;
        }),
        rowCount: result.rows.length
      };
    } catch (error) {
      console.error('Turso query error:', error);
      throw error;
    }
  }

  async end() {
    // Turso doesn't need explicit connection closing
  }
}

export const getTursoClient = () => new TursoClient(); 