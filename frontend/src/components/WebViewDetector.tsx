"use client";

import { useEffect } from 'react';
import { handleWebViewRedirect } from '@/utils/webview-detector';

interface WebViewDetectorProps {
  /**
   * Automatically redirect to browser without showing message
   * Default: false (shows message with option to continue)
   */
  autoRedirect?: boolean;
  
  /**
   * Show message prompting user to open in browser
   * Default: true
   */
  showMessage?: boolean;
  
  /**
   * Only check on specific pages (e.g., auth pages)
   * Default: true (check on all pages)
   */
  enabled?: boolean;
}

/**
 * WebView Detector Component
 * 
 * Detects if the app is running in a WebView (Gmail, Outlook, etc.)
 * and prompts/redirects user to open in real browser.
 * 
 * Usage:
 * ```tsx
 * // In layout or specific pages
 * <WebViewDetector autoRedirect={false} showMessage={true} />
 * ```
 */
export function WebViewDetector({ 
  autoRedirect = false, 
  showMessage = true,
  enabled = true 
}: WebViewDetectorProps) {
  useEffect(() => {
    if (!enabled) return;

    // Small delay to ensure page is loaded
    const timer = setTimeout(() => {
      handleWebViewRedirect({ autoRedirect, showMessage });
    }, 100);

    return () => clearTimeout(timer);
  }, [autoRedirect, showMessage, enabled]);

  return null; // This component doesn't render anything
}
