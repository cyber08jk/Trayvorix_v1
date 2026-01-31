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
  initialEditMode?: boolean;
}

export function ReceiptPDFModal({ isOpen, onClose, receipt, initialEditMode = false }: ReceiptPDFModalProps) {
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(initialEditMode);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState<Receipt | null>(receipt);
  const { isDemoMode } = useDemo();

  useEffect(() => {
    if (receipt && isOpen) {
      fetchReceiptItems();
      setEditData(receipt);
      setIsEditing(initialEditMode);
    }
  }, [receipt, isOpen, isDemoMode, initialEditMode]);

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
        setLoading(false);
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

  const generatePrintHTML = () => {
    if (!receipt) return '';

    const statusColors: Record<string, string> = {
      done: 'background-color: #d1fae5; color: #065f46;',
      waiting: 'background-color: #fef3c7; color: #92400e;',
      ready: 'background-color: #dbeafe; color: #1e40af;',
      draft: 'background-color: #f3f4f6; color: #374151;',
      canceled: 'background-color: #fee; color: #991b1b;'
    };

    const itemsHTML = items.map((item, idx) => `
      <tr>
        <td style="border: 1px solid #999; padding: 8px; text-align: center;">${idx + 1}</td>
        <td style="border: 1px solid #999; padding: 8px;">${item.product_name}</td>
        <td style="border: 1px solid #999; padding: 8px;">${item.warehouse_name}</td>
        <td style="border: 1px solid #999; padding: 8px; text-align: right;">${item.quantity}</td>
        <td style="border: 1px solid #999; padding: 8px;">${item.unit}</td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Receipt ${receipt.id.slice(0, 8)}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
            }
            @page {
              size: A4;
              margin: 0.5in;
            }
            body {
              font-family: Arial, sans-serif;
              color: #333;
              line-height: 1.4;
              font-size: 13px;
            }
            .container {
              width: 100%;
              max-width: 800px;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              border-bottom: 2px solid #333;
              padding-bottom: 12px;
              margin-bottom: 16px;
            }
            .header-left h2 {
              font-size: 22px;
              margin-bottom: 4px;
            }
            .header-left p {
              font-size: 12px;
              color: #666;
            }
            .status-badge {
              display: inline-block;
              padding: 6px 12px;
              border-radius: 3px;
              font-weight: bold;
              font-size: 11px;
              text-transform: uppercase;
              ${statusColors[receipt.status] || statusColors.draft}
              border: 1px solid #999;
            }
            .info-row {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 16px;
              padding-bottom: 12px;
              border-bottom: 1px solid #ddd;
            }
            .info-item h3 {
              font-size: 11px;
              font-weight: bold;
              color: #666;
              text-transform: uppercase;
              margin-bottom: 4px;
            }
            .info-item p {
              font-size: 14px;
              font-weight: bold;
              color: #000;
            }
            .section-title {
              font-size: 13px;
              font-weight: bold;
              margin-top: 12px;
              margin-bottom: 8px;
              color: #000;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 16px;
            }
            th {
              background-color: #f0f0f0;
              border: 1px solid #999;
              padding: 8px;
              text-align: left;
              font-weight: bold;
              font-size: 12px;
              text-transform: uppercase;
            }
            td {
              border: 1px solid #999;
              padding: 8px;
            }
            tr:nth-child(even) {
              background-color: #f9f9f9;
            }
            .notes {
              margin-top: 12px;
              padding-top: 12px;
              border-top: 1px solid #ddd;
              font-size: 12px;
            }
            .footer {
              margin-top: 16px;
              padding-top: 12px;
              border-top: 1px solid #ddd;
              text-align: center;
              font-size: 10px;
              color: #999;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <!-- Header -->
            <div class="header">
              <div class="header-left">
                <h2>Receipt #${receipt.id.slice(0, 8)}</h2>
                <p>Date: ${new Date(receipt.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</p>
              </div>
              <div class="status-badge">${receipt.status.toUpperCase()}</div>
            </div>

            <!-- Info Section -->
            <div class="info-row">
              <div class="info-item">
                <h3>Supplier Information</h3>
                <p>${receipt.supplier_name}</p>
              </div>
              <div class="info-item">
                <h3>Total Items</h3>
                <p>${receipt.total_items} units</p>
              </div>
            </div>

            <!-- Items Table -->
            <div class="section-title">Items Received</div>
            <table>
              <thead>
                <tr>
                  <th style="width: 5%;">#</th>
                  <th style="width: 30%;">Product</th>
                  <th style="width: 25%;">Warehouse</th>
                  <th style="width: 20%; text-align: right;">Quantity</th>
                  <th style="width: 20%;">Unit</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHTML || '<tr><td colspan="5" style="text-align: center; padding: 16px;">No items found</td></tr>'}
              </tbody>
            </table>

            <!-- Notes -->
            ${receipt.notes ? `
              <div class="notes">
                <strong>Notes:</strong><br/>
                ${receipt.notes}
              </div>
            ` : ''}

            <!-- Footer -->
            <div class="footer">
              <p>Created by: ${receipt.created_by} | Generated on ${new Date().toLocaleDateString()}</p>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (printWindow) {
      printWindow.document.write(generatePrintHTML());
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  const handleSaveEdit = async () => {
    if (!editData || isDemoMode) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('receipts')
        .update({
          supplier_name: editData.supplier_name,
          status: editData.status,
          notes: editData.notes
        })
        .eq('id', editData.id);

      if (error) throw error;

      setIsEditing(false);
      // Refresh receipt data
      if (receipt) {
        fetchReceiptItems();
      }
    } catch (error) {
      console.error('Error saving receipt:', error);
      alert('Failed to save receipt. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditData(receipt);
    setIsEditing(false);
  };

  if (!receipt) return null;
  
  const displayData = editData || receipt;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Edit Receipt" : "Receipt Details"} size="xl">
      <div className="space-y-4">
        {isEditing ? (
          // Edit Mode
          <div className="bg-white p-6 rounded-lg border-2 border-blue-200 space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Supplier Name</label>
                <input
                  type="text"
                  value={(editData || receipt)?.supplier_name || ''}
                  onChange={(e) => setEditData({ ...editData!, supplier_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter supplier name"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Status</label>
                <select
                  value={(editData || receipt)?.status || 'draft'}
                  onChange={(e) => setEditData({ ...editData!, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="draft">Draft</option>
                  <option value="ready">Ready</option>
                  <option value="waiting">Waiting</option>
                  <option value="done">Done</option>
                  <option value="canceled">Canceled</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Notes</label>
                <textarea
                  value={(editData || receipt)?.notes || ''}
                  onChange={(e) => setEditData({ ...editData!, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter notes"
                />
              </div>

              <div className="pt-2 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  <span className="font-bold">Created by:</span> {receipt.created_by}
                </p>
                <p className="text-sm text-gray-600">
                  <span className="font-bold">Total Items:</span> {receipt.total_items}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button variant="secondary" onClick={handleCancel} disabled={saving}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSaveEdit} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>
        ) : (
          // View Mode
          <>
            {/* Preview */}
            <div className="bg-white dark:bg-white p-8 rounded-lg border-2 border-gray-200 shadow-lg max-h-96 overflow-y-auto">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-start pb-4 border-b-2 border-gray-300">
              <div>
                <h3 className="text-3xl font-bold text-gray-900">
                  Receipt #{receipt.id.slice(0, 8)}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Date: {new Date(receipt.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <span className={`px-3 py-1 rounded text-xs font-bold border ${
                receipt.status === 'done' ? 'bg-green-100 text-green-800 border-green-300' :
                receipt.status === 'waiting' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                receipt.status === 'ready' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                receipt.status === 'canceled' ? 'bg-red-100 text-red-800 border-red-300' :
                'bg-gray-100 text-gray-800 border-gray-300'
              }`}>
                {receipt.status.toUpperCase()}
              </span>
            </div>

            {/* Info Section */}
            <div className="grid grid-cols-2 gap-8 py-4 border-b border-gray-200">
              <div>
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Supplier</p>
                <p className="text-lg font-semibold text-gray-900">{receipt.supplier_name}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-600 uppercase tracking-wide mb-2">Total Items</p>
                <p className="text-lg font-semibold text-gray-900">{receipt.total_items} units</p>
              </div>
            </div>

            {/* Items Table */}
            <div>
              <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-3">Items Received</p>
              {loading ? (
                <p className="text-center text-gray-500 py-4">Loading...</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-100 border-b-2 border-gray-300">
                        <th className="border border-gray-300 px-3 py-2 text-left font-bold text-gray-700">#</th>
                        <th className="border border-gray-300 px-3 py-2 text-left font-bold text-gray-700">Product</th>
                        <th className="border border-gray-300 px-3 py-2 text-left font-bold text-gray-700">Warehouse</th>
                        <th className="border border-gray-300 px-3 py-2 text-right font-bold text-gray-700">Qty</th>
                        <th className="border border-gray-300 px-3 py-2 text-left font-bold text-gray-700">Unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="border border-gray-300 px-3 py-3 text-center text-gray-500">
                            No items
                          </td>
                        </tr>
                      ) : (
                        items.map((item, idx) => (
                          <tr key={item.id} className="even:bg-gray-50 hover:bg-gray-100">
                            <td className="border border-gray-300 px-3 py-2 text-gray-900">{idx + 1}</td>
                            <td className="border border-gray-300 px-3 py-2 font-medium text-gray-900">{item.product_name}</td>
                            <td className="border border-gray-300 px-3 py-2 text-gray-700">{item.warehouse_name}</td>
                            <td className="border border-gray-300 px-3 py-2 text-right font-semibold text-gray-900">{item.quantity}</td>
                            <td className="border border-gray-300 px-3 py-2 text-gray-700">{item.unit}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Notes */}
            {receipt.notes && (
              <div className="py-3 border-t border-gray-200">
                <p className="text-xs font-bold text-gray-700 uppercase mb-2">Notes</p>
                <p className="text-sm text-gray-700 leading-relaxed">{receipt.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="pt-3 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Created by: {receipt.created_by} | {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          {!isDemoMode && (
            <Button variant="secondary" onClick={() => setIsEditing(!isEditing)}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </Button>
          )}
          <Button variant="primary" onClick={handlePrint}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print & Save as PDF
          </Button>
        </div>
          </>
        )}
      </div>
    </Modal>
  );
}
