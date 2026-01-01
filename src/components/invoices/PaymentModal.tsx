import { useState, useEffect } from 'react';
import { Modal } from '@components/common/Modal';
import { Button } from '@components/common/Button';
import { Input } from '@components/common/Input';
import { useToast } from '@components/common/Toast';
import { updatePayment } from '@services/invoices.service';
import type { Invoice } from '../../types/database.types';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    invoice: Invoice | null;
    onSuccess: () => void;
}

export function PaymentModal({ isOpen, onClose, invoice, onSuccess }: PaymentModalProps) {
    const [paymentAmount, setPaymentAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        if (invoice) {
            const remaining = invoice.total_amount - invoice.paid_amount;
            setPaymentAmount(remaining.toString());
        }
    }, [invoice]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!invoice) return;

        const amount = parseFloat(paymentAmount);
        if (isNaN(amount) || amount <= 0) {
            showToast('Please enter a valid amount', 'error');
            return;
        }

        const newPaidAmount = invoice.paid_amount + amount;
        if (newPaidAmount > invoice.total_amount) {
            showToast('Payment amount exceeds invoice total', 'error');
            return;
        }

        try {
            setLoading(true);
            await updatePayment(invoice.id, newPaidAmount);
            showToast('Payment recorded successfully', 'success');
            onSuccess();
            onClose();
        } catch (error: any) {
            showToast(error.message || 'Failed to record payment', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!invoice) return null;

    const remaining = invoice.total_amount - invoice.paid_amount;
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Record Payment">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Invoice Summary */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Invoice Number:</span>
                        <span className="font-mono font-medium text-gray-900 dark:text-white">
                            {invoice.invoice_number}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Party:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{invoice.party_name}</span>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Total Amount:</span>
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {formatCurrency(invoice.total_amount)}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Already Paid:</span>
                            <span className="font-medium text-green-600 dark:text-green-400">
                                {formatCurrency(invoice.paid_amount)}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm font-bold">
                            <span className="text-gray-900 dark:text-white">Remaining:</span>
                            <span className="text-orange-600 dark:text-orange-400">
                                {formatCurrency(remaining)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Payment Amount Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Payment Amount
                    </label>
                    <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max={remaining}
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder="Enter payment amount"
                        required
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Maximum: {formatCurrency(remaining)}
                    </p>
                </div>

                {/* Quick Amount Buttons */}
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setPaymentAmount((remaining / 2).toFixed(2))}
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                        50%
                    </button>
                    <button
                        type="button"
                        onClick={() => setPaymentAmount(remaining.toFixed(2))}
                        className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    >
                        Full Amount
                    </button>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={onClose}
                        className="flex-1"
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        className="flex-1"
                        disabled={loading}
                    >
                        {loading ? 'Recording...' : 'Record Payment'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
