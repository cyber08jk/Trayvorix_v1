import { Modal } from '@components/common/Modal';
import { Button } from '@components/common/Button';
import type { Invoice } from '../../types/database.types';

interface InvoiceDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoice: Invoice | null;
}

export function InvoiceDetailsModal({ isOpen, onClose, invoice }: InvoiceDetailsModalProps) {
    if (!invoice) return null;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const getPaymentStatusColor = (status: string) => {
        const colors = {
            paid: 'text-green-600 dark:text-green-400',
            partial: 'text-yellow-600 dark:text-yellow-400',
            unpaid: 'text-gray-600 dark:text-gray-400',
            overdue: 'text-red-600 dark:text-red-400',
        };
        return colors[status as keyof typeof colors] || colors.unpaid;
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Invoice Details">
            <div className="space-y-6">
                {/* Header Section */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {invoice.invoice_number}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {invoice.invoice_type === 'purchase' ? '📥 Purchase Invoice' : '📤 Sales Invoice'}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-600 dark:text-gray-400">Invoice Date</p>
                            <p className="font-semibold text-gray-900 dark:text-white">
                                {formatDate(invoice.invoice_date)}
                            </p>
                        </div>
                    </div>

                    {/* Payment Status Badge */}
                    <div className="flex items-center gap-4">
                        <span className={`text-lg font-bold ${getPaymentStatusColor(invoice.payment_status)}`}>
                            {invoice.payment_status.toUpperCase()}
                        </span>
                        {invoice.payment_status === 'overdue' && (
                            <span className="text-xs bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 px-2 py-1 rounded-full">
                                Overdue since {formatDate(invoice.due_date)}
                            </span>
                        )}
                    </div>
                </div>

                {/* Party Information */}
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            {invoice.invoice_type === 'purchase' ? 'Supplier' : 'Customer'}
                        </h4>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                            <p className="font-semibold text-gray-900 dark:text-white">{invoice.party_name}</p>
                            {invoice.party_address && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">{invoice.party_address}</p>
                            )}
                            {invoice.party_phone && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">📞 {invoice.party_phone}</p>
                            )}
                            {invoice.party_email && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">✉️ {invoice.party_email}</p>
                            )}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Invoice Details
                        </h4>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Due Date:</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {formatDate(invoice.due_date)}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Tax Rate:</span>
                                <span className="font-medium text-gray-900 dark:text-white">{invoice.tax_rate}%</span>
                            </div>
                            {invoice.reference_type && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Reference:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {invoice.reference_type} #{invoice.reference_id?.slice(0, 8)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Amount Breakdown */}
                <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        Amount Breakdown
                    </h4>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                                {formatCurrency(invoice.subtotal)}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                                Tax ({invoice.tax_rate}%):
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                                {formatCurrency(invoice.tax_amount)}
                            </span>
                        </div>
                        {invoice.discount_amount > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Discount:</span>
                                <span className="font-medium text-red-600 dark:text-red-400">
                                    - {formatCurrency(invoice.discount_amount)}
                                </span>
                            </div>
                        )}
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                            <div className="flex justify-between">
                                <span className="font-bold text-gray-900 dark:text-white">Total Amount:</span>
                                <span className="font-bold text-lg text-gray-900 dark:text-white">
                                    {formatCurrency(invoice.total_amount)}
                                </span>
                            </div>
                        </div>
                        {invoice.paid_amount > 0 && (
                            <>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600 dark:text-gray-400">Paid Amount:</span>
                                    <span className="font-semibold text-green-600 dark:text-green-400">
                                        {formatCurrency(invoice.paid_amount)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-bold text-gray-900 dark:text-white">Outstanding:</span>
                                    <span className="font-bold text-lg text-orange-600 dark:text-orange-400">
                                        {formatCurrency(invoice.total_amount - invoice.paid_amount)}
                                    </span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Notes */}
                {invoice.notes && (
                    <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Notes</h4>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                                {invoice.notes}
                            </p>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                        variant="secondary"
                        onClick={onClose}
                        className="flex-1"
                    >
                        Close
                    </Button>
                    <Button
                        variant="primary"
                        onClick={() => window.print()}
                        className="flex-1"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Print
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
