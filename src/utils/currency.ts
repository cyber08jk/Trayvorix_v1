/**
 * Formats a number with proper locale support based on currency.
 * Handles different numbering systems (e.g., Indian Lakhs/Crores for INR).
 * 
 * @param amount - The amount to format
 * @param currency - The currency code (default: 'USD')
 * @param showSymbol - Whether to show the currency symbol (default: true)
 * @returns Formatted currency string
 */
export const formatCurrency = (
    amount: number,
    currency: string = 'USD',
    showSymbol = true
): string => {
    // Determine locale based on currency
    const locale = currency === 'INR' ? 'en-IN' : 
                   currency === 'EUR' ? 'de-DE' :
                   currency === 'GBP' ? 'en-GB' :
                   currency === 'JPY' ? 'ja-JP' :
                   currency === 'CNY' ? 'zh-CN' :
                   'en-US';
    
    const formatter = new Intl.NumberFormat(locale, {
        style: showSymbol ? 'currency' : 'decimal',
        currency,
        maximumFractionDigits: 2,
        minimumFractionDigits: 0,
    });
    return formatter.format(amount);
};

/**
 * Formats a large number into a compact string with suffix (e.g., 1.5L, 2.5Cr).
 * Useful for charts or small spaces.
 */
export const formatCompactCurrency = (
    amount: number,
    currency: string = 'INR'
): string => {
    if (amount >= 10000000 && currency === 'INR') {
        return `₹${(amount / 10000000).toFixed(2)}Cr`;
    }
    if (amount >= 100000 && currency === 'INR') {
        return `₹${(amount / 100000).toFixed(2)}L`;
    }
    if (amount >= 1000 && currency === 'INR') {
        return `₹${(amount / 1000).toFixed(1)}k`;
    }
    return formatCurrency(amount, currency);
};
