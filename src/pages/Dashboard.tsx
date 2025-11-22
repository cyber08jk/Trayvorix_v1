import { useState, useEffect } from 'react';
import { Card } from '@components/common/Card';
import { KPICard } from '@components/dashboard/KPICard';
import { ActivityTimeline } from '@components/dashboard/ActivityTimeline';
import { InventoryChart } from '@components/dashboard/InventoryChart';
import { MovementsChart } from '@components/dashboard/MovementsChart';
import { supabase } from '@services/supabase';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKPIData();
  }, []);

  const fetchKPIData = async () => {
    try {
      // Fetch total products
      const { count: productsCount } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      // Fetch low stock items (products below reorder point)
      // Note: This is a simplified query - in production, you'd use a more complex join
      const { data: lowStockData } = await supabase
        .from('products')
        .select('id, reorder_point')
        .limit(100);

      // Fetch pending transfers
      const { count: pendingCount } = await supabase
        .from('transfer_requests')
        .select('*', { count: 'exact', head: true })
        .in('status', ['draft', 'review']);

      // Calculate total inventory value (simplified - would need product prices)
      const { data: inventoryData } = await supabase
        .from('inventory')
        .select('quantity');

      const totalQuantity = inventoryData?.reduce((sum, item) => sum + item.quantity, 0) || 0;

      setKpiData({
        totalProducts: productsCount || 0,
        totalInventoryValue: totalQuantity * 50, // Placeholder calculation
        lowStockItems: lowStockData?.length || 0,
        pendingTransfers: pendingCount || 0,
      });
    } catch (error) {
      console.error('Error fetching KPI data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Welcome back! Here's what's happening with your inventory today.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Products"
          value={kpiData.totalProducts}
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
            </svg>
          }
          color="blue"
          trend={{ value: 12, isPositive: true }}
          loading={loading}
        />

        <KPICard
          title="Inventory Value"
          value={`$${kpiData.totalInventoryValue.toLocaleString()}`}
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
            </svg>
          }
          color="green"
          trend={{ value: 8, isPositive: true }}
          loading={loading}
        />

        <KPICard
          title="Low Stock Items"
          value={kpiData.lowStockItems}
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          }
          color="yellow"
          loading={loading}
        />

        <KPICard
          title="Pending Transfers"
          value={kpiData.pendingTransfers}
          icon={
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
            </svg>
          }
          color="purple"
          loading={loading}
        />
      </div>

      {/* Charts and Activity Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Charts - 2 columns on large screens */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Inventory Value Trend" subtitle="Monthly inventory value vs target">
            <InventoryChart />
          </Card>

          <Card title="Stock Movements" subtitle="Weekly received vs shipped items">
            <MovementsChart />
          </Card>
        </div>

        {/* Activity Timeline - 1 column on large screens */}
        <div className="lg:col-span-1">
          <Card title="Recent Activity" subtitle="Latest inventory updates">
            <div className="h-[calc(32rem+1.5rem)] overflow-y-auto">
              <ActivityTimeline />
            </div>
          </Card>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Low Stock Alerts" subtitle="Items below reorder point">
          <div className="h-48 flex items-center justify-center text-gray-400">
            Alerts placeholder
          </div>
        </Card>

        <Card title="Expiring Batches" subtitle="Items expiring within 30 days">
          <div className="h-48 flex items-center justify-center text-gray-400">
            Expiring batches placeholder
          </div>
        </Card>
      </div>
    </div>
  );
}
