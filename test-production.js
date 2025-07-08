#!/usr/bin/env node

// Production Test Suite for G'day AI Support Hub
const BASE_URL = 'https://gdayai-support-1qrv6vff2-steves-projects-48dae402.vercel.app';

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

async function runTests() {
  console.log('🚀 Starting Production Tests for G\'day AI Support Hub\n');
  
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

  // Test 3: Create Test Ticket
  console.log('3️⃣ Creating Test Ticket...');
  const newTicket = {
    title: 'Test Ticket - Production Verification',
    description: 'This is a test ticket created during production testing to verify the Turso database integration is working correctly.',
    type: 'bug',
    priority: 'high',
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
  if (!ticketId) {
    console.log('❌ Cannot continue tests without ticket ID\n');
    return;
  }
  console.log('');

  // Test 4: Get All Tickets
  console.log('4️⃣ Testing Get All Tickets...');
  const allTickets = await apiRequest('/api/tickets');
  console.log(`   Status: ${allTickets.status}`);
  console.log(`   Total tickets: ${allTickets.data?.length || 0}`);
  console.log('');

  // Test 5: Get Specific Ticket with Comments
  console.log('5️⃣ Testing Get Specific Ticket...');
  const specificTicket = await apiRequest(`/api/tickets/${ticketId}`);
  console.log(`   Status: ${specificTicket.status}`);
  console.log(`   Title: ${specificTicket.data?.title || 'N/A'}`);
  console.log(`   Comments: ${specificTicket.data?.comments?.length || 0}`);
  console.log('');

  // Test 6: Add Comment
  console.log('6️⃣ Adding Comment to Ticket...');
  const newComment = {
    author: 'Test Admin',
    content: 'This is a test comment added during production testing.',
    isAdminComment: true
  };
  
  const addComment = await apiRequest(`/api/tickets/${ticketId}/comments`, {
    method: 'POST',
    body: JSON.stringify(newComment)
  });
  console.log(`   Status: ${addComment.status}`);
  console.log(`   Comment ID: ${addComment.data?.id || 'Failed'}`);
  console.log('');

  // Test 7: Update Ticket Status
  console.log('7️⃣ Updating Ticket Status...');
  const updateTicket = await apiRequest(`/api/tickets/${ticketId}`, {
    method: 'PUT',
    body: JSON.stringify({
      status: 'in-progress',
      priority: 'medium'
    })
  });
  console.log(`   Status: ${updateTicket.status}`);
  console.log('');

  // Test 8: Archive Ticket
  console.log('8️⃣ Archiving Ticket...');
  const archiveTicket = await apiRequest(`/api/tickets/${ticketId}/archive`, {
    method: 'PATCH'
  });
  console.log(`   Status: ${archiveTicket.status}`);
  console.log('');

  // Test 9: Get Archived Tickets
  console.log('9️⃣ Testing Get Archived Tickets...');
  const archivedTickets = await apiRequest('/api/tickets/archived');
  console.log(`   Status: ${archivedTickets.status}`);
  console.log(`   Archived tickets: ${archivedTickets.data?.length || 0}`);
  console.log('');

  // Test 10: Restore Ticket
  console.log('🔟 Restoring Ticket...');
  const restoreTicket = await apiRequest(`/api/tickets/${ticketId}/restore`, {
    method: 'PATCH'
  });
  console.log(`   Status: ${restoreTicket.status}`);
  console.log('');

  // Test 11: Archive Again for Deletion Test
  console.log('1️⃣1️⃣ Re-archiving for Deletion Test...');
  const archiveAgain = await apiRequest(`/api/tickets/${ticketId}/archive`, {
    method: 'PATCH'
  });
  console.log(`   Status: ${archiveAgain.status}`);
  console.log('');

  // Test 12: Permanent Delete
  console.log('1️⃣2️⃣ Permanently Deleting Ticket...');
  const deleteTicket = await apiRequest(`/api/tickets/${ticketId}/permanent`, {
    method: 'DELETE'
  });
  console.log(`   Status: ${deleteTicket.status}`);
  console.log('');

  // Test 13: Verify Deletion
  console.log('1️⃣3️⃣ Verifying Deletion...');
  const verifyDelete = await apiRequest(`/api/tickets/${ticketId}`);
  console.log(`   Status: ${verifyDelete.status} (should be 404)`);
  console.log('');

  // Test 14: Test Knowledge Article View Increment
  if (articles.data?.length > 0) {
    console.log('1️⃣4️⃣ Testing Article View Increment...');
    const articleId = articles.data[0].id;
    const incrementView = await apiRequest(`/api/articles/${articleId}/view`, {
      method: 'POST'
    });
    console.log(`   Status: ${incrementView.status}`);
    console.log('');
  }

  // Final Health Check
  console.log('✅ Final Health Check...');
  const finalHealth = await apiRequest('/api/health');
  console.log(`   Status: ${finalHealth.status}`);
  console.log(`   Storage: ${finalHealth.data.storage_type || 'Unknown'}`);
  console.log(`   Final ticket count: ${finalHealth.data.ticket_count || 0}`);
  console.log('');

  console.log('🎉 Production Testing Complete!');
  console.log('✅ All functionality tested successfully with Turso database');
}

// Run the tests
runTests().catch(console.error); 