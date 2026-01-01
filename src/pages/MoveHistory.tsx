import { useState, useEffect } from 'react';
import { Card } from '@components/common/Card';
import { Input } from '@components/common/Input';
import { Table } from '@components/common/Table';
import { TableSkeleton } from '@components/common/Loading';
import { useToast } from '@components/common/Toast';
import { useDemo } from '@contexts/DemoContext';
import { sampleMovements } from '@data/sampleData';
import { supabase } from '@services/supabase';

interface Movement {
  id: string;
  product_name: string;
  from_location: string;
  to_location: string;
  quantity: number;
  type: 'receive' | 'ship' | 'transfer' | 'adjust';
  user_name: string;
  created_at: string;
}

export function MoveHistory() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('7days');
  const { showToast } = useToast();
  const { isDemoMode } = useDemo();

  useEffect(() => {
    fetchMovements();
  }, [dateRange, isDemoMode]);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      
      if (isDemoMode) {
        // Use sample data for demo mode
        setMovements(sampleMovements as Movement[]);
      } else {
        // Fetch real data from Supabase
        const { data, error } = await supabase
          .from('stock_movements')
          .select(`
            *,
            products (name),
            from_location:locations!stock_movements_from_location_id_fkey (name),
            to_location:locations!stock_movements_to_location_id_fkey (name)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        const formattedData = (data || []).map((item: any) => ({
          id: item.id,
          product_name: item.products?.name || 'Unknown Product',
          from_location: item.from_location?.name || 'N/A',
          to_location: item.to_location?.name || 'N/A',
          quantity: item.quantity,
          type: item.type,
          user_name: item.created_by || 'Unknown',
          created_at: item.created_at,
        }));
        setMovements(formattedData);
      }
    } catch (error: any) {
      console.error('Error fetching movements:', error.message || error);
      setMovements([]);
    } finally {
      setLoading(false);
    }
  };

  const getTypeBadge = (type: string) => {
    const typeColors = {
      receive: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      ship: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      transfer: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
      adjust: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    };

    const typeIcons = {
      receive: '↓',
      ship: '↑',
      transfer: '⇄',
      adjust: '±',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeColors[type as keyof typeof typeColors]}`}>
        {typeIcons[type as keyof typeof typeIcons]} {type.charAt(0).toUpperCase() + type.slice(1)}
      </span>
    );
  };

  const filteredMovements = movements.filter(movement => {
    const matchesSearch = 
      movement.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.from_location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      movement.to_location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || movement.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const columns = [
    {
      key: 'created_at',
      header: 'Date & Time',
      sortable: true,
      render: (movement: Movement) => (
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {new Date(movement.created_at).toLocaleDateString()}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {new Date(movement.created_at).toLocaleTimeString()}
          </p>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (movement: Movement) => getTypeBadge(movement.type),
    },
    {
      key: 'product_name',
      header: 'Product',
      sortable: true,
    },
    {
      key: 'quantity',
      header: 'Quantity',
      render: (movement: Movement) => (
        <span className="font-semibold text-gray-900 dark:text-white">
          {movement.quantity} units
        </span>
      ),
    },
    {
      key: 'from_location',
      header: 'From',
      render: (movement: Movement) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {movement.from_location}
        </span>
      ),
    },
    {
      key: 'to_location',
      header: 'To',
      render: (movement: Movement) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {movement.to_location}
        </span>
      ),
    },
    {
      key: 'user_name',
      header: 'User',
      render: (movement: Movement) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {movement.user_name.split('@')[0]}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: () => (
        <button
          className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
          onClick={() => showToast('View movement details', 'info')}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Move History
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Complete history of all stock movements
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <Input
              type="text"
              placeholder="Search by product, location, or user..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="receive">Receive</option>
              <option value="ship">Ship</option>
              <option value="transfer">Transfer</option>
              <option value="adjust">Adjust</option>
            </select>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="today">Today</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Movements Table */}
      <Card>
        {loading ? (
          <TableSkeleton rows={5} columns={8} />
        ) : (
          <Table
            data={filteredMovements}
            columns={columns}
            onRowClick={(movement) => console.log('View movement:', movement)}
            emptyMessage="No stock movements found for the selected filters."
          />
        )}
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Received</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {movements.filter(m => m.type === 'receive').reduce((sum, m) => sum + m.quantity, 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Shipped</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {movements.filter(m => m.type === 'ship').reduce((sum, m) => sum + m.quantity, 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8zM12 15a1 1 0 100-2H6.414l1.293-1.293a1 1 0 10-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L6.414 15H12z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Transferred</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {movements.filter(m => m.type === 'transfer').reduce((sum, m) => sum + m.quantity, 0)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Adjusted</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {movements.filter(m => m.type === 'adjust').reduce((sum, m) => sum + Math.abs(m.quantity), 0)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Info Card */}
      <Card title="Understanding Stock Ledger" subtitle="Everything is logged">
        <div className="prose dark:prose-invert max-w-none">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            The stock ledger maintains a complete, immutable history of all inventory movements. Each entry includes:
          </p>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 mt-2">
            <li>Product and quantity moved</li>
            <li>Source and destination locations</li>
            <li>Type of movement (receive, ship, transfer, adjust)</li>
            <li>User who performed the action</li>
            <li>Timestamp of the movement</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
