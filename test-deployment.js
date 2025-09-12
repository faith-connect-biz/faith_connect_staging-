// Test script to verify deployment issues are fixed
console.log('🧪 Testing deployment fixes...');

// Test 1: Check if CSS files are being served with correct MIME type
async function testCSSMimeType() {
  try {
    const response = await fetch('/assets/index-DByJUeDy.css');
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('text/css')) {
      console.log('✅ CSS MIME type is correct:', contentType);
      return true;
    } else {
      console.log('❌ CSS MIME type is incorrect:', contentType);
      return false;
    }
  } catch (error) {
    console.log('❌ CSS file not found or error:', error.message);
    return false;
  }
}

// Test 2: Check if JavaScript modules load correctly
async function testJSModuleLoading() {
  try {
    const response = await fetch('/assets/index-DoDY_uYn.js');
    
    if (response.ok) {
      console.log('✅ JavaScript module loads successfully');
      return true;
    } else {
      console.log('❌ JavaScript module failed to load:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ JavaScript module error:', error.message);
    return false;
  }
}

// Test 3: Check Service Worker registration
function testServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then(registration => {
      if (registration) {
        console.log('✅ Service Worker is registered');
        return true;
      } else {
        console.log('❌ Service Worker is not registered');
        return false;
      }
    });
  } else {
    console.log('❌ Service Worker not supported');
    return false;
  }
}

// Test 4: Check for SES lockdown warnings
function testSESLockdown() {
  const originalConsoleWarn = console.warn;
  let sesWarnings = 0;
  
  console.warn = function(...args) {
    if (args[0] && args[0].includes('SES') && args[0].includes('lockdown')) {
      sesWarnings++;
    }
    originalConsoleWarn.apply(console, args);
  };
  
  // Restore original console.warn after a delay
  setTimeout(() => {
    console.warn = originalConsoleWarn;
    if (sesWarnings === 0) {
      console.log('✅ No SES lockdown warnings detected');
    } else {
      console.log(`⚠️ ${sesWarnings} SES lockdown warnings detected (non-critical)`);
    }
  }, 5000);
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Running deployment tests...\n');
  
  const cssTest = await testCSSMimeType();
  const jsTest = await testJSModuleLoading();
  testServiceWorker();
  testSESLockdown();
  
  console.log('\n📊 Test Summary:');
  console.log(`CSS MIME Type: ${cssTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`JS Module Loading: ${jsTest ? '✅ PASS' : '❌ FAIL'}`);
  console.log('Service Worker: Check console above');
  console.log('SES Lockdown: Check console above');
  
  if (cssTest && jsTest) {
    console.log('\n🎉 All critical tests passed! Deployment issues should be resolved.');
  } else {
    console.log('\n⚠️ Some tests failed. Check the deployment configuration.');
  }
}

// Run tests when script loads
runAllTests();
