const http = require('http');

const BASE_URL = 'http://localhost:3001';
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function testEndpoint(path, testName) {
  return new Promise((resolve) => {
    const url = `${BASE_URL}${path}`;
    
    http.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          if (res.statusCode === 200 && jsonData.success !== false) {
            log(`✅ ${testName}`, 'green');
            resolve({ success: true, data: jsonData });
          } else {
            log(`❌ ${testName} - Status: ${res.statusCode}`, 'red');
            resolve({ success: false, error: data });
          }
        } catch (error) {
          log(`❌ ${testName} - Invalid JSON response`, 'red');
          resolve({ success: false, error: error.message });
        }
      });
    }).on('error', (error) => {
      log(`❌ ${testName} - ${error.message}`, 'red');
      resolve({ success: false, error: error.message });
    });
  });
}

async function runTests() {
  log('\n🧪 ============================================', 'blue');
  log('🧪  NLA Backend API Test Suite', 'blue');
  log('🧪 ============================================\n', 'blue');

  const tests = [
    { path: '/health', name: 'Health Check' },
    { path: '/', name: 'API Documentation' },
    { path: '/api/operators', name: 'Get All Operators' },
    { path: '/api/operators/2', name: 'Get Lucky Star Casino Details' },
    { path: '/api/reports', name: 'Get All Revenue Reports' },
    { path: '/api/reports?has_anomaly=true', name: 'Get Reports with Anomalies' },
    { path: '/api/anomalies', name: 'Get All Anomalies' },
    { path: '/api/anomalies?min_confidence=80', name: 'Get High-Confidence Anomalies' },
    { path: '/api/transactions?limit=10', name: 'Get Recent Transactions' },
    { path: '/api/stats', name: 'Get Dashboard Statistics' },
    { path: '/api/anomaly-types', name: 'Get Anomaly Types' }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const result = await testEndpoint(test.path, test.name);
    if (result.success) {
      passed++;
    } else {
      failed++;
    }
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  log('\n📊 ============================================', 'blue');
  log(`📊  Test Results`, 'blue');
  log('📊 ============================================', 'blue');
  log(`   ✅ Passed: ${passed}`, 'green');
  if (failed > 0) {
    log(`   ❌ Failed: ${failed}`, 'red');
  }
  log(`   📈 Total:  ${passed + failed}`, 'yellow');
  log('📊 ============================================\n', 'blue');

  // Detailed checks
  log('🔍 Running Detailed Validation...\n', 'yellow');

  // Check operators count
  const operatorsResult = await testEndpoint('/api/operators', 'Validate Operators Count');
  if (operatorsResult.success && operatorsResult.data.count === 6) {
    log('   ✅ Expected 6 operators found', 'green');
  } else {
    log(`   ⚠️  Expected 6 operators, found ${operatorsResult.data?.count || 0}`, 'yellow');
  }

  // Check anomalies count
  const anomaliesResult = await testEndpoint('/api/anomalies', 'Validate Anomalies Count');
  if (anomaliesResult.success && anomaliesResult.data.count >= 3) {
    log(`   ✅ ${anomaliesResult.data.count} anomalies detected (expected 3+)`, 'green');
  } else {
    log(`   ⚠️  Expected at least 3 anomalies, found ${anomaliesResult.data?.count || 0}`, 'yellow');
  }

  // Check stats endpoint
  const statsResult = await testEndpoint('/api/stats', 'Validate Dashboard Stats');
  if (statsResult.success && statsResult.data.data.overview) {
    const overview = statsResult.data.data.overview;
    log('   ✅ Dashboard statistics available', 'green');
    log(`      - Total Revenue (Dec): ₹${(overview.current_month_revenue / 1000000).toFixed(1)}M`, 'reset');
    log(`      - Active Operators: ${overview.active_operators}`, 'reset');
    log(`      - Active Anomalies: ${overview.active_anomalies}`, 'reset');
  }

  log('\n✨ ============================================', 'blue');
  if (failed === 0) {
    log('✨  All Tests Passed! Backend is Ready! 🎉', 'green');
  } else {
    log('⚠️   Some Tests Failed - Check Errors Above', 'yellow');
  }
  log('✨ ============================================\n', 'blue');

  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Check if server is running first
log('🔍 Checking if server is running...', 'yellow');
http.get(`${BASE_URL}/health`, (res) => {
  if (res.statusCode === 200) {
    log('✅ Server is running!\n', 'green');
    runTests();
  } else {
    log('❌ Server responded with error', 'red');
    process.exit(1);
  }
}).on('error', (error) => {
  log('❌ Cannot connect to server', 'red');
  log('⚠️  Make sure the server is running: npm start', 'yellow');
  log(`⚠️  Error: ${error.message}\n`, 'yellow');
  process.exit(1);
});
