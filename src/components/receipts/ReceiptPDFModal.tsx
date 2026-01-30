import { useEffect, useState } from 'react';
import { Modal } from '@components/common/Modal';
import { Button } from '@components/common/Button';
import { supabase } from '@services/supabase';
import { useDemo } from '@contexts/DemoContext';

interface Receipt {
  id: string;
  supplier_name: string;
  status: string;
  total_items: number;
  created_at: string;
  created_by: string;
  notes?: string;
}

interface ReceiptItem {
  id: string;
  product_name: string;
  quantity: number;
  unit: string;
  warehouse_name?: string;
}

interface ReceiptPDFModalProps {
  isOpen: boolean;
  onClose: () => void;
  receipt: Receipt | null;
}

export function ReceiptPDFModal({ isOpen, onClose, receipt }: ReceiptPDFModalProps) {
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { isDemoMode } = useDemo();

  useEffect(() => {
    if (receipt && isOpen) {
      fetchReceiptItems();
    }
  }, [receipt, isOpen]);

  const fetchReceiptItems = async () => {
    if (!receipt) return;

    try {
      setLoading(true);
      
      if (isDemoMode) {
        // Demo data
        setItems([
          {
            id: '1',
            product_name: 'Steel Rods',
            quantity: 100,
            unit: 'pieces',
            warehouse_name: 'Main Warehouse'
          },
          {
            id: '2',
            product_name: 'Cement Bags',
            quantity: 50,
            unit: 'bags',
            warehouse_name: 'Main Warehouse'
          }
        ]);
      } else {
        const { data, error } = await supabase
          .from('receipt_items')
          .select(`
            id,
            quantity,
            products (name, unit),
            warehouses (name)
          `)
          .eq('receipt_id', receipt.id);

        if (error) throw error;

        setItems(data?.map(item => ({
          id: item.id,
          product_name: (item.products as any)?.name || 'Unknown',
          quantity: item.quantity,
          unit: (item.products as any)?.unit || 'units',
          warehouse_name: (item.warehouses as any)?.name || 'Unknown'
        })) || []);
      }
    } catch (error) {
      console.error('Error fetching receipt items:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // In a real implementation, you'd generate a PDF using a library like jsPDF
    const printContent = document.getElementById('receipt-pdf-content');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Receipt ${receipt?.id.slice(0, 8)}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f4f4f4; }
                .header { margin-bottom: 20px; }
                .status-badge { 
                  display: inline-block; 
                  padding: 4px 12px; 
                  border-radius: 12px; 
                  font-size: 12px; 
                  font-weight: bold;
                }
                .status-done { background-color: #d1fae5; color: #065f46; }
                .status-waiting { background-color: #fef3c7; color: #92400e; }
                .status-ready { background-color: #dbeafe; color: #1e40af; }
                .status-draft { background-color: #f3f4f6; color: #374151; }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  if (!receipt) return null;

  const getStatusClass = (status: string) => {
    const classes = {
      done: 'status-done',
      waiting: 'status-waiting',
      ready: 'status-ready',
      draft: 'status-draft',
      canceled: 'status-canceled'
    };
    return classes[status as keyof typeof classes] || 'status-draft';
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Receipt Details" size="large">
      <div className="space-y-4">
        {/* PDF Preview Content */}
        <div id="receipt-pdf-content" className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="header border-b border-gray-200 dark:border-gray-700 pb-4 mb-4">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Receipt #{receipt.id.slice(0, 8)}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Date: {new Date(receipt.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <span className={`status-badge ${getStatusClass(receipt.status)} px-3 py-1 rounded-full text-xs font-semibold`}>
                {receipt.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Receipt Info */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Supplier Information</h3>
              <p className="text-gray-900 dark:text-white font-medium">{receipt.supplier_name}</p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Total Items</h3>
              <p className="text-gray-900 dark:text-white font-medium">{receipt.total_items} units</p>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Items Received</h3>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading items...</div>
            ) : (
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">#</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Product</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Warehouse</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">Quantity</th>
                    <th className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="border border-gray-300 dark:border-gray-600 px-4 py-8 text-center text-gray-500">
                        No items found
                      </td>
                    </tr>
                  ) : (
                    items.map((item, index) => (
                      <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-gray-900 dark:text-white">{index + 1}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-gray-900 dark:text-white">{item.product_name}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{item.warehouse_name}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-gray-900 dark:text-white text-right font-medium">{item.quantity}</td>
                        <td className="border border-gray-300 dark:border-gray-600 px-4 py-2 text-sm text-gray-600 dark:text-gray-400">{item.unit}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Notes */}
          {receipt.notes && (
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Notes</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{receipt.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Created by: {receipt.created_by} | Generated on {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button variant="ghost" onClick={handlePrint}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print
          </Button>
          <Button variant="primary" onClick={handleDownloadPDF}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF
          </Button>
        </div>
      </div>
    </Modal>
  );
}
