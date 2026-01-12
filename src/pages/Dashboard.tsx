import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@utils/currency';
import { InventoryChart } from '@components/dashboard/InventoryChart';
import { MovementsChart } from '@components/dashboard/MovementsChart';
import { CategoryPieChart } from '@components/dashboard/CategoryPieChart';
import { StockTrendChart } from '@components/dashboard/StockTrendChart';
import { useDemo } from '@contexts/DemoContext';
import { useCurrency } from '@contexts/CurrencyContext';
import { sampleDashboardKPI } from '@data/sampleData';
import { supabase } from '@services/supabase';
import { AddReceiptModal } from '@components/receipts/AddReceiptModal';
import { AddDeliveryModal } from '@components/deliveries/AddDeliveryModal';
import { AddAdjustmentModal } from '@components/adjustments/AddAdjustmentModal';

interface KPIData {
  totalProducts: number;
  totalInventoryValue: number;
  lowStockItems: number;
  pendingTransfers: number;
}

export function Dashboard() {
  const [kpiData, setKpiData] = useState<KPIData>({
    totalProducts: 0,
    totalInventoryValue: 0,
    lowStockItems: 0,
    pendingTransfers: 0,
  });
  const [_loading, setLoading] = useState(true);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const { isDemoMode } = useDemo();
  const { currency } = useCurrency();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, [isDemoMode]);

  useEffect(() => {
    window.dashboardKPI = kpiData;
  }, [kpiData]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      if (isDemoMode) {
        // Use sample data for demo mode
        setKpiData(sampleDashboardKPI);
      } else {
        // Fetch real data from Supabase
        const [productsRes, inventoryRes] = await Promise.all([
          supabase.from('products').select('id', { count: 'exact' }),
          supabase.from('inventory').select('quantity, product_id'),
        ]);

        const totalProducts = productsRes.count || 0;
        const lowStockItems = (inventoryRes.data || []).filter(
          (item: any) => item.quantity < 10
        ).length;

        setKpiData({
          totalProducts,
          totalInventoryValue: 125000, // You can calculate this from real data
          lowStockItems,
          pendingTransfers: 5, // Fetch from stock_movements with status pending
        });
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Fallback to sample data on error
      setKpiData(sampleDashboardKPI);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Welcome back! Here's what's happening with your inventory today.
        </p>
      </div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            Last 30 Days
          </button>
          <button className="px-4 py-2 bg-primary-600 text-white rounded-lg shadow-md text-sm font-medium hover:bg-primary-700 transition-colors">
            Download Report
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Products
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {kpiData.totalProducts}
              </p>
              <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                ↑ 12% from last month
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Inventory Value
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(kpiData.totalInventoryValue, currency)}
              </p>
              <p className="mt-2 text-sm text-green-600 dark:text-green-400">
                ↑ 8% from last month
              </p>


            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Low Stock Items
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {kpiData.lowStockItems}
              </p>
              <p className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
                Needs attention
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Pending Transfers
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                {kpiData.pendingTransfers}
              </p>
              <p className="mt-2 text-sm text-purple-600 dark:text-purple-400">
                Awaiting approval
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Inventory Value Chart */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Inventory Value Trend
          </h3>
          <InventoryChart />
        </div>

        {/* Stock Movements Chart */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Stock Movements
          </h3>
          <MovementsChart />
        </div>

        {/* Stock Trend Chart */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Stock Status Trend
          </h3>
          <StockTrendChart />
        </div>

        {/* Category Distribution */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Category Distribution
          </h3>
          <CategoryPieChart />
        </div>
      </div>

      {/* Activity & Quick Actions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {[
              { action: 'Received', item: 'Product A', qty: 100, time: '2 hours ago', color: 'green' },
              { action: 'Shipped', item: 'Product B', qty: 50, time: '4 hours ago', color: 'blue' },
              { action: 'Adjusted', item: 'Product C', qty: 25, time: '6 hours ago', color: 'yellow' },
              { action: 'Received', item: 'Product D', qty: 75, time: '8 hours ago', color: 'green' },
            ].map((activity, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-800 last:border-0">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full bg-${activity.color}-500`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.action} {activity.qty} units of {activity.item}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setShowReceiptModal(true)}
              className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-950/50 transition-colors text-left"
            >
              <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium text-gray-900 dark:text-white">New Receipt</p>
            </button>
            <button
              onClick={() => setShowDeliveryModal(true)}
              className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-950/50 transition-colors text-left"
            >
              <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
              </svg>
              <p className="text-sm font-medium text-gray-900 dark:text-white">New Delivery</p>
            </button>
            <button
              onClick={() => setShowAdjustmentModal(true)}
              className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-950/50 transition-colors text-left"
            >
              <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Adjustment</p>
            </button>
            <button
              onClick={() => navigate('/reports')}
              className="p-4 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-950/50 transition-colors text-left"
            >
              <svg className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mb-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium text-gray-900 dark:text-white">View Reports</p>
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddReceiptModal
        isOpen={showReceiptModal}
        onClose={() => setShowReceiptModal(false)}
        onSuccess={fetchDashboardData}
      />
      <AddDeliveryModal
        isOpen={showDeliveryModal}
        onClose={() => setShowDeliveryModal(false)}
        onSuccess={fetchDashboardData}
      />
      <AddAdjustmentModal
        isOpen={showAdjustmentModal}
        onClose={() => setShowAdjustmentModal(false)}
        onSuccess={fetchDashboardData}
      />
    </div>
  );
}
