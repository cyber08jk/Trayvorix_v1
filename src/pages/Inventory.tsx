import { useState, useEffect } from 'react';
import { Card } from '@components/common/Card';
import { Button } from '@components/common/Button';
import { Input } from '@components/common/Input';
import { Table } from '@components/common/Table';
import { TableSkeleton } from '@components/common/Loading';
import { useDemo } from '@contexts/DemoContext';
import { supabase } from '@services/supabase';
import { InventoryItem } from '@services/inventory.service';

interface InventoryWithDetails extends InventoryItem {
    product_name?: string;
    product_sku?: string;
    warehouse_name?: string;
    location_name?: string;
}

export function Inventory() {
    const [inventory, setInventory] = useState<InventoryWithDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [warehouseFilter, setWarehouseFilter] = useState<string>('all');
    const [lowStockOnly, setLowStockOnly] = useState(false);
    const { isDemoMode } = useDemo();

    useEffect(() => {
        fetchInventory();
    }, [isDemoMode, warehouseFilter]);

    const fetchInventory = async () => {
        try {
            setLoading(true);

            if (isDemoMode) {
                // Demo mode: use sample data
                const sampleInventory: InventoryWithDetails[] = [
                    {
                        id: '1',
                        product_id: '1',
                        warehouse_id: '1',
                        location_id: '1',
                        quantity: 850,
                        reserved_quantity: 50,
                        available_quantity: 800,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        product_name: 'Steel Rods (10mm)',
                        product_sku: 'STL-ROD-001',
                        warehouse_name: 'Mumbai Central Hub',
                        location_name: 'Rack A-1',
                        products: {
                            id: '1',
                            name: 'Steel Rods (10mm)',
                            sku: 'STL-ROD-001',
                            unit: 'kg',
                            reorder_point: 500,
                        },
                    },
                    {
                        id: '2',
                        product_id: '2',
                        warehouse_id: '1',
                        location_id: '2',
                        quantity: 120,
                        reserved_quantity: 20,
                        available_quantity: 100,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        product_name: 'Wooden Planks',
                        product_sku: 'WD-PLK-002',
                        warehouse_name: 'Mumbai Central Hub',
                        location_name: 'Rack B-3',
                        products: {
                            id: '2',
                            name: 'Wooden Planks',
                            sku: 'WD-PLK-002',
                            unit: 'piece',
                            reorder_point: 100,
                        },
                    },
                    {
                        id: '3',
                        product_id: '3',
                        warehouse_id: '2',
                        location_id: '3',
                        quantity: 450,
                        reserved_quantity: 0,
                        available_quantity: 450,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        product_name: 'Portland Cement',
                        product_sku: 'CEM-BAG-003',
                        warehouse_name: 'Delhi Distribution Center',
                        location_name: 'Zone C',
                        products: {
                            id: '3',
                            name: 'Portland Cement',
                            sku: 'CEM-BAG-003',
                            unit: 'bag',
                            reorder_point: 200,
                        },
                    },
                    {
                        id: '4',
                        product_id: '4',
                        warehouse_id: '1',
                        location_id: '1',
                        quantity: 35,
                        reserved_quantity: 5,
                        available_quantity: 30,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                        product_name: 'White Paint',
                        product_sku: 'PNT-WHT-004',
                        warehouse_name: 'Mumbai Central Hub',
                        location_name: 'Rack A-1',
                        products: {
                            id: '4',
                            name: 'White Paint',
                            sku: 'PNT-WHT-004',
                            unit: 'liter',
                            reorder_point: 50,
                        },
                    },
                ];
                setInventory(sampleInventory);
            } else {
                // Real mode: fetch from Supabase
                let query = supabase
                    .from('inventory')
                    .select(`
            *,
            products (id, name, sku, unit, reorder_point),
            warehouses (id, name),
            locations (id, name)
          `)
                    .order('quantity', { ascending: false });

                if (warehouseFilter !== 'all') {
                    query = query.eq('warehouse_id', warehouseFilter);
                }

                const { data, error } = await query;

                if (error) throw error;

                const formattedData: InventoryWithDetails[] = (data || []).map(item => ({
                    ...item,
                    product_name: item.products?.name,
                    product_sku: item.products?.sku,
                    warehouse_name: item.warehouses?.name,
                    location_name: item.locations?.name,
                }));

                setInventory(formattedData);
            }
        } catch (error: any) {
            console.error('Error fetching inventory:', error.message || error);
            setInventory([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredInventory = inventory.filter(item => {
        const matchesSearch =
            item.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.product_sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.warehouse_name?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesLowStock = !lowStockOnly ||
            (item.products && item.quantity < item.products.reorder_point);

        return matchesSearch && matchesLowStock;
    });

    const getStockStatus = (item: InventoryWithDetails) => {
        if (!item.products) return 'normal';

        if (item.quantity === 0) return 'out';
        if (item.quantity < item.products.reorder_point * 0.5) return 'critical';
        if (item.quantity < item.products.reorder_point) return 'low';
        return 'normal';
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            out: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
            critical: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
            low: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
            normal: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
        };

        const labels = {
            out: 'Out of Stock',
            critical: 'Critical',
            low: 'Low Stock',
            normal: 'Normal',
        };

        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${badges[status as keyof typeof badges]}`}>
                {labels[status as keyof typeof labels]}
            </span>
        );
    };

    const columns = [
        {
            key: 'product',
            header: 'Product',
            sortable: true,
            render: (item: InventoryWithDetails) => (
                <div>
                    <p className="font-medium text-gray-900 dark:text-white">{item.product_name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.product_sku}</p>
                </div>
            ),
        },
        {
            key: 'warehouse',
            header: 'Warehouse',
            render: (item: InventoryWithDetails) => (
                <span className="text-gray-900 dark:text-white">{item.warehouse_name}</span>
            ),
        },
        {
            key: 'location',
            header: 'Location',
            render: (item: InventoryWithDetails) => (
                <span className="text-gray-600 dark:text-gray-400">{item.location_name}</span>
            ),
        },
        {
            key: 'quantity',
            header: 'Quantity',
            sortable: true,
            render: (item: InventoryWithDetails) => (
                <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                        {item.quantity} {item.products?.unit}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Available: {item.available_quantity}
                    </p>
                </div>
            ),
        },
        {
            key: 'reserved',
            header: 'Reserved',
            render: (item: InventoryWithDetails) => (
                <span className="text-gray-600 dark:text-gray-400">
                    {item.reserved_quantity} {item.products?.unit}
                </span>
            ),
        },
        {
            key: 'status',
            header: 'Status',
            render: (item: InventoryWithDetails) => getStatusBadge(getStockStatus(item)),
        },
        {
            key: 'reorder_point',
            header: 'Reorder Point',
            render: (item: InventoryWithDetails) => (
                <span className="text-gray-600 dark:text-gray-400">
                    {item.products?.reorder_point} {item.products?.unit}
                </span>
            ),
        },
    ];

    // Calculate summary stats
    const totalItems = filteredInventory.reduce((sum, item) => sum + item.quantity, 0);
    const lowStockCount = filteredInventory.filter(item => getStockStatus(item) === 'low' || getStockStatus(item) === 'critical').length;
    const outOfStockCount = filteredInventory.filter(item => getStockStatus(item) === 'out').length;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Inventory
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        View and manage stock levels across all warehouses
                    </p>
                </div>
                <Button variant="primary" onClick={() => window.location.href = '/adjustments'}>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Adjust Inventory
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Total Items</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalItems.toLocaleString()}</p>
                        </div>
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Unique Products</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredInventory.length}</p>
                        </div>
                        <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                            <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Low Stock Items</p>
                            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{lowStockCount}</p>
                        </div>
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                            <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Out of Stock</p>
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{outOfStockCount}</p>
                        </div>
                        <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                            <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <Input
                            type="text"
                            placeholder="Search by product name, SKU, or warehouse..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="sm:w-48">
                        <select
                            value={warehouseFilter}
                            onChange={(e) => setWarehouseFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="all">All Warehouses</option>
                            <option value="1">Mumbai Central Hub</option>
                            <option value="2">Delhi Distribution Center</option>
                            <option value="3">Bangalore Cold Chain</option>
                        </select>
                    </div>
                    <div className="flex items-center">
                        <label className="flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={lowStockOnly}
                                onChange={(e) => setLowStockOnly(e.target.checked)}
                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Low Stock Only</span>
                        </label>
                    </div>
                </div>
            </Card>

            {/* Inventory Table */}
            <Card>
                {loading ? (
                    <TableSkeleton rows={10} columns={7} />
                ) : (
                    <Table
                        data={filteredInventory}
                        columns={columns}
                        onRowClick={(item) => console.log('View inventory details:', item)}
                        emptyMessage="No inventory found. Start by receiving products into your warehouses."
                    />
                )}
            </Card>
        </div>
    );
}
