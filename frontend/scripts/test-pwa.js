// PWA Testing Script - Run in Browser Console
// Copy and paste this into DevTools Console on your deployed site

console.log('🧪 KanbanFlow PWA Test Suite\n');

// Test 1: Check HTTPS
console.log('1️⃣ Testing HTTPS...');
if (location.protocol === 'https:') {
  console.log('✅ HTTPS enabled');
} else {
  console.error('❌ HTTPS not enabled - PWA requires HTTPS');
}

// Test 2: Check Service Worker
console.log('\n2️⃣ Testing Service Worker...');
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    if (regs.length > 0) {
      console.log('✅ Service Worker registered:', regs.length);
      regs.forEach((reg, i) => {
        console.log(`  SW ${i + 1}:`, {
          scope: reg.scope,
          state: reg.active?.state,
          updateViaCache: reg.updateViaCache
        });
      });
    } else {
      console.error('❌ No Service Worker registered');
    }
  });
} else {
  console.error('❌ Service Worker not supported');
}

// Test 3: Check Manifest
console.log('\n3️⃣ Testing Manifest...');
fetch('/manifest.json')
  .then(r => r.json())
  .then(manifest => {
    console.log('✅ Manifest loaded:', {
      name: manifest.name,
      shortName: manifest.short_name,
      startUrl: manifest.start_url,
      display: manifest.display,
      icons: manifest.icons.length
    });
  })
  .catch(e => console.error('❌ Manifest failed:', e));

// Test 4: Check Cache Storage
console.log('\n4️⃣ Testing Cache Storage...');
caches.keys().then(keys => {
  if (keys.length > 0) {
    console.log('✅ Caches found:', keys.length);
    keys.forEach(key => {
      caches.open(key).then(cache => {
        cache.keys().then(requests => {
          console.log(`  ${key}: ${requests.length} entries`);
        });
      });
    });
  } else {
    console.error('❌ No caches found');
  }
});

// Test 5: Check Install Prompt
console.log('\n5️⃣ Testing Install Prompt...');
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
  deferredPrompt = e;
  console.log('✅ beforeinstallprompt event fired');
});

setTimeout(() => {
  if (!deferredPrompt) {
    console.log('⚠️ beforeinstallprompt not fired (may be already installed or iOS)');
  }
}, 2000);

// Test 6: Check if Already Installed
console.log('\n6️⃣ Checking Install Status...');
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('✅ App is installed and running in standalone mode');
} else {
  console.log('ℹ️ App is not installed or running in browser');
}

// Test 7: Check Offline Support
console.log('\n7️⃣ Testing Offline Support...');
console.log('ℹ️ To test offline:');
console.log('  1. Open DevTools → Network tab');
console.log('  2. Set throttling to "Offline"');
console.log('  3. Navigate to a new page');
console.log('  4. Should show /offline.html fallback');

console.log('\n✅ PWA Test Suite Complete!');
console.log('📊 Check results above for any ❌ errors');
