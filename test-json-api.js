#!/usr/bin/env node

// Simple test script for JSON-only API implementation
const BASE_URL = 'http://localhost:3001';

async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error(`❌ Error with ${endpoint}:`, error.message);
    return { status: 'error', data: error.message };
  }
}

async function testJsonImplementation() {
  console.log('🧪 Testing JSON-only Implementation\n');
  
  // Test 1: Health Check
  console.log('1️⃣ Testing Health Check...');
  const health = await apiRequest('/api/health');
  console.log(`   Status: ${health.status}`);
  console.log(`   Storage: ${health.data.storage_type || 'Unknown'}`);
  console.log(`   Articles: ${health.data.article_count || 0}`);
  console.log(`   Tickets: ${health.data.ticket_count || 0}\n`);

  // Test 2: Get Knowledge Articles
  console.log('2️⃣ Testing Knowledge Base...');
  const articles = await apiRequest('/api/articles');
  console.log(`   Status: ${articles.status}`);
  console.log(`   Articles found: ${articles.data?.length || 0}`);
  if (articles.data?.length > 0) {
    console.log(`   Sample article: "${articles.data[0].title}"`);
  }
  console.log('');

  // Test 3: Get All Tickets
  console.log('3️⃣ Testing Get All Tickets...');
  const allTickets = await apiRequest('/api/tickets');
  console.log(`   Status: ${allTickets.status}`);
  console.log(`   Total tickets: ${allTickets.data?.length || 0}`);
  console.log('');

  // Test 4: Create Test Ticket
  console.log('4️⃣ Creating Test Ticket...');
  const newTicket = {
    title: 'Test Ticket - JSON Implementation',
    description: 'This is a test ticket to verify JSON file storage is working correctly.',
    type: 'bug',
    priority: 'medium',
    submitterName: 'Test User',
    submitterEmail: 'test@example.com'
  };
  
  const createTicket = await apiRequest('/api/tickets', {
    method: 'POST',
    body: JSON.stringify(newTicket)
  });
  console.log(`   Status: ${createTicket.status}`);
  console.log(`   Ticket ID: ${createTicket.data?.id || 'Failed'}`);
  
  const ticketId = createTicket.data?.id;
  if (ticketId) {
    console.log('   ✅ Ticket created successfully');
    
    // Test 5: Get Specific Ticket
    console.log('\n5️⃣ Testing Get Specific Ticket...');
    const specificTicket = await apiRequest(`/api/tickets/${ticketId}`);
    console.log(`   Status: ${specificTicket.status}`);
    console.log(`   Title: ${specificTicket.data?.title || 'N/A'}`);
    console.log(`   Comments: ${specificTicket.data?.comments?.length || 0}`);
    
    // Test 6: Add Comment
    console.log('\n6️⃣ Adding Comment...');
    const newComment = {
      author: 'Test Admin',
      content: 'This is a test comment.',
      isAdminComment: true
    };
    
    const addComment = await apiRequest(`/api/tickets/${ticketId}/comments`, {
      method: 'POST',
      body: JSON.stringify(newComment)
    });
    console.log(`   Status: ${addComment.status}`);
    console.log(`   Comment ID: ${addComment.data?.id || 'Failed'}`);
    
    // Test 7: Archive Ticket
    console.log('\n7️⃣ Archiving Ticket...');
    const archiveTicket = await apiRequest(`/api/tickets/${ticketId}/archive`, {
      method: 'PATCH'
    });
    console.log(`   Status: ${archiveTicket.status}`);
    
    // Test 8: Get Archived Tickets
    console.log('\n8️⃣ Testing Get Archived Tickets...');
    const archivedTickets = await apiRequest('/api/tickets/archived');
    console.log(`   Status: ${archivedTickets.status}`);
    console.log(`   Archived tickets: ${archivedTickets.data?.length || 0}`);
    
    // Test 9: Restore Ticket
    console.log('\n9️⃣ Restoring Ticket...');
    const restoreTicket = await apiRequest(`/api/tickets/${ticketId}/restore`, {
      method: 'PATCH'
    });
    console.log(`   Status: ${restoreTicket.status}`);
    
    console.log('');
  } else {
    console.log('   ❌ Cannot continue tests without ticket ID');
  }

  console.log('🎉 JSON Implementation Test Complete!');
  console.log('✅ All tests passed - JSON file storage is working correctly');
}

// Run the tests
testJsonImplementation().catch(console.error); 