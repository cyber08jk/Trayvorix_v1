import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '@components/common/Card';
import { Button } from '@components/common/Button';
import { Input } from '@components/common/Input';
import { Table } from '@components/common/Table';
import { TableSkeleton } from '@components/common/Loading';
import { useToast } from '@components/common/Toast';
import { useDemo } from '@contexts/DemoContext';
import { sampleReceipts } from '@data/sampleData';
import { supabase } from '@services/supabase';
import { AddReceiptModal } from '@components/receipts/AddReceiptModal';
import { ReceiptPDFModal } from '@components/receipts/ReceiptPDFModal';

interface Receipt {
  id: string;
  supplier_name: string;
  status: 'draft' | 'waiting' | 'ready' | 'done' | 'canceled';
  total_items: number;
  created_at: string;
  created_by: string;
}
export function Receipts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPDFModal, setShowPDFModal] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const { showToast } = useToast();
  const { isDemoMode } = useDemo();

  useEffect(() => {
    fetchReceipts();
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

  const fetchReceipts = async () => {
    try {
      setLoading(true);

      if (isDemoMode) {
        // Use sample data for demo mode
        setReceipts(sampleReceipts as Receipt[]);
      } else {
        // Fetch real data from Supabase
        const { data, error } = await supabase
          .from('receipts')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setReceipts(data || []);
      }
    } catch (error: any) {
      console.error('Error fetching receipts:', error.message || error);
      setReceipts([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
      waiting: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      ready: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      done: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      canceled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status as keyof typeof statusColors]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredReceipts = receipts.filter(receipt => {
    const matchesSearch = receipt.supplier_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || receipt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      key: 'id',
      header: 'Receipt ID',
      render: (receipt: Receipt) => (
        <span className="font-mono text-sm text-gray-900 dark:text-white">
          #{receipt.id.slice(0, 8)}
        </span>
      ),
    },
    {
      key: 'supplier_name',
      header: 'Supplier',
      sortable: true,
    },
    {
      key: 'total_items',
      header: 'Total Items',
      render: (receipt: Receipt) => (
        <span className="text-gray-900 dark:text-white">{receipt.total_items} units</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (receipt: Receipt) => getStatusBadge(receipt.status),
    },
    {
      key: 'created_at',
      header: 'Date',
      render: (receipt: Receipt) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(receipt.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (receipt: Receipt) => (
        <div className="flex gap-2">
          <button
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedReceipt(receipt);
              setShowPDFModal(true);
            }}
            title="View PDF"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          {receipt.status === 'draft' && (
            <button
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedReceipt(receipt);
                setShowPDFModal(true);
              }}
              title="Edit Receipt"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
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
            Receipts (Incoming Stock)
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage incoming goods from vendors
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Receipt
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search by supplier name..."
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
              <option value="waiting">Waiting</option>
              <option value="ready">Ready</option>
              <option value="done">Done</option>
              <option value="canceled">Canceled</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Receipts Table */}
      <Card>
        {loading ? (
          <TableSkeleton rows={5} columns={6} />
        ) : (
          <Table
            data={filteredReceipts}
            columns={columns}
            onRowClick={(receipt) => console.log('View receipt:', receipt)}
            emptyMessage="No receipts found. Create your first receipt to get started."
          />
        )}
      </Card>

      {/* Info Card */}
      <Card title="How Receipts Work" subtitle="Understanding the receipt process">
        <div className="prose dark:prose-invert max-w-none">
          <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <li><strong>Create a new receipt</strong> - Add supplier information and products</li>
            <li><strong>Input quantities received</strong> - Enter the actual quantities received</li>
            <li><strong>Validate</strong> - Stock increases automatically when validated</li>
          </ol>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
            <strong>Example:</strong> Receive 50 units of "Steel Rods" → stock +50
          </p>
        </div>

      {/* Receipt PDF Modal */}
      <ReceiptPDFModal
        isOpen={showPDFModal}
        onClose={() => {
          setShowPDFModal(false);
          setSelectedReceipt(null);
        }}
        receipt={selectedReceipt}
      />
      </Card>

      {/* Add Receipt Modal */}
      <AddReceiptModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchReceipts}
      />
    </div>
  );
}
