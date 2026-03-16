/**
 * WebView Detection and Redirect Utility
 * 
 * Detects if the app is running inside a WebView (Gmail, Outlook, etc.)
 * and redirects to the real browser for proper authentication flow.
 */

/**
 * Detect if running in a WebView
 */
export function isWebView(): boolean {
  if (typeof window === 'undefined') return false;

  const ua = navigator.userAgent || navigator.vendor || (window as any).opera;

  // Gmail WebView detection
  if (ua.includes('GoogleWebLight')) return true;
  
  // Facebook/Instagram in-app browser
  if (ua.includes('FBAN') || ua.includes('FBAV') || ua.includes('Instagram')) return true;
  
  // LinkedIn in-app browser
  if (ua.includes('LinkedInApp')) return true;
  
  // Twitter in-app browser
  if (ua.includes('Twitter')) return true;
  
  // Generic WebView indicators
  if (ua.includes('wv') || ua.includes('WebView')) return true;
  
  // iOS WebView detection
  if (/(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(ua)) return true;
  
  // Android WebView detection
  if (/Android.*Version\/[\d.]+.*Chrome\/[.0-9]*/.test(ua)) {
    // Check if it's NOT Chrome browser
    if (!ua.includes('Chrome/') || ua.includes('; wv)')) return true;
  }

  return false;
}

/**
 * Get the current URL to redirect to
 */
export function getCurrentUrl(): string {
  if (typeof window === 'undefined') return '';
  return window.location.href;
}

/**
 * Open URL in external browser
 */
export function openInBrowser(url?: string): void {
  const targetUrl = url || getCurrentUrl();
  
  // Try different methods to open in external browser
  
  // Method 1: Use intent:// scheme for Android
  if (navigator.userAgent.includes('Android')) {
    const intentUrl = `intent://${targetUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;end`;
    window.location.href = intentUrl;
    return;
  }
  
  // Method 2: Try to open in new window (works in some WebViews)
  const newWindow = window.open(targetUrl, '_blank');
  if (newWindow) {
    newWindow.focus();
    return;
  }
  
  // Method 3: Direct navigation (fallback)
  window.location.href = targetUrl;
}

/**
 * Show a message prompting user to open in browser
 */
export function showOpenInBrowserMessage(): HTMLElement {
  const overlay = document.createElement('div');
  overlay.id = 'webview-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.95);
    z-index: 999999;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  `;

  const content = document.createElement('div');
  content.style.cssText = `
    background: white;
    border-radius: 16px;
    padding: 32px;
    max-width: 400px;
    text-align: center;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  `;

  content.innerHTML = `
    <div style="font-size: 48px; margin-bottom: 16px;">🌐</div>
    <h2 style="font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 12px;">
      Open in Browser
    </h2>
    <p style="font-size: 14px; color: #6b7280; margin-bottom: 24px; line-height: 1.6;">
      This page needs to open in your default browser for proper authentication. 
      Please tap the button below or use your browser's "Open in Browser" option.
    </p>
    <button id="open-browser-btn" style="
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 14px 32px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      width: 100%;
      margin-bottom: 12px;
    ">
      Open in Browser
    </button>
    <button id="continue-anyway-btn" style="
      background: transparent;
      color: #6b7280;
      border: 1px solid #d1d5db;
      padding: 12px 32px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      width: 100%;
    ">
      Continue Anyway
    </button>
    <p style="font-size: 12px; color: #9ca3af; margin-top: 16px;">
      💡 Tip: Look for "Open in Browser" or "⋮" menu in your email app
    </p>
  `;

  overlay.appendChild(content);
  document.body.appendChild(overlay);

  // Add event listeners
  const openBtn = content.querySelector('#open-browser-btn');
  const continueBtn = content.querySelector('#continue-anyway-btn');

  if (openBtn) {
    openBtn.addEventListener('click', () => {
      openInBrowser();
    });
  }

  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      overlay.remove();
    });
  }

  return overlay;
}

/**
 * Check and handle WebView on page load
 */
export function handleWebViewRedirect(options?: {
  autoRedirect?: boolean;
  showMessage?: boolean;
}): boolean {
  const { autoRedirect = false, showMessage = true } = options || {};

  if (!isWebView()) {
    return false;
  }

  console.warn('WebView detected. Redirecting to browser...');

  if (autoRedirect) {
    // Automatically redirect without showing message
    openInBrowser();
    return true;
  }

  if (showMessage) {
    // Show message with option to open in browser
    showOpenInBrowserMessage();
    return true;
  }

  return true;
}
