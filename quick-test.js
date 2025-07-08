// Quick test to check API health endpoint
import fetch from 'node-fetch';

async function testHealth() {
  try {
    const response = await fetch('https://gdayai-support-m0pf85l63-steves-projects-48dae402.vercel.app/api/health');
    const text = await response.text();
    
    console.log('Status:', response.status);
    console.log('Response type:', response.headers.get('content-type'));
    console.log('First 200 chars of response:');
    console.log(text.substring(0, 200));
    
    if (text.includes('doctype')) {
      console.log('🚨 API is returning HTML instead of JSON - route not found!');
    }
  } catch (error) {
    console.log('❌ ERROR:', error.message);
  }
}

testHealth(); 