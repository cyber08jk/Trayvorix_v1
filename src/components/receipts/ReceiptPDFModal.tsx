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
                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }
                body { 
                  font-family: 'Segoe UI', Arial, sans-serif; 
                  padding: 40px;
                  background: white;
                  color: #000;
                  font-size: 14px;
                  line-height: 1.6;
                }
                .header { 
                  margin-bottom: 30px;
                  padding-bottom: 20px;
                  border-bottom: 3px solid #333;
                }
                .header h2 {
                  font-size: 28px;
                  font-weight: bold;
                  margin-bottom: 8px;
                  color: #000;
                }
                .header p {
                  font-size: 13px;
                  color: #555;
                }
                .status-badge { 
                  display: inline-block; 
                  padding: 6px 16px; 
                  border-radius: 4px; 
                  font-size: 11px; 
                  font-weight: bold;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
                }
                .status-done { background-color: #d1fae5; color: #065f46; border: 1px solid #065f46; }
                .status-waiting { background-color: #fef3c7; color: #92400e; border: 1px solid #92400e; }
                .status-ready { background-color: #dbeafe; color: #1e40af; border: 1px solid #1e40af; }
                .status-draft { background-color: #f3f4f6; color: #374151; border: 1px solid #374151; }
                .status-canceled { background-color: #fee; color: #991b1b; border: 1px solid #991b1b; }
                .info-grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 30px;
                  margin: 25px 0;
                }
                .info-section h3 {
                  font-size: 12px;
                  font-weight: 600;
                  text-transform: uppercase;
                  color: #666;
                  margin-bottom: 8px;
                  letter-spacing: 0.5px;
                }
                .info-section p {
                  font-size: 15px;
                  font-weight: 600;
                  color: #000;
                }
                table { 
                  width: 100%; 
                  border-collapse: collapse; 
                  margin: 25px 0;
                  border: 2px solid #000;
                }
                thead {
                  background-color: #f8f9fa;
                }
                th { 
                  border: 1px solid #333;
                  padding: 12px;
                  text-align: left;
                  font-size: 12px;
                  font-weight: 700;
                  text-transform: uppercase;
                  color: #000;
                  letter-spacing: 0.3px;
                }
                td { 
                  border: 1px solid #666;
                  padding: 10px 12px;
                  font-size: 13px;
                  color: #000;
                }
                tbody tr:nth-child(even) {
                  background-color: #f9f9f9;
                }
                .notes-section {
                  margin-top: 30px;
                  padding-top: 20px;
                  border-top: 2px solid #ddd;
                }
                .notes-section h3 {
                  font-size: 13px;
                  font-weight: 600;
                  margin-bottom: 10px;
                  color: #000;
                }
                .notes-section p {
                  font-size: 13px;
                  color: #333;
                  line-height: 1.8;
                }
                .footer {
                  margin-top: 40px;
                  padding-top: 20px;
                  border-top: 2px solid #ddd;
                  text-align: center;
                }
                .footer p {
                  font-size: 11px;
                  color: #666;
                }
                .text-right {
                  text-align: right;
                }
                .font-medium {
                  font-weight: 600;
                }
                @media print {
                  body { 
                    padding: 20px;
                    -webkit-print-color-adjust: exact;
                    print-color-adjust: exact;
                  }
                  table { page-break-inside: avoid; }
                  tr { page-break-inside: avoid; }
                }
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
        <div id="receipt-pdf-content" className="bg-white dark:bg-gray-800 p-8 rounded-lg border-2 border-gray-300 dark:border-gray-700 print:border-0 print:p-0">
          {/* Header */}
          <div className="header border-b-2 border-gray-300 dark:border-gray-700 pb-4 mb-6 print:border-black">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white print:text-black">
                  Receipt #{receipt.id.slice(0, 8)}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 print:text-gray-700">
                  Date: {new Date(receipt.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <span className={`status-badge ${getStatusClass(receipt.status)} px-3 py-1 rounded text-xs font-bold print:border print:border-black`}>
                {receipt.status.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Receipt Info */}
          <div className="info-grid grid grid-cols-2 gap-8 mb-6">
            <div className="info-section">
              <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide print:text-gray-700">Supplier Information</h3>
              <p className="text-base text-gray-900 dark:text-white font-semibold print:text-black">{receipt.supplier_name}</p>
            </div>
            <div className="info-section">
              <h3 className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wide print:text-gray-700">Total Items</h3>
              <p className="text-base text-gray-900 dark:text-white font-semibold print:text-black">{receipt.total_items} units</p>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 print:text-black">Items Received</h3>
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading items...</div>
            ) : (
              <table className="w-full border-collapse border-2 border-gray-400 dark:border-gray-600 print:border-black">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-700 print:bg-gray-100">
                    <th className="border border-gray-400 dark:border-gray-600 px-4 py-3 text-left text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide print:text-black print:border-black">#</th>
                    <th className="border border-gray-400 dark:border-gray-600 px-4 py-3 text-left text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide print:text-black print:border-black">Product</th>
                    <th className="border border-gray-400 dark:border-gray-600 px-4 py-3 text-left text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide print:text-black print:border-black">Warehouse</th>
                    <th className="border border-gray-400 dark:border-gray-600 px-4 py-3 text-right text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide print:text-black print:border-black">Quantity</th>
                    <th className="border border-gray-400 dark:border-gray-600 px-4 py-3 text-left text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wide print:text-black print:border-black">Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="border border-gray-400 dark:border-gray-600 px-4 py-8 text-center text-gray-500 print:border-black">
                        No items found
                      </td>
                    </tr>
                  ) : (
                    items.map((item, index) => (
                      <tr key={item.id} className="even:bg-gray-50 dark:even:bg-gray-800/50 print:even:bg-gray-50">
                        <td className="border border-gray-400 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-white font-medium print:text-black print:border-gray-600">{index + 1}</td>
                        <td className="border border-gray-400 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-white font-medium print:text-black print:border-gray-600">{item.product_name}</td>
                        <td className="border border-gray-400 dark:border-gray-600 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 print:text-gray-800 print:border-gray-600">{item.warehouse_name}</td>
                        <td className="border border-gray-400 dark:border-gray-600 px-4 py-3 text-sm text-gray-900 dark:text-white text-right font-bold print:text-black print:border-gray-600">{item.quantity}</td>
                        <td className="border border-gray-400 dark:border-gray-600 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 print:text-gray-800 print:border-gray-600">{item.unit}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Notes */}
          {receipt.notes && (
            <div className="notes-section mt-6 pt-6 border-t-2 border-gray-300 dark:border-gray-700 print:border-gray-400">
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 mb-3 print:text-black">Notes</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed print:text-gray-800">{receipt.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="footer mt-10 pt-6 border-t-2 border-gray-300 dark:border-gray-700 text-center print:border-gray-400">
            <p className="text-xs text-gray-600 dark:text-gray-400 print:text-gray-600">
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
