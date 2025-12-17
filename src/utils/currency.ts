/**
 * Formats a number as Indian Rupee (INR) with proper locale support.
 * Handles the Indian numbering system (Lakhs/Crores).
 * 
 * @param amount - The amount to format
 * @param showSymbol - Whether to show the currency symbol (default: true)
 * @returns Formatted currency string
 */
export const formatCurrency = (
    amount: number,
    currency: string = 'INR',
    showSymbol = true
): string => {
    const formatter = new Intl.NumberFormat('en-IN', {
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
