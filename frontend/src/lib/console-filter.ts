/**
 * Filter out harmless console warnings in development
 */
export function setupConsoleFilters() {
  if (typeof window === 'undefined' || process.env.NODE_ENV === 'production') {
    return;
  }

  // Store original console methods
  const originalWarn = console.warn;
  const originalInfo = console.info;

  // Filter warnings
  console.warn = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    
    // Filter out harmless warnings
    const ignoredWarnings = [
      'beforeinstallprompt',
      'Banner not shown',
    ];
    
    if (ignoredWarnings.some(ignored => message.includes(ignored))) {
      return; // Suppress this warning
    }
    
    originalWarn.apply(console, args);
  };

  // Filter info messages
  console.info = (...args: any[]) => {
    const message = args[0]?.toString() || '';
    
    // Filter out harmless info messages
    const ignoredInfo = [
      'Download the React DevTools',
    ];
    
    if (ignoredInfo.some(ignored => message.includes(ignored))) {
      return; // Suppress this info
    }
    
    originalInfo.apply(console, args);
  };
}
