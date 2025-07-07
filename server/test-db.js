import { Client } from 'pg';

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  console.log('Environment:', process.env.NODE_ENV || 'not set');
  console.log('DATABASE_URL present:', !!process.env.DATABASE_URL);
  console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length || 0);
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set');
    return;
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });

  try {
    console.log('🔗 Attempting to connect...');
    await client.connect();
    console.log('✅ Database connection successful!');
    
    // Test basic query
    console.log('🧪 Testing basic query...');
    const result = await client.query('SELECT NOW() as current_time');
    console.log('✅ Query successful:', result.rows[0]);
    
    // Check if tables exist
    console.log('📋 Checking tables...');
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    console.log('✅ Tables found:', tables.rows.map(row => row.table_name));
    
    // Check ticket count
    try {
      const ticketCount = await client.query('SELECT COUNT(*) as count FROM tickets');
      console.log('🎫 Tickets in database:', ticketCount.rows[0].count);
    } catch (err) {
      console.log('⚠️ Tickets table issue:', err.message);
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
  } finally {
    await client.end();
    console.log('🔚 Connection closed');
  }
}

testDatabaseConnection().catch(console.error); 