#!/usr/bin/env node

import { createClient } from '@libsql/client';

async function testTursoConnection() {
  console.log('🔗 Testing Turso connection directly...\n');
  
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL || 'libsql://database-gday-ai-vercel-icfg-cl3bonkcljkshvivqgcnyeky.aws-us-east-1.turso.io',
    authToken: process.env.TURSO_AUTH_TOKEN || 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJnaWQiOiIwY2RlZWU0Yi02ZmJkLTQ0MmYtYWQwZC03NjU5MWE4MTdhMWYiLCJpYXQiOjE3NTE5NTgzNzEsInJpZCI6ImZlMzdlMGUwLWI0ZjgtNGNmMS04YWIwLWEyNzYzYTM2NTIyNyJ9.usc2LwBzQus_ajvbFRd-h3hNTfFtMsl3Ze3ZStaFDDJJq1ZtbEoHw8Wi-Ywz0ORT0ed9QkDyN6swUQ1mAwrQAg'
  });

  try {
    // Test 1: Simple SELECT
    console.log('1. Testing simple SELECT 1...');
    const result1 = await client.execute('SELECT 1 as test');
    console.log('✅ SUCCESS:', result1.rows);
    
    // Test 2: List existing tables
    console.log('\n2. Listing existing tables...');
    const result2 = await client.execute("SELECT name FROM sqlite_master WHERE type='table'");
    console.log('✅ Tables found:', result2.rows);
    
    // Test 3: Simple table creation
    console.log('\n3. Testing table creation...');
    const result3 = await client.execute(`
      CREATE TABLE IF NOT EXISTS test_table (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL
      )
    `);
    console.log('✅ Table created successfully');
    
    // Test 4: Insert data
    console.log('\n4. Testing insert...');
    const result4 = await client.execute({
      sql: "INSERT INTO test_table (id, name) VALUES (?, ?)",
      args: ['test-id', 'test-name']
    });
    console.log('✅ Insert successful');
    
    // Test 5: Select data
    console.log('\n5. Testing select...');
    const result5 = await client.execute("SELECT * FROM test_table");
    console.log('✅ Data retrieved:', result5.rows);
    
    // Test 6: Clean up
    console.log('\n6. Cleaning up...');
    await client.execute("DROP TABLE test_table");
    console.log('✅ Cleanup complete');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
  }
}

testTursoConnection(); 