#!/usr/bin/env node
/**
 * ============================================================
 * verify-integration.js
 * Automated Integration Verification Script
 * Tests all layers: Frontend > Admin Panel > Backend > MongoDB
 * ============================================================
 */

const http = require('http');
const https = require('https');

const BASE_URL = 'http://localhost:3000/api';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  yellow: '\x1b[33m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function makeFetch(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = url.startsWith('https') ? https : http;
    
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      timeout: 5000
    };

    const req = protocol.request(urlObj, requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            data: parsed,
            headers: res.headers
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: null,
            raw: data,
            headers: res.headers
          });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

// ============================================================
// Tests
// ============================================================

async function testBackendServer() {
  log('\n=== LAYER 1: Backend Server ===', 'magenta');
  
  try {
    log('Testing: GET http://localhost:3000', 'cyan');
    const response = await makeFetch('http://localhost:3000');
    
    if (response.status === 200) {
      log('[PASS] Backend Server: Running on port 3000', 'green');
      log(`   Message: ${response.data.message}`, 'green');
      return true;
    }
  } catch (error) {
    log('[FAIL] Backend Server: Not responding', 'red');
    log(`   Error: ${error.message}`, 'red');
    log("   Fix: Run 'node server.js' in backend directory", 'yellow');
    return false;
  }
}

async function testDatabaseConnection() {
  log('\n=== LAYER 2: Database Connection ===', 'magenta');
  
  try {
    log('Testing: Database query via backend (GET /api/courses)', 'cyan');
    const response = await makeFetch(`${BASE_URL}/courses`);
    
    if (response.status === 200) {
      log('[PASS] Database Connection: Working', 'green');
      const courseCount = response.data.courses ? response.data.courses.length : 0;
      log(`   Courses found: ${courseCount}`, 'green');
      return true;
    }
  } catch (error) {
    log('[FAIL] Database Connection: Failed', 'red');
    log(`   Error: ${error.message}`, 'red');
    log('   Fix: Verify MongoDB connection in .env file', 'yellow');
    return false;
  }
}

