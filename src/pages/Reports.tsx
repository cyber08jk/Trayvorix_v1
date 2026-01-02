import { useState } from 'react';
import { Card } from '@components/common/Card';
import { Button } from '@components/common/Button';
import { useToast } from '@components/common/Toast';
import { supabase } from '@services/supabase';
import {
    generateInventoryReport,
    generateLowStockReport,
    generateStockMovementsReport
} from '@services/pdfReport.service';
import { exportToCSV } from '@services/csvReport.service';

export function Reports() {
    const [downloading, setDownloading] = useState<string | null>(null);
    const { showToast } = useToast();

    const handleExport = async (reportType: string, format: 'pdf' | 'csv') => {
        try {
            setDownloading(`${reportType}-${format}`);

            let data: any[] = [];

            switch (reportType) {
                case 'inventory':
                    const { data: products, error: prodError } = await supabase
                        .from('products')
                        .select('*')
                        .order('name');
                    if (prodError) throw prodError;

                    // Enrich data for report
                    data = products.map(p => ({
                        ...p,
                        status: p.quantity <= 0 ? 'Out of Stock' : (p.quantity <= p.reorder_point ? 'Low Stock' : 'In Stock')
                    }));

                    if (format === 'pdf') {
                        generateInventoryReport(data);
                    } else {
                        const csvData = data.map(p => ({
                            Name: p.name,
                            SKU: p.sku,
                            Category: p.category,
                            Quantity: p.quantity,
                            'Unit Price': p.price,
                            'Total Value': p.price * p.quantity,
                            Status: p.status
                        }));
                        exportToCSV(csvData, 'inventory_report');
                    }
                    break;

                case 'low-stock':
                    const { data: lowStock, error: lowStockError } = await supabase
                        .from('products')
                        .select('*')
                        .lte('quantity', supabase.rpc('reorder_point')) // This might be tricky if reorder_point is a column, we can filter in JS
                        // Simpler approach: fetch all and filter
                        .order('quantity');

                    if (lowStockError) throw lowStockError; // Actually let's fetch all and filter to be safe

                    const { data: allProducts } = await supabase.from('products').select('*');
                    if (!allProducts) throw new Error("No products found");

                    const lowStockItems = allProducts
                        .filter(p => p.quantity <= (p.reorder_point || 0))
                        .map(p => ({
                            ...p,
                            status: p.quantity <= 0 ? 'Out of Stock' : 'Low Stock'
                        }));

                    if (format === 'pdf') {
                        generateLowStockReport(lowStockItems);
                    } else {
                        const csvData = lowStockItems.map(p => ({
                            Name: p.name,
                            SKU: p.sku,
                            'Current Qty': p.quantity,
                            'Reorder Point': p.reorder_point,
                            Status: p.status
                        }));
                        exportToCSV(csvData, 'low_stock_report');
                    }
                    break;

                case 'movements':
                    const { data: movements, error: movError } = await supabase
                        .from('stock_movements')
                        .select('*, product:products(name)')
                        .order('created_at', { ascending: false })
                        .limit(1000); // Limit for now

                    if (movError) throw movError;

                    if (format === 'pdf') {
                        generateStockMovementsReport(movements);
                    } else {
                        const csvData = movements.map((m: any) => ({
                            Date: new Date(m.created_at).toLocaleDateString(),
                            Type: m.type,
                            Product: m.product?.name,
                            Quantity: m.quantity,
                            Reference: m.reference
                        }));
                        exportToCSV(csvData, 'stock_movements_report');
                    }
                    break;
            }

            showToast('Report generated successfully', 'success');
        } catch (error: any) {
            console.error('Export error:', error);
            showToast('Failed to generate report', 'error');
        } finally {
            setDownloading(null);
        }
    };

    const ReportCard = ({ title, description, type, icon }: any) => (
        <Card>
            <div className="flex flex-col h-full">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                        {icon}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
                    </div>
                </div>

                <div className="mt-auto flex gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <Button
                        variant="outline"
                        className="flex-1 text-xs"
                        onClick={() => handleExport(type, 'pdf')}
                        disabled={!!downloading}
                    >
                        {downloading === `${type}-pdf` ? 'Generating...' : 'Export PDF'}
                    </Button>
                    <Button
                        variant="outline"
                        className="flex-1 text-xs"
                        onClick={() => handleExport(type, 'csv')}
                        disabled={!!downloading}
                    >
                        {downloading === `${type}-csv` ? 'Generating...' : 'Export CSV'}
                    </Button>
                </div>
            </div>
        </Card>
    );

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports Center</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                    Generate and download detailed lists and analysis
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ReportCard
                    title="Inventory Valuation"
                    description="Full list of products with current stock levels and value."
                    type="inventory"
                    icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 011.414.414l5 5a1 1 0 01.414 1.414V19a2 2 0 01-2 2z" /></svg>}
                />

                <ReportCard
                    title="Low Stock Alerts"
                    description="Items currently below their reorder point matching critical attention."
                    type="low-stock"
                    icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                />

                <ReportCard
                    title="Stock Movements"
                    description="History of all incoming and outgoing stock transactions."
                    type="movements"
                    icon={<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>}
                />
            </div>
        </div>
    );
}
