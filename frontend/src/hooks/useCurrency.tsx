import React, { createContext, useContext, useState, useCallback } from 'react';

// Single source of truth for the exchange rate
export const INR_TO_USD_RATE = 83;

type CurrencyCode = 'INR' | 'USD';

interface CurrencyContextValue {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  formatPrice: (priceInPaise: bigint | number) => string;
}

const STORAGE_KEY = 'greenleaf_currency';

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'USD' ? 'USD' : 'INR';
  });

  const setCurrency = useCallback((newCurrency: CurrencyCode) => {
    localStorage.setItem(STORAGE_KEY, newCurrency);
    setCurrencyState(newCurrency);
  }, []);

  const formatPrice = useCallback(
    (priceInPaise: bigint | number): string => {
      // Backend stores prices in paise (smallest INR unit, i.e. cents equivalent)
      const inrAmount = Number(priceInPaise) / 100;

      if (currency === 'USD') {
        const usdAmount = inrAmount / INR_TO_USD_RATE;
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(usdAmount);
      }

      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(inrAmount);
    },
    [currency]
  );

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return ctx;
}