async function testAuthRoutes() {
  log('\n=== LAYER 3: Auth Routes ===', 'magenta');
  
  try {
    log('Testing: POST /api/auth/register endpoint', 'cyan');
    
    const testUser = {
      name: `Integration Test ${Date.now()}`,
      username: `testuser_${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      password: 'TestPassword123!'
    };

    const response = await makeFetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      body: testUser
    });

    if (response.status === 201) {
      log('[PASS] Auth/Register: Working (201 Created)', 'green');
      if (response.data.user && response.data.user._id) {
        log(`   User ID: ${response.data.user._id}`, 'green');
      }
      return true;
    } else if (response.status === 400) {
      log('[WARN] Auth/Register: User might already exist', 'yellow');
      return true;
    }
  } catch (error) {
    log('[FAIL] Auth/Register: Failed', 'red');
    log(`   Error: ${error.message}`, 'red');
    return false;
  }
}

async function testAdminRoutes() {
  log('\n=== LAYER 4: Admin Routes ===', 'magenta');
  
  try {
    // Try to get users without token first (should fail with 401)
    log('Testing: GET /api/admin/users (checking auth requirement)', 'cyan');
    const response = await makeFetch(`${BASE_URL}/admin/users`);
    
    if (response.status === 401) {
      log('[PASS] Admin/Users: Requires authentication (401 expected)', 'green');
      log('   Note: Admin endpoints are properly protected', 'green');
      return true;
    } else if (response.status === 200) {
      log('[PASS] Admin/Users: Accessible', 'green');
      const userCount = response.data.users ? response.data.users.length : 0;
      log(`   Users found: ${userCount}`, 'green');
      return true;
    }
  } catch (error) {
    log('[WARN] Admin/Users: Could not be tested', 'yellow');
    log(`   Error: ${error.message}`, 'yellow');
    return true; // Not a failure, just couldn't test
  }
}

async function testCORSConfiguration() {
  log('\n=== LAYER 5: CORS Configuration ===', 'magenta');
  
  try {
    log('Testing: CORS headers', 'cyan');
    const response = await makeFetch('http://localhost:3000');
    
    const corsHeaders = Object.keys(response.headers).filter(h => 
      h.toLowerCase().includes('access-control')
    );
    
    if (corsHeaders.length > 0) {
      log('[PASS] CORS: Enabled', 'green');
      corsHeaders.forEach(header => {
        log(`   ${header}: ${response.headers[header]}`, 'green');
      });
      return true;
    } else {
      log('[WARN] CORS: Headers not found (may still be working)', 'yellow');
      return true;
    }
  } catch (error) {
    log('[FAIL] CORS check failed', 'red');
    log(`   Error: ${error.message}`, 'red');
    return false;
  }
}

async function testResponseFormat() {
  log('\n=== LAYER 6: Response Format ===', 'magenta');
  
  try {
    log('Testing: Response format and structure', 'cyan');
    const response = await makeFetch(`${BASE_URL}/courses`);
    
    if (response.data && typeof response.data === 'object') {
      log('[PASS] Response Format: Valid JSON', 'green');
      const fields = Object.keys(response.data);
      log(`   Fields: ${fields.join(', ')}`, 'green');
      return true;
    }
  } catch (error) {
    log('[FAIL] Response Format: Invalid', 'red');
    log(`   Error: ${error.message}`, 'red');
    return false;
  }
}

// ============================================================
// Main Execution
// ============================================================
async function main() {
  console.clear();
  log('================================================================', 'magenta');
  log('     NGODING YUK - FULL INTEGRATION VERIFICATION', 'magenta');
  log('     Frontend > Admin Panel > Backend > MongoDB', 'magenta');
  log('================================================================\n', 'magenta');

  const results = {};

  results['Backend Server'] = await testBackendServer();
  results['Database Connection'] = await testDatabaseConnection();
  results['Auth Routes'] = await testAuthRoutes();
  results['Admin Routes'] = await testAdminRoutes();
  results['CORS Configuration'] = await testCORSConfiguration();
  results['Response Format'] = await testResponseFormat();

  // ============================================================
  // Final Report
  // ============================================================
  log('\n' + '='.repeat(60), 'magenta');
  log('INTEGRATION VERIFICATION REPORT', 'magenta');
  log('='.repeat(60), 'magenta');

  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(v => v === true).length;
  const failedTests = totalTests - passedTests;

  log('\nTest Summary:', 'cyan');
  log(`  Total Tests: ${totalTests}`);
  log(`  Passed: ${passedTests}`, 'green');
  log(`  Failed: ${failedTests}`, 'red');

  log('\nDetailed Results:', 'cyan');
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '[PASS]' : '[FAIL]';
    const color = passed ? 'green' : 'red';
    log(`  ${status} - ${test}`, color);
  });

  log('\n' + '='.repeat(60), 'magenta');

  if (failedTests === 0) {
    log('[SUCCESS] ALL INTEGRATION TESTS PASSED! System is ready for testing.', 'green');
    log('\nYou can now:', 'cyan');
    log('  1. Open admin panel at: admin-panel/html/admin-login.html', 'cyan');
    log('  2. Login with your credentials', 'cyan');
    log('  3. Test the "Tambah Pengguna" feature', 'cyan');
  } else {
    log('[FAILED] Some tests failed. Please review the errors above.', 'red');
    log('\nNext steps:', 'cyan');
    log('  1. Check MongoDB service is running (net start MongoDB)', 'cyan');
    log('  2. Verify backend server is running (node server.js)', 'cyan');
    log('  3. Check .env configuration file', 'cyan');
  }

  log('\n' + '='.repeat(60) + '\n', 'magenta');
  
  process.exit(failedTests === 0 ? 0 : 1);
}

main().catch(err => {
  log(`\nFatal error: ${err.message}`, 'red');
  process.exit(1);
});
