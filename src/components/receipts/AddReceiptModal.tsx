import { useState } from 'react';
import { Modal } from '@components/common/Modal';
import { Input } from '@components/common/Input';
import { Button } from '@components/common/Button';
import { useToast } from '@components/common/Toast';
import { useDemo } from '@contexts/DemoContext';
import { supabase } from '@services/supabase';

interface AddReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddReceiptModal({ isOpen, onClose, onSuccess }: AddReceiptModalProps) {
  const { showToast } = useToast();
  const { isDemoMode } = useDemo();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    supplierName: '',
    referenceNumber: '',
    expectedDate: new Date().toISOString().split('T')[0],
    notes: '',
    status: 'draft' as const,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.supplierName) {
      showToast('Please enter supplier name', 'error');
      return;
    }

    setSaving(true);

    try {
      if (isDemoMode) {
        // Demo mode: just show message
        await new Promise(resolve => setTimeout(resolve, 500));
        showToast('Receipt created! (Demo mode - not saved)', 'info');
      } else {
        // Real mode: insert into Supabase
        const { data: { user } } = await supabase.auth.getUser();

        const { error } = await supabase
          .from('receipts')
          .insert({
            supplier_name: formData.supplierName,
            reference_number: formData.referenceNumber || null,
            expected_date: formData.expectedDate,
            notes: formData.notes || null,
            status: formData.status,
            total_items: 0,
            created_by: user?.id || null,
          });

        if (error) throw error;
        showToast('Receipt created successfully!', 'success');
      }

      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      showToast(error.message || 'Failed to create receipt', 'error');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      supplierName: '',
      referenceNumber: '',
      expectedDate: new Date().toISOString().split('T')[0],
      notes: '',
      status: 'draft',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Receipt" backgroundImage="/module_bg.png">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Supplier Name *"
            value={formData.supplierName}
            onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
            placeholder="e.g., ABC Suppliers Ltd"
            required
          />
          <Input
            label="Reference Number"
            value={formData.referenceNumber}
            onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
            placeholder="e.g., PO-2024-001"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Expected Date"
            type="date"
            value={formData.expectedDate}
            onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
          />
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
              <option value="waiting">Waiting</option>
              <option value="ready">Ready</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Additional notes..."
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
            {saving ? 'Creating...' : 'Create Receipt'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
