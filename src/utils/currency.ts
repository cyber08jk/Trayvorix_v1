import { formatConvertedCurrency } from './currencyConverter';

/**
 * Formats a number with proper locale support and currency conversion.
 * Assumes input amount is in USD (base currency) and converts to target currency.
 * 
 * @param amountInUSD - The amount in USD (base currency)
 * @param targetCurrency - The currency code to display (default: 'USD')
 * @param showSymbol - Whether to show the currency symbol (default: true)
 * @returns Formatted currency string with conversion
 */
export const formatCurrency = (
    amountInUSD: number,
    targetCurrency: string = 'USD',
    showSymbol = true
): string => {
    return formatConvertedCurrency(amountInUSD, targetCurrency, showSymbol);
};

import { convertFromUSD, CURRENCY_INFO } from './currencyConverter';

/**
 * Formats a large number into a compact string with suffix (e.g., 1.5L, 2.5Cr).
 * Useful for charts or small spaces.
 * @param amountInUSD - Amount in USD (base currency)
 * @param targetCurrency - Target currency to display
 */
export const formatCompactCurrency = (
    amountInUSD: number,
    targetCurrency: string = 'USD'
): string => {
    const convertedAmount = convertFromUSD(amountInUSD, targetCurrency);
    const symbol = CURRENCY_INFO[targetCurrency]?.symbol || '$';
    
    if (targetCurrency === 'INR') {
        if (convertedAmount >= 10000000) {
            return `${symbol}${(convertedAmount / 10000000).toFixed(2)}Cr`;
        }
        if (convertedAmount >= 100000) {
            return `${symbol}${(convertedAmount / 100000).toFixed(2)}L`;
        }
        if (convertedAmount >= 1000) {
            return `${symbol}${(convertedAmount / 1000).toFixed(1)}k`;
        }
    } else {
        // For other currencies, use K, M, B notation
        if (convertedAmount >= 1000000000) {
            return `${symbol}${(convertedAmount / 1000000000).toFixed(2)}B`;
        }
        if (convertedAmount >= 1000000) {
            return `${symbol}${(convertedAmount / 1000000).toFixed(2)}M`;
        }
        if (convertedAmount >= 1000) {
            return `${symbol}${(convertedAmount / 1000).toFixed(1)}K`;
        }
    }
    return formatCurrency(amountInUSD, targetCurrency);
};
