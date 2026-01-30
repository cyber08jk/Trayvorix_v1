import { useState, useEffect } from 'react';
import { Modal } from '@components/common/Modal';
import { Input } from '@components/common/Input';
import { Button } from '@components/common/Button';
import { supabase } from '@services/supabase';
import { useToast } from '@components/common/Toast';
import { useDemo } from '@contexts/DemoContext';

interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category_id: string;
  unit: string;
  reorder_point: number;
}

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  product: Product | null;
}

export function EditProductModal({ isOpen, onClose, onSuccess, product }: EditProductModalProps) {
  const { showToast } = useToast();
  const { isDemoMode } = useDemo();
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    unit: 'pieces',
    reorderPoint: 10,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        sku: product.sku,
        name: product.name,
        description: product.description || '',
        unit: product.unit,
        reorderPoint: product.reorder_point,
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.sku || !formData.name) {
      showToast('Please fill in required fields', 'error');
      return;
    }

    if (!product) return;

    setSaving(true);
    
    try {
      if (isDemoMode) {
        // Demo mode - just simulate success
        await new Promise(resolve => setTimeout(resolve, 800));
        showToast('Product updated successfully! (Demo Mode)', 'success');
      } else {
        // Real mode - update in Supabase
        const { error } = await supabase
          .from('products')
          .update({
            sku: formData.sku,
            name: formData.name,
            description: formData.description,
            unit: formData.unit,
            reorder_point: formData.reorderPoint,
          })
          .eq('id', product.id);

        if (error) throw error;
        showToast('Product updated successfully!', 'success');
      }
      
      onSuccess();
      onClose();
    } catch (error: any) {
      showToast(error.message || 'Failed to update product', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Product">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="SKU *"
            value={formData.sku}
            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            placeholder="e.g., PROD-001"
            required
          />
          <Input
            label="Product Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Steel Rods"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Product description..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Unit
            </label>
            <select
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="pieces">Pieces</option>
              <option value="kg">Kilograms</option>
              <option value="liter">Liters</option>
              <option value="meter">Meters</option>
              <option value="box">Boxes</option>
              <option value="bag">Bags</option>
            </select>
          </div>

          <Input
            label="Reorder Point"
            type="number"
            value={formData.reorderPoint}
            onChange={(e) => setFormData({ ...formData, reorderPoint: parseInt(e.target.value) || 0 })}
            placeholder="10"
            min="0"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={saving}
          >
            {saving ? 'Updating...' : 'Update Product'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
