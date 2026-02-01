import { useState } from 'react';
import { Modal } from '@components/common/Modal';
import { Input } from '@components/common/Input';
import { Button } from '@components/common/Button';
import { useToast } from '@components/common/Toast';
import { useDemo } from '@contexts/DemoContext';
import { supabase } from '@services/supabase';

interface AddDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddDeliveryModal({ isOpen, onClose, onSuccess }: AddDeliveryModalProps) {
  const { showToast } = useToast();
  const { isDemoMode } = useDemo();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    customerName: '',
    orderNumber: '',
    deliveryDate: new Date().toISOString().split('T')[0],
    address: '',
    phone: '',
    notes: '',
    status: 'draft' as const,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerName) {
      showToast('Please enter customer name', 'error');
      return;
    }

    setSaving(true);

    try {
      if (isDemoMode) {
        // Demo mode: just show message
        await new Promise(resolve => setTimeout(resolve, 500));
        showToast('Delivery created! (Demo mode - not saved)', 'info');
      } else {
        // Real mode: insert into Supabase
        const { data: { user } } = await supabase.auth.getUser();

        const { error } = await supabase
          .from('deliveries')
          .insert({
            customer_name: formData.customerName,
            order_number: formData.orderNumber || null,
            delivery_date: formData.deliveryDate,
            delivery_address: formData.address || null,
            phone: formData.phone || null,
            notes: formData.notes || null,
            status: formData.status,
            total_items: 0,
            created_by: user?.id || null,
          });

        if (error) throw error;
        showToast('Delivery created successfully!', 'success');
      }

      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      showToast(error.message || 'Failed to create delivery', 'error');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      customerName: '',
      orderNumber: '',
      deliveryDate: new Date().toISOString().split('T')[0],
      address: '',
      phone: '',
      notes: '',
      status: 'draft',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Delivery" backgroundImage="/module_bg.png">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Customer Name *"
            value={formData.customerName}
            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
            placeholder="e.g., Metro Construction Co."
            required
          />
          <Input
            label="Order Number"
            value={formData.orderNumber}
            onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
            placeholder="e.g., ORD-2024-001"
          />
        </div>

        <Input
          label="Delivery Address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="Full delivery address"
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+91 98765 43210"
          />
          <Input
            label="Delivery Date"
            type="date"
            value={formData.deliveryDate}
            onChange={(e) => setFormData({ ...formData, deliveryDate: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="draft">Draft</option>
            <option value="picking">Picking</option>
            <option value="packing">Packing</option>
            <option value="ready">Ready</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Delivery instructions..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              onClose();
              resetForm();
            }}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={saving}
          >
            {saving ? 'Creating...' : 'Create Delivery'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
