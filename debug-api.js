#!/usr/bin/env node

const BASE_URL = 'https://gdayai-support-lv7ny8u8n-steves-projects-48dae402.vercel.app';

async function debugEndpoints() {
  console.log('🔍 Debugging API endpoints...\n');
  
  // Test 1: Articles endpoint
  console.log('1. Testing /api/articles...');
  try {
    const response = await fetch(`${BASE_URL}/api/articles`);
    console.log('Status:', response.status);
    console.log('Content-Type:', response.headers.get('content-type'));
    
    const text = await response.text();
    console.log('Response body:', text.substring(0, 200) + (text.length > 200 ? '...' : ''));
  } catch (error) {
    console.error('Error:', error);
  }
  
  console.log('\n2. Testing /api/tickets...');
  try {
    const response = await fetch(`${BASE_URL}/api/tickets`);
    console.log('Status:', response.status);
    console.log('Content-Type:', response.headers.get('content-type'));
    
    const text = await response.text();
    console.log('Response body:', text.substring(0, 200) + (text.length > 200 ? '...' : ''));
  } catch (error) {
    console.error('Error:', error);
  }
  
  console.log('\n3. Testing /api/health...');
  try {
    const response = await fetch(`${BASE_URL}/api/health`);
    console.log('Status:', response.status);
    console.log('Content-Type:', response.headers.get('content-type'));
    
    const text = await response.text();
    console.log('Response body:', text);
  } catch (error) {
    console.error('Error:', error);
  }
}

debugEndpoints(); 