/**
 * Authentication Service Connection Test Utility
 * 
 * This utility can be called from the browser console to test the connection
 * with the authentication service.
 * 
 * Usage in browser console:
 *   testAuthConnection()
 *   testAuthConnection(true) // for detailed output
 */

interface TestResult {
  success: boolean;
  method: string;
  url: string;
  status?: number;
  responseTime?: number;
  error?: string;
  data?: any;
}

export async function testAuthConnection(detailed: boolean = false): Promise<void> {
  console.log('🔍 Testing Authentication Service Connection...\n');
  
  // Use environment variables available at build time (NEXT_PUBLIC_*)
  // For runtime, we'll try both internal and external URLs
  const internalUrl = typeof window !== 'undefined' 
    ? (window as any).__NEXT_PUBLIC_API_AUTH_URL__ || 'http://auth-service:3000'
    : 'http://auth-service:3000';
  const externalUrl = 'http://51.178.142.95:3000';
  
  const tests: Array<{ name: string; url: string; description: string; method?: string }> = [
    {
      name: 'Health Check (Via Frontend API)',
      url: '/api/auth',
      description: 'Testing through Next.js API route - This is the recommended way',
      method: 'GET'
    },
    {
      name: 'Signin Endpoint Test',
      url: '/api/auth/signin',
      description: 'Testing signin endpoint availability (will fail without credentials, but tests connection)',
      method: 'POST'
    }
  ];
  
  const results: TestResult[] = [];
  
  for (const test of tests) {
    const startTime = Date.now();
    const result: TestResult = {
      success: false,
      method: test.name,
      url: test.url
    };
    
    try {
      console.log(`\n📡 Testing: ${test.name}`);
      console.log(`   URL: ${test.url}`);
      console.log(`   Description: ${test.description}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const fetchOptions: RequestInit = {
        method: test.method || 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        }
      };
      
      // Add body for POST requests
      if (test.method === 'POST') {
        fetchOptions.body = JSON.stringify({ email: 'test@example.com', digitalCode: '1234' });
      }
      
      const response = await fetch(test.url, fetchOptions);
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      result.status = response.status;
      result.responseTime = responseTime;
      
      if (response.ok) {
        try {
          const data = await response.json();
          result.data = data;
          result.success = true;
          
          console.log(`   ✅ SUCCESS (${response.status}) - ${responseTime}ms`);
          if (detailed) {
            console.log(`   Response:`, data);
          }
        } catch (e) {
          const text = await response.text();
          result.success = true;
          result.data = text;
          console.log(`   ✅ SUCCESS (${response.status}) - ${responseTime}ms`);
          if (detailed) {
            console.log(`   Response: ${text.substring(0, 100)}...`);
          }
        }
      } else {
        result.error = `HTTP ${response.status}: ${response.statusText}`;
        console.log(`   ⚠️  FAILED (${response.status}) - ${responseTime}ms`);
        if (detailed) {
          try {
            const errorData = await response.json();
            console.log(`   Error:`, errorData);
          } catch {
            const errorText = await response.text();
            console.log(`   Error: ${errorText.substring(0, 100)}`);
          }
        }
      }
    } catch (error) {
      const responseTime = Date.now() - startTime;
      result.responseTime = responseTime;
      result.error = error instanceof Error ? error.message : String(error);
      
      console.log(`   ❌ ERROR - ${responseTime}ms`);
      if (detailed) {
        console.log(`   Error:`, error);
      }
    }
    
    results.push(result);
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`✅ Successful: ${successful}/${results.length}`);
  console.log(`❌ Failed: ${failed}/${results.length}`);
  
  console.log('\n📋 Detailed Results:');
  results.forEach((result, index) => {
    const icon = result.success ? '✅' : '❌';
    const status = result.status ? `[${result.status}]` : '';
    const time = result.responseTime ? `${result.responseTime}ms` : '';
    console.log(`${index + 1}. ${icon} ${result.method} ${status} ${time}`);
    if (result.error) {
      console.log(`   Error: ${result.error}`);
    }
  });
  
  // Overall status
  console.log('\n' + '='.repeat(60));
  if (successful > 0) {
    console.log('✅ Connection test completed - Some endpoints are working');
  } else {
    console.log('❌ Connection test failed - All endpoints are unreachable');
    console.log('\n💡 Troubleshooting tips:');
    console.log('   1. Check if auth-service container is running: docker ps | grep auth');
    console.log('   2. Check auth-service logs: docker logs shareprinto-auth-service-1');
    console.log('   3. Verify network connectivity: docker network inspect shareprinto_shareprinto-network');
    console.log('   4. Test MongoDB connection: docker exec shareprinto-mongo-1 mongosh -u root -p rootpassword --authenticationDatabase admin');
  }
  console.log('='.repeat(60));
  
  // Make results available globally for inspection
  (window as any).lastAuthTestResults = results;
  console.log('\n💡 Tip: Check window.lastAuthTestResults for detailed results');
}

// Make it available globally for console access
if (typeof window !== 'undefined') {
  (window as any).testAuthConnection = testAuthConnection;
  console.log('🔧 Auth connection test utility loaded!');
  console.log('   Usage: testAuthConnection() or testAuthConnection(true) for detailed output');
}

