import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '@components/common/Card';
import { Button } from '@components/common/Button';
import { Input } from '@components/common/Input';
import { Table } from '@components/common/Table';
import { TableSkeleton } from '@components/common/Loading';
import { useToast } from '@components/common/Toast';
import { useDemo } from '@contexts/DemoContext';
import { sampleDeliveries } from '@data/sampleData';
import { supabase } from '@services/supabase';
import { AddDeliveryModal } from '@components/deliveries/AddDeliveryModal';
import AIAssistant from '@components/ai/AIAssistant';
import botImg from '../../asserts/bot_img.png';

interface Delivery {
  id: string;
  customer_name: string;
  status: 'draft' | 'picking' | 'packing' | 'ready' | 'shipped' | 'canceled';
  total_items: number;
  created_at: string;
}

export function Deliveries() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const { showToast } = useToast();
  const { isDemoMode } = useDemo();

  useEffect(() => {
    fetchDeliveries();
  }, [isDemoMode]);

  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      setShowAddModal(true);
      // Clean up URL
      setSearchParams(params => {
        params.delete('action');
        return params;
      });
    }
  }, [searchParams]);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);

      if (isDemoMode) {
        // Use sample data for demo mode
        setDeliveries(sampleDeliveries as Delivery[]);
      } else {
        // Fetch real data from Supabase
        const { data, error } = await supabase
          .from('deliveries')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setDeliveries(data || []);
      }

    } catch (error: any) {
      console.error('Error fetching deliveries:', error.message || error);
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

  
  const getStatusBadge = (status: string) => {
    const statusColors = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      picking: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      packing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      ready: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      shipped: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      canceled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    };

    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status as keyof typeof statusColors]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredDeliveries = deliveries.filter(delivery => {
    const matchesSearch = delivery.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || delivery.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      key: 'id',
      header: 'Order ID',
      render: (delivery: Delivery) => (
        <span className="font-mono text-sm text-gray-900 dark:text-white">
          #DO-{delivery.id.slice(0, 6)}
        </span>
      ),
    },
    {
      key: 'customer_name',
      header: 'Customer',
      sortable: true,
    },
    {
      key: 'total_items',
      header: 'Total Items',
      render: (delivery: Delivery) => (
        <span className="text-gray-900 dark:text-white">{delivery.total_items} units</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (delivery: Delivery) => getStatusBadge(delivery.status),
    },
    {
      key: 'created_at',
      header: 'Date',
      render: (delivery: Delivery) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(delivery.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (delivery: Delivery) => (
        <div className="flex gap-2">
          <button
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
            onClick={() => showToast('View delivery details', 'info')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          {delivery.status !== 'shipped' && delivery.status !== 'canceled' && (
            <button
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
              onClick={() => showToast('Process delivery', 'info')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 relative">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Delivery Orders (Outgoing Stock)
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage outgoing shipments for customers
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Delivery Order
        </Button>
      </div>

      {/* Floating Chatbot Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={() => setShowChatbot((prev) => !prev)}
          className="w-16 h-16 rounded-full bg-[#1c1c1e] shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
        >
          <img src={botImg} alt="Chatbot" className="w-10 h-10" />
        </button>
      </div>

      {/* Chatbot Modal */}
      {showChatbot && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-8 pointer-events-none">
          <div className="pointer-events-auto">
            <AIAssistant />
          </div>
        </div>
      )}
      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search by customer name..."
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
              <option value="draft">Draft</option>
              <option value="picking">Picking</option>
              <option value="packing">Packing</option>
              <option value="ready">Ready</option>
              <option value="shipped">Shipped</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Deliveries Table */}
      <Card>
        {loading ? (
          <TableSkeleton rows={5} columns={6} />
        ) : (
          <Table
            data={filteredDeliveries}
            columns={columns}
            onRowClick={(delivery) => console.log('View delivery:', delivery)}
            emptyMessage="No delivery orders found. Create your first delivery order to get started."
          />
        )}
      </Card>

      {/* Info Card */}
      <Card title="Delivery Process" subtitle="Understanding the delivery workflow">
        <div className="prose dark:prose-invert max-w-none">
          <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <li><strong>Pick items</strong> - Select and gather items from warehouse</li>
            <li><strong>Pack items</strong> - Package items for shipment</li>
            <li><strong>Validate</strong> - Stock decreases automatically when shipped</li>
          </ol>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
            <strong>Example:</strong> Sales order for 10 chairs → Delivery order reduces chairs by 10
          </p>
        </div>
      </Card>

      {/* Add Delivery Modal */}
      <AddDeliveryModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchDeliveries}
      />
    </div>
  );
}
