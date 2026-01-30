import { useState, useEffect } from 'react';
import { supabase } from '@services/supabase';
import { Card } from '@components/common/Card';
import { Button } from '@components/common/Button';
import { Input } from '@components/common/Input';
import { Table } from '@components/common/Table';
import { TableSkeleton } from '@components/common/Loading';
import { useToast } from '@components/common/Toast';
import { useDemo } from '@contexts/DemoContext';
import { sampleProducts } from '@data/sampleData';
import { AddProductModal } from '@components/products/AddProductModal';
import { EditProductModal } from '@components/products/EditProductModal';


interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category_id: string;
  unit: string;
  reorder_point: number;
  created_at: string;
  categories?: {
    name: string;
  };
}

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { showToast } = useToast();
  const { isDemoMode } = useDemo();

  useEffect(() => {
    fetchProducts();
  }, [isDemoMode]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      if (isDemoMode) {
        // Use sample data for demo mode
        setProducts(sampleProducts as Product[]);
      } else {
        // Fetch real data from Supabase
        const { data, error } = await supabase
          .from('products')
          .select(`
            *,
            categories (
              name
            )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProducts(data || []);
      }
    } catch (error: any) {
      console.error('Error fetching products:', error.message || error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      key: 'sku',
      header: 'SKU',
      sortable: true,
    },
    {
      key: 'name',
      header: 'Product Name',
      sortable: true,
      render: (product: Product) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
          {product.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
              {product.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (product: Product) => (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
          {product.categories?.name || 'Uncategorized'}
        </span>
      ),
    },
    {
      key: 'unit',
      header: 'Unit',
    },
    {
      key: 'reorder_point',
      header: 'Reorder Point',
      render: (product: Product) => (
        <span className="text-gray-900 dark:text-white">{product.reorder_point}</span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (product: Product) => (
        <div className="flex gap-2">
          <button
            className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
            onClick={() => handleEdit(product)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            className="text-red-600 hover:text-red-700 dark:text-red-400"
            onClick={() => handleDelete(product)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleDelete = async (product: Product) => {
    if (isDemoMode) {
      showToast('Delete is disabled in demo mode', 'info');
      return;
    }
    
    if (!confirm(`Are you sure you want to delete ${product.name}?`)) return;

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', product.id);

      if (error) throw error;
      
      showToast('Product deleted successfully', 'success');
      fetchProducts();
    } catch (error: any) {
      showToast(error.message || 'Error deleting product', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Products
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Manage your product catalog
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search products by name, SKU, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={viewMode === 'table' ? 'primary' : 'ghost'}
              onClick={() => setViewMode('table')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'ghost'}
              onClick={() => setViewMode('grid')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </Button>
          </div>
        </div>
      </Card>

      {/* Products List */}
      <Card>
        {loading ? (
          <TableSkeleton rows={5} columns={6} />
        ) : viewMode === 'table' ? (
          <Table
            data={filteredProducts}
            columns={columns}
            onRowClick={(product) => console.log('View product:', product)}
            emptyMessage="No products found. Add your first product to get started."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => console.log('View product:', product)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {product.name}
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {product.sku}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {product.description || 'No description'}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                    {product.categories?.name || 'Uncategorized'}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    Reorder: {product.reorder_point}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Pagination */}
      {!loading && filteredProducts.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredProducts.length} of {products.length} products
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" disabled>
              Previous
            </Button>
            <Button variant="ghost" size="sm" disabled>
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchProducts}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedProduct(null);
        }}
        onSuccess={fetchProducts}
        product={selectedProduct}
      />
    </div>
  );
}
