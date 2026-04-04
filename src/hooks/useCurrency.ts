import { useState, useEffect } from 'react';

interface ExchangeRates {
  [currency: string]: number;
}

interface CurrencyConfig {
  code: string;
  symbol: string;
  name: string;
}

const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'GHS', symbol: 'GH₵', name: 'Ghanaian Cedi' },
  { code: 'TZS', symbol: 'TSh', name: 'Tanzanian Shilling' },
  { code: 'UGX', symbol: 'USh', name: 'Ugandan Shilling' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
];

// Fallback rates (approximate) used when API is unavailable
const FALLBACK_RATES: ExchangeRates = {
  USD: 1,
  KES: 129.5,
  GBP: 0.79,
  EUR: 0.92,
  ZAR: 18.1,
  NGN: 1550,
  GHS: 15.5,
  TZS: 2650,
  UGX: 3750,
  INR: 83.5,
};

const CACHE_KEY = 'currency_rates';
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours
const SELECTED_CURRENCY_KEY = 'selected_currency';

function getCachedRates(): { rates: ExchangeRates; timestamp: number } | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_DURATION) {
        return parsed;
      }
    }
  } catch { /* ignore */ }
  return null;
}

function setCachedRates(rates: ExchangeRates) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ rates, timestamp: Date.now() }));
  } catch { /* ignore */ }
}

export function useCurrency() {
  const [rates, setRates] = useState<ExchangeRates>(FALLBACK_RATES);
  const [selectedCurrency, setSelectedCurrencyState] = useState<string>(() => {
    try {
      return localStorage.getItem(SELECTED_CURRENCY_KEY) || 'USD';
    } catch {
      return 'USD';
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  // Sync across multiple hook instances via storage events and custom events
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem(SELECTED_CURRENCY_KEY);
        if (stored && stored !== selectedCurrency) {
          setSelectedCurrencyState(stored);
        }
      } catch { /* ignore */ }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('currency-changed', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('currency-changed', handleStorageChange);
    };
  }, [selectedCurrency]);

  useEffect(() => {
    const cached = getCachedRates();
    if (cached) {
      setRates(cached.rates);
      return;
    }

    setIsLoading(true);
    // Using a free exchange rate API
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(res => res.json())
      .then(data => {
        if (data?.rates) {
          const filtered: ExchangeRates = {};
          for (const c of SUPPORTED_CURRENCIES) {
            if (data.rates[c.code]) filtered[c.code] = data.rates[c.code];
          }
          if (Object.keys(filtered).length > 0) {
            setRates(filtered);
            setCachedRates(filtered);
          }
        }
      })
      .catch(() => {
        // Use fallback rates silently
      })
      .finally(() => setIsLoading(false));
  }, []);

  const setSelectedCurrency = (code: string) => {
    setSelectedCurrencyState(code);
    try {
      localStorage.setItem(SELECTED_CURRENCY_KEY, code);
      // Notify other hook instances in the same window
      window.dispatchEvent(new Event('currency-changed'));
    } catch { /* ignore */ }
  };

  const convertFromUSD = (amountUSD: number, toCurrency?: string): number => {
    const target = toCurrency || selectedCurrency;
    const rate = rates[target] || 1;
    return amountUSD * rate;
  };

  const formatPrice = (priceCents: number, currency?: string): string => {
    const target = currency || selectedCurrency;
    const amountUSD = priceCents / 100;
    const converted = convertFromUSD(amountUSD, target);
    const config = SUPPORTED_CURRENCIES.find(c => c.code === target);
    
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: target,
        minimumFractionDigits: target === 'UGX' || target === 'TZS' ? 0 : 2,
        maximumFractionDigits: target === 'UGX' || target === 'TZS' ? 0 : 2,
      }).format(converted);
    } catch {
      return `${config?.symbol || ''}${converted.toFixed(2)}`;
    }
  };

  const formatPriceWithUSD = (priceCents: number): string => {
    if (selectedCurrency === 'USD') return formatPrice(priceCents, 'USD');
    const usd = formatPrice(priceCents, 'USD');
    const local = formatPrice(priceCents, selectedCurrency);
    return `${usd} (≈ ${local})`;
  };

  return {
    rates,
    selectedCurrency,
    setSelectedCurrency,
    currencies: SUPPORTED_CURRENCIES,
    convertFromUSD,
    formatPrice,
    formatPriceWithUSD,
    isLoading,
  };
}
