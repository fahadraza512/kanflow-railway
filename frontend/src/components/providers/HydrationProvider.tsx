"use client";

import { useEffect, useState } from 'react';

interface HydrationProviderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Provider that ensures the component tree only renders after hydration
 * This prevents hydration mismatches with persisted stores
 */
export default function HydrationProvider({ children, fallback }: HydrationProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Mark as hydrated immediately to prevent layout shifts
    setIsHydrated(true);
  }, []);

  // Render children with hidden visibility during SSR to reserve space
  if (!isHydrated) {
    return (
      <div style={{ visibility: 'hidden', pointerEvents: 'none' }}>
        {children}
      </div>
    );
  }

  return <>{children}</>;
}
