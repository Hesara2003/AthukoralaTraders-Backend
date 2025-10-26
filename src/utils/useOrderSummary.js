import { useCallback, useState } from 'react';

export const ORDER_STORAGE_KEY = 'athukorala-last-order';

const readOrderFromStorage = () => {
  const stored = sessionStorage.getItem(ORDER_STORAGE_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error('[useOrderSummary] Failed to parse saved order summary', error);
    sessionStorage.removeItem(ORDER_STORAGE_KEY);
    return null;
  }
};

export const useOrderSummary = () => {
  const [order, setOrder] = useState(() => readOrderFromStorage());

  const refresh = useCallback(() => {
    const next = readOrderFromStorage();
    setOrder(next);
    return next;
  }, []);

  const clear = useCallback(() => {
    sessionStorage.removeItem(ORDER_STORAGE_KEY);
    setOrder(null);
  }, []);

  return { order, refresh, clear };
};
