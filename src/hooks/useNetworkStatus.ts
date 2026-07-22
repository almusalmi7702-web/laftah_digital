/**
 * Network status hook — tracks online/offline state.
 *
 * connectionRestored is a transient signal that fires once when the network
 * transitions from offline → online. It must be consumed (consumeConnectionRestored)
 * to reset, so it doesn't stay true forever.
 */

import { useEffect, useState, useCallback } from 'react';

export interface NetworkStatus {
  isOnline: boolean;
  connectionRestored: boolean;
  consumeConnectionRestored: () => void;
}

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [connectionRestored, setConnectionRestored] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setConnectionRestored(true);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const consumeConnectionRestored = useCallback(() => {
    setConnectionRestored(false);
  }, []);

  return { isOnline, connectionRestored, consumeConnectionRestored };
}
