import { useState } from 'react';
import { Modal } from '@components/common/Modal';
import { Input } from '@components/common/Input';
import { Button } from '@components/common/Button';
import { supabase } from '@services/supabase';
import { useToast } from '@components/common/Toast';
import { useDemo } from '@contexts/DemoContext';

interface AddWarehouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddWarehouseModal({ isOpen, onClose, onSuccess }: AddWarehouseModalProps) {
  const { showToast } = useToast();
  const { isDemoMode } = useDemo();
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    capacity: 10000,
    manager: '',
    phone: '',
    email: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.location) {
      showToast('Please fill in required fields', 'error');
      return;
    }

    setSaving(true);
    
    try {
      if (isDemoMode) {
        await new Promise(resolve => setTimeout(resolve, 800));
        showToast('Warehouse added successfully! (Demo Mode)', 'success');
      } else {
        const { error } = await supabase
          .from('warehouses')
          .insert([
            {
              name: formData.name,
              address: formData.location,
              metadata: {
                capacity: formData.capacity,
                manager: formData.manager,
                phone: formData.phone,
                email: formData.email,
              }
            }
          ]);

        if (error) throw error;
        showToast('Warehouse added successfully!', 'success');
      }
      
      onSuccess();
      onClose();
      resetForm();
    } catch (error: any) {
      showToast(error.message || 'Failed to add warehouse', 'error');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      location: '',
      capacity: 10000,
      manager: '',
      phone: '',
      email: '',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Warehouse">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Warehouse Name *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Mumbai Central Hub"
            required
          />
          <Input
            label="Capacity (sq ft)"
            type="number"
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })}
            placeholder="10000"
            min="0"
          />
        </div>

        <Input
          label="Location/Address *"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          placeholder="e.g., Andheri East, Mumbai, MH"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Manager Name"
            value={formData.manager}
            onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
            placeholder="e.g., John Doe"
          />
          <Input
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+91 98765 43210"
          />
        </div>

        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="warehouse@company.com"
        />


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
            {saving ? 'Adding...' : 'Add Warehouse'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
