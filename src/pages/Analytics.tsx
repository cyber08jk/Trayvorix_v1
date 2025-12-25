import { useState } from 'react';
import { InventoryChart } from '@components/dashboard/InventoryChart';
import { MovementsChart } from '@components/dashboard/MovementsChart';
import { CategoryPieChart } from '@components/dashboard/CategoryPieChart';
import { StockTrendChart } from '@components/dashboard/StockTrendChart';
import { WarehouseRadarChart } from '@components/dashboard/WarehouseRadarChart';
import { TopProductsChart } from '@components/dashboard/TopProductsChart';
import { MonthlyComparisonChart } from '@components/dashboard/MonthlyComparisonChart';
import { useCurrency } from '@contexts/CurrencyContext';
import { formatCurrency } from '@utils/currency';
import { generateAnalyticsReport } from '@services/pdfReport.service';
import { useAuth } from '@contexts/AuthContext';
import { useToast } from '@components/common/Toast';

type TimeRange = '7d' | '30d' | '90d' | '12m';


export function Analytics() {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [isExporting, setIsExporting] = useState(false);
  const { currency } = useCurrency();
  const { user } = useAuth();
  const { showToast } = useToast();

  const handleExportPdf = async () => {

    try {
      setIsExporting(true);

      // Simulate data gathering (in a real app, this might come from API or state)
      // We are using the same values as displayed in the UI for consistency
      const reportData = {
        timeRange,
        currency,
        kpis: {
          revenue: 847500,
          itemsSold: 15842,
          turnover: 4.8,
          accuracy: 98.7,
        },
        quickStats: {
          activeSkus: 2456,
          avgOrderValue: 127.50,
          pendingTransfers: 23,
          lowStockAlerts: 18,
        },
        generatedBy: user?.email || 'System User',
      };


      await generateAnalyticsReport(reportData);
      showToast('Report generated successfully', 'success');
    } catch (error) {
      console.error('Error generating PDF:', error);
      showToast('Failed to generate report', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics & Reports
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Comprehensive insights into your inventory performance
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {[
            { value: '7d', label: '7 Days' },
            { value: '30d', label: '30 Days' },
            { value: '90d', label: '90 Days' },
            { value: '12m', label: '12 Months' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setTimeRange(option.value as TimeRange)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${timeRange === option.value
                ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <button
          onClick={handleExportPdf}
          disabled={isExporting}
          className="flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isExporting ? (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          )}
          {isExporting ? 'Generating...' : 'Export PDF'}
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white">
          <p className="text-sm font-medium text-blue-100">Total Revenue</p>
          <p className="mt-2 text-3xl font-bold">{formatCurrency(847500, currency)}</p>
          <p className="mt-1 text-sm text-blue-200">↑ 12.5% from last period</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-5 text-white">
          <p className="text-sm font-medium text-green-100">Items Sold</p>
          <p className="mt-2 text-3xl font-bold">15,842</p>
          <p className="mt-1 text-sm text-green-200">↑ 8.3% from last period</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white">
          <p className="text-sm font-medium text-purple-100">Inventory Turnover</p>
          <p className="mt-2 text-3xl font-bold">4.8x</p>
          <p className="mt-1 text-sm text-purple-200">↑ 0.3x from last period</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white">
          <p className="text-sm font-medium text-amber-100">Stock Accuracy</p>
          <p className="mt-2 text-3xl font-bold">98.7%</p>
          <p className="mt-1 text-sm text-amber-200">↑ 1.2% from last period</p>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue vs Cost vs Profit */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Financial Overview
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Monthly revenue, cost, and profit analysis
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                <span className="text-sm text-gray-600 dark:text-gray-400">Revenue</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500"></span>
                <span className="text-sm text-gray-600 dark:text-gray-400">Cost</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-green-500"></span>
                <span className="text-sm text-gray-600 dark:text-gray-400">Profit</span>
              </div>
            </div>
          </div>
          <MonthlyComparisonChart />
        </div>

        {/* Inventory Value Trend */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Inventory Value Trend
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Track your inventory value over time
            </p>
          </div>
          <InventoryChart />
        </div>

        {/* Stock Movements */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Stock Movements
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Daily received vs shipped items
            </p>
          </div>
          <MovementsChart />
        </div>

        {/* Stock Status Trend */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Stock Status Trend
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              In stock, low stock, and out of stock trends
            </p>
          </div>
          <StockTrendChart />
        </div>

        {/* Warehouse Performance */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Warehouse Performance
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Compare metrics across warehouses
            </p>
          </div>
          <WarehouseRadarChart />
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Distribution */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Category Distribution
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Inventory by product category
            </p>
          </div>
          <CategoryPieChart />
        </div>

        {/* Top Products */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <div className="mb-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Top Selling Products
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Best performing products by sales
            </p>
          </div>
          <TopProductsChart />
        </div>

        {/* Quick Stats */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Stats
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active SKUs</span>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">2,456</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Avg Order Value</span>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(127.50, currency)}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Pending Transfers</span>
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">23</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Low Stock Alerts</span>
              </div>
              <span className="text-lg font-bold text-red-600 dark:text-red-400">18</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
