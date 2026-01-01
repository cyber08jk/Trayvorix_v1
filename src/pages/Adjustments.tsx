import { useState, useEffect } from 'react';
import { Card } from '@components/common/Card';
import { Button } from '@components/common/Button';
import { Input } from '@components/common/Input';
import { Table } from '@components/common/Table';
import { TableSkeleton } from '@components/common/Loading';
import { useToast } from '@components/common/Toast';
import { useDemo } from '@contexts/DemoContext';
import { sampleAdjustments } from '@data/sampleData';
import { supabase } from '@services/supabase';
import { AddAdjustmentModal } from '@components/adjustments/AddAdjustmentModal';

interface Adjustment {
  id: string;
  product_name: string;
  location_name: string;
  quantity_change: number;
  reason: 'loss' | 'theft' | 'expiry' | 'cycle_count' | 'damage' | 'other';
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  created_by: string;
}

export function Adjustments() {
  const [adjustments, setAdjustments] = useState<Adjustment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const { showToast } = useToast();
  const { isDemoMode } = useDemo();

  useEffect(() => {
    fetchAdjustments();
  }, [isDemoMode]);

  const fetchAdjustments = async () => {
    try {
      setLoading(true);
      
      if (isDemoMode) {
        // Use sample data for demo mode
        setAdjustments(sampleAdjustments as Adjustment[]);
      } else {
        // Fetch real data from Supabase
        const { data, error } = await supabase
          .from('stock_adjustments')
          .select(`
            *,
            products (name),
            locations (name)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        const formattedData = (data || []).map((item: any) => ({
          id: item.id,
          product_name: item.products?.name || 'Unknown Product',
          location_name: item.locations?.name || 'Unknown Location',
          quantity_change: item.quantity_change,
          reason: item.reason,
          status: item.status,
          created_at: item.created_at,
          created_by: item.created_by,
        }));
        setAdjustments(formattedData);
      }
    } catch (error: any) {
      console.error('Error fetching adjustments:', error.message || error);
      setAdjustments([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status as keyof typeof statusColors]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getReasonBadge = (reason: string) => {
    const reasonColors = {
      loss: 'bg-red-50 text-red-700 dark:bg-red-900/10 dark:text-red-400',
      theft: 'bg-red-50 text-red-700 dark:bg-red-900/10 dark:text-red-400',
      expiry: 'bg-orange-50 text-orange-700 dark:bg-orange-900/10 dark:text-orange-400',
      cycle_count: 'bg-blue-50 text-blue-700 dark:bg-blue-900/10 dark:text-blue-400',
      damage: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/10 dark:text-yellow-400',
      other: 'bg-gray-50 text-gray-700 dark:bg-gray-900/10 dark:text-gray-400',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${reasonColors[reason as keyof typeof reasonColors]}`}>
        {reason.replace('_', ' ').charAt(0).toUpperCase() + reason.slice(1).replace('_', ' ')}
      </span>
    );
  };

  const filteredAdjustments = adjustments.filter(adjustment => {
    const matchesSearch = 
      adjustment.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      adjustment.location_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || adjustment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      key: 'id',
      header: 'Adjustment ID',
      render: (adjustment: Adjustment) => (
        <span className="font-mono text-sm text-gray-900 dark:text-white">
          #ADJ-{adjustment.id.slice(0, 6)}
        </span>
      ),
    },
    {
      key: 'product_name',
      header: 'Product',
      sortable: true,
      render: (adjustment: Adjustment) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{adjustment.product_name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{adjustment.location_name}</p>
        </div>
      ),
    },
    {
      key: 'quantity_change',
      header: 'Quantity Change',
      render: (adjustment: Adjustment) => (
        <span className={`font-semibold ${adjustment.quantity_change > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {adjustment.quantity_change > 0 ? '+' : ''}{adjustment.quantity_change}
        </span>
      ),
    },
    {
      key: 'reason',
      header: 'Reason',
      render: (adjustment: Adjustment) => getReasonBadge(adjustment.reason),
    },
    {
      key: 'status',
      header: 'Status',
      render: (adjustment: Adjustment) => getStatusBadge(adjustment.status),
    },
    {
      key: 'created_at',
      header: 'Date',
      render: (adjustment: Adjustment) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(adjustment.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (adjustment: Adjustment) => (
        <div className="flex gap-2">
          <button
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
            onClick={() => showToast('View adjustment details', 'info')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          {adjustment.status === 'pending' && (
            <>
              <button
                className="text-green-600 hover:text-green-700 dark:text-green-400"
                onClick={() => showToast('Approve adjustment', 'success')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </button>
              <button
                className="text-red-600 hover:text-red-700 dark:text-red-400"
                onClick={() => showToast('Reject adjustment', 'error')}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Inventory Adjustments
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Fix mismatches between recorded and physical stock
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Adjustment
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search by product or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Adjustments Table */}
      <Card>
        {loading ? (
          <TableSkeleton rows={5} columns={7} />
        ) : (
          <Table
            data={filteredAdjustments}
            columns={columns}
            onRowClick={(adjustment) => console.log('View adjustment:', adjustment)}
            emptyMessage="No adjustments found. Create your first adjustment to get started."
          />
        )}
      </Card>

      {/* Info Card */}
      <Card title="Stock Adjustment Process" subtitle="How to fix inventory discrepancies">
        <div className="prose dark:prose-invert max-w-none">
          <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <li><strong>Select product/location</strong> - Choose the item to adjust</li>
            <li><strong>Enter counted quantity</strong> - Input the actual physical count</li>
            <li><strong>System auto-updates</strong> - The system calculates the difference and logs the adjustment</li>
          </ol>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
            <strong>Example:</strong> 3 kg steel damaged → Stock: –3
          </p>
        </div>
      </Card>

      {/* Add Adjustment Modal */}
      <AddAdjustmentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchAdjustments}
      />
    </div>
  );
}
