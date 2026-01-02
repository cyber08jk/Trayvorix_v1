export const exportToCSV = (data: any[], filename: string) => {
    if (!data || !data.length) {
        console.warn('No data to export');
        return;
    }

    // Get headers from first object
    const headers = Object.keys(data[0]);

    // Convert data to CSV format
    const csvContent = [
        // Headers row
        headers.join(','),
        // Data rows
        ...data.map(row => {
            return headers.map(fieldName => {
                const value = row[fieldName];
                // Handle strings that might contain commas or newlines
                if (typeof value === 'string') {
                    return `"${value.replace(/"/g, '""')}"`;
                }
                // Handle dates
                if (value instanceof Date) {
                    return value.toISOString();
                }
                // Handle null/undefined
                if (value === null || value === undefined) {
                    return '';
                }
                return value;
            }).join(',');
        })
    ].join('\n');

    // Create downloadable blob
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    // Create download link
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }
};
