/**
 * Currency Converter with Real Exchange Rates
 * Base currency: USD
 * All values in the system are stored in USD, then converted to display currency
 */

// Exchange rates (updated periodically - in production, fetch from API)
// Base: 1 USD = X currency
export const EXCHANGE_RATES: Record<string, number> = {
  USD: 1.0,      // US Dollar (base)
  EUR: 0.92,     // Euro
  INR: 83.12,    // Indian Rupee
  GBP: 0.79,     // British Pound
  JPY: 149.50,   // Japanese Yen
  CNY: 7.24,     // Chinese Yuan
  AUD: 1.52,     // Australian Dollar
  CAD: 1.36,     // Canadian Dollar
  SGD: 1.34,     // Singapore Dollar
  ZAR: 18.25,    // South African Rand
};

// Last updated timestamp
export const RATES_LAST_UPDATED = new Date('2024-01-15');

/**
 * Convert amount from USD to target currency
 * @param amountInUSD - Amount in USD (base currency)
 * @param targetCurrency - Target currency code
 * @returns Converted amount
 */
export function convertFromUSD(amountInUSD: number, targetCurrency: string): number {
  const rate = EXCHANGE_RATES[targetCurrency] || 1;
  return amountInUSD * rate;
}

/**
 * Convert amount from source currency to USD
 * @param amount - Amount in source currency
 * @param sourceCurrency - Source currency code
 * @returns Amount in USD
 */
export function convertToUSD(amount: number, sourceCurrency: string): number {
  const rate = EXCHANGE_RATES[sourceCurrency] || 1;
  return amount / rate;
}

/**
 * Convert amount from one currency to another
 * @param amount - Amount in source currency
 * @param fromCurrency - Source currency code
 * @param toCurrency - Target currency code
 * @returns Converted amount
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string
): number {
  if (fromCurrency === toCurrency) {
    return amount;
  }
  
  // Convert to USD first, then to target currency
  const amountInUSD = convertToUSD(amount, fromCurrency);
  return convertFromUSD(amountInUSD, toCurrency);
}

/**
 * Get exchange rate between two currencies
 * @param fromCurrency - Source currency code
 * @param toCurrency - Target currency code
 * @returns Exchange rate
 */
export function getExchangeRate(fromCurrency: string, toCurrency: string): number {
  if (fromCurrency === toCurrency) {
    return 1;
  }
  
  const fromRate = EXCHANGE_RATES[fromCurrency] || 1;
  const toRate = EXCHANGE_RATES[toCurrency] || 1;
  
  return toRate / fromRate;
}

/**
 * Format currency with conversion
 * @param amountInUSD - Amount in USD (base currency)
 * @param targetCurrency - Target currency to display
 * @param showSymbol - Whether to show currency symbol
 * @returns Formatted currency string
 */
export function formatConvertedCurrency(
  amountInUSD: number,
  targetCurrency: string = 'USD',
  showSymbol: boolean = true
): string {
  const convertedAmount = convertFromUSD(amountInUSD, targetCurrency);
  
  // Determine locale based on currency
  const locale = targetCurrency === 'INR' ? 'en-IN' : 
                 targetCurrency === 'EUR' ? 'de-DE' :
                 targetCurrency === 'GBP' ? 'en-GB' :
                 targetCurrency === 'JPY' ? 'ja-JP' :
                 targetCurrency === 'CNY' ? 'zh-CN' :
                 'en-US';
  
  const formatter = new Intl.NumberFormat(locale, {
    style: showSymbol ? 'currency' : 'decimal',
    currency: targetCurrency,
    maximumFractionDigits: targetCurrency === 'JPY' ? 0 : 2,
    minimumFractionDigits: targetCurrency === 'JPY' ? 0 : 0,
  });
  
  return formatter.format(convertedAmount);
}

/**
 * Get currency info
 */
export interface CurrencyInfo {
  code: string;
  name: string;
  symbol: string;
  rate: number;
}

export const CURRENCY_INFO: Record<string, CurrencyInfo> = {
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', rate: EXCHANGE_RATES.USD },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', rate: EXCHANGE_RATES.EUR },
  INR: { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: EXCHANGE_RATES.INR },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', rate: EXCHANGE_RATES.GBP },
  JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: EXCHANGE_RATES.JPY },
  CNY: { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', rate: EXCHANGE_RATES.CNY },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: EXCHANGE_RATES.AUD },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: EXCHANGE_RATES.CAD },
  SGD: { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', rate: EXCHANGE_RATES.SGD },
  ZAR: { code: 'ZAR', name: 'South African Rand', symbol: 'R', rate: EXCHANGE_RATES.ZAR },
};

/**
 * Fetch live exchange rates from API (optional - for production)
 * This is a placeholder - integrate with a real API like exchangerate-api.com
 */
export async function fetchLiveRates(): Promise<Record<string, number>> {
  try {
    // Example API call (you'll need an API key)
    // const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    // const data = await response.json();
    // return data.rates;
    
    // For now, return static rates
    return EXCHANGE_RATES;
  } catch (error) {
    console.error('Failed to fetch live rates:', error);
    return EXCHANGE_RATES;
  }
}
