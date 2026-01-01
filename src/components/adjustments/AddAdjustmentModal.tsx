import { useState } from 'react';
import { Modal } from '@components/common/Modal';
import { Input } from '@components/common/Input';
import { Button } from '@components/common/Button';
import { useToast } from '@components/common/Toast';


interface AddAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddAdjustmentModal({ isOpen, onClose, onSuccess }: AddAdjustmentModalProps) {
  const { showToast } = useToast();

  const [saving, setSaving] = useState(false);


  const [formData, setFormData] = useState({
    productName: '',
    locationName: '',
    currentQuantity: 0,
    countedQuantity: 0,
    reason: 'cycle_count' as const,
    notes: '',
  });

  const quantityDifference = formData.countedQuantity - formData.currentQuantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.productName || !formData.locationName) {
      showToast('Please fill in required fields', 'error');
      return;
    }

    if (quantityDifference === 0) {
      showToast('No adjustment needed - quantities match', 'info');
      return;
    }

    setSaving(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      showToast(`Adjustment created: ${quantityDifference > 0 ? '+' : ''}${quantityDifference} units`, 'success');

      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      showToast(error.message || 'Failed to create adjustment', 'error');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      productName: '',
      locationName: '',
      currentQuantity: 0,
      countedQuantity: 0,
      reason: 'cycle_count',
      notes: '',
    });
  };


  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Stock Adjustment">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Product Name *"
            value={formData.productName}
            onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
            placeholder="e.g., Steel Rods"
            required
          />
          <Input
            label="Location *"
            value={formData.locationName}
            onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
            placeholder="e.g., Warehouse A - Rack 1"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Current System Quantity"
            type="number"
            value={formData.currentQuantity}
            onChange={(e) => setFormData({ ...formData, currentQuantity: parseInt(e.target.value) || 0 })}
            placeholder="100"
            min="0"
          />
          <Input
            label="Counted Quantity *"
            type="number"
            value={formData.countedQuantity}
            onChange={(e) => setFormData({ ...formData, countedQuantity: parseInt(e.target.value) || 0 })}
            placeholder="97"
            min="0"
            required
          />
        </div>

        {/* Difference Display */}
        {quantityDifference !== 0 && (
          <div className={`p-3 rounded-lg ${quantityDifference > 0 ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
            <p className={`text-sm font-medium ${quantityDifference > 0 ? 'text-green-900 dark:text-green-300' : 'text-red-900 dark:text-red-300'}`}>
              Adjustment: {quantityDifference > 0 ? '+' : ''}{quantityDifference} units
            </p>
            <p className={`text-xs mt-1 ${quantityDifference > 0 ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
              {quantityDifference > 0 ? 'Stock will increase' : 'Stock will decrease'}
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Reason *
          </label>
          <select
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          >
            <option value="cycle_count">Cycle Count</option>
            <option value="damage">Damage</option>
            <option value="loss">Loss</option>
            <option value="theft">Theft</option>
            <option value="expiry">Expiry</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Explain the reason for adjustment..."
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
            disabled={saving || quantityDifference === 0}
          >
            {saving ? 'Creating...' : 'Create Adjustment'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
