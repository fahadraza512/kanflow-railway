import { useEffect, useState } from 'react';

/**
 * Hook to check if the component has hydrated on the client
 * This prevents hydration mismatches when using persisted stores
 */
export function useHydration() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}
