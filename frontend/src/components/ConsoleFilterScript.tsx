/**
 * Inline script to filter console warnings before React loads
 * This must be in <head> to run before any other scripts
 */
export default function ConsoleFilterScript() {
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            if (typeof window === 'undefined') return;
            
            // Store original console methods
            const originalWarn = console.warn;
            const originalInfo = console.info;
            const originalLog = console.log;
            
            // Filter warnings
            console.warn = function(...args) {
              const message = args[0]?.toString() || '';
              
              // Ignore harmless warnings
              const ignored = [
                'beforeinstallprompt',
                'Banner not shown',
              ];
              
              if (ignored.some(i => message.includes(i))) return;
              originalWarn.apply(console, args);
            };
            
            // Filter info messages
            console.info = function(...args) {
              const message = args[0]?.toString() || '';
              
              // Ignore harmless info
              const ignored = [
                'Download the React DevTools',
              ];
              
              if (ignored.some(i => message.includes(i))) return;
              originalInfo.apply(console, args);
            };
            
            // Filter log messages from extensions
            console.log = function(...args) {
              const message = args[0]?.toString() || '';
              
              // Ignore extension messages
              const ignored = [
                '[locatorjs]',
              ];
              
              if (ignored.some(i => message.includes(i))) return;
              originalLog.apply(console, args);
            };
          })();
        `,
      }}
    />
  );
}
