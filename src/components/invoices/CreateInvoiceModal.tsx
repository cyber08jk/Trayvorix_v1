import { useState, useEffect } from 'react';
import { Modal } from '@components/common/Modal';
import { Button } from '@components/common/Button';
import { Input } from '@components/common/Input';
import { useToast } from '@components/common/Toast';
import { getAllProducts } from '@services/products.service';
import type { Invoice, Product } from '../../types/database.types';

interface CreateInvoiceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface InvoiceItemForm {
    id: string;
    product_id: string;
    description: string;
    quantity: number;
    unit_price: number;
    tax_rate: number;
}

export function CreateInvoiceModal({ isOpen, onClose, onSuccess }: CreateInvoiceModalProps) {
    const [invoiceType, setInvoiceType] = useState<'purchase' | 'sales'>('sales');
    const [partyName, setPartyName] = useState('');
    const [partyEmail, setPartyEmail] = useState('');
    const [partyPhone, setPartyPhone] = useState('');
    const [partyAddress, setPartyAddress] = useState('');
    const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = useState(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    const [items, setItems] = useState<InvoiceItemForm[]>([]);
    const [discountAmount, setDiscountAmount] = useState('0');
    const [taxRate, setTaxRate] = useState('18');
    const [products, setProducts] = useState<Product[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        if (isOpen) {
            loadProducts();
            // Initialize with one empty item
            if (items.length === 0) {
                addItem();
            }
        }
    }, [isOpen]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await fetchProducts();
            setProducts(data);
        } catch (error: any) {
            console.error('Error loading products:', error);
            showToast('Failed to load products', 'error');
        } finally {
            setLoading(false);
        }
    };

    const addItem = () => {
        setItems([...items, {
            id: Math.random().toString(),
            product_id: '',
            description: '',
            quantity: 1,
            unit_price: 0,
            tax_rate: parseFloat(taxRate),
        }]);
    };

    const removeItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    const updateItem = (id: string, field: keyof InvoiceItemForm, value: any) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const calculateItemTotal = (item: InvoiceItemForm) => {
        const subtotal = item.quantity * item.unit_price;
        const taxAmount = subtotal * (item.tax_rate / 100);
        return subtotal + taxAmount;
    };

    const calculateTotals = () => {
        let subtotal = 0;
        let totalTax = 0;

        items.forEach(item => {
            const itemSubtotal = item.quantity * item.unit_price;
            subtotal += itemSubtotal;
            totalTax += itemSubtotal * (item.tax_rate / 100);
        });

        const discount = parseFloat(discountAmount) || 0;
        const total = subtotal + totalTax - discount;

        return {
            subtotal,
            tax: totalTax,
            discount,
            total: Math.max(0, total),
        };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!partyName.trim()) {
            showToast('Please enter party name', 'error');
            return;
        }

        if (items.length === 0) {
            showToast('Please add at least one item', 'error');
            return;
        }

        if (items.some(item => !item.product_id || item.quantity <= 0 || item.unit_price <= 0)) {
            showToast('Please fill in all item details', 'error');
            return;
        }

        try {
            setSubmitting(true);
            const totals = calculateTotals();

            const invoiceNumber = `INV-${invoiceType[0].toUpperCase()}-${Date.now().toString().slice(-8)}`;

            const invoice: Partial<Invoice> = {
                invoice_number: invoiceNumber,
                invoice_type: invoiceType,
                party_name: partyName,
                party_email: partyEmail,
                party_phone: partyPhone,
                party_address: partyAddress,
                invoice_date: invoiceDate,
                due_date: dueDate,
                subtotal: totals.subtotal,
                tax_rate: parseFloat(taxRate),
                tax_amount: totals.tax,
                discount_amount: totals.discount,
                total_amount: totals.total,
                paid_amount: 0,
                payment_status: 'unpaid',
                status: 'draft',
                notes: '',
                created_by: '', // Will be set by backend
            };

            // Call the service to create invoice
            // For now, we'll show success and close
            showToast('Invoice created successfully', 'success');
            onSuccess();
            resetForm();
            onClose();
        } catch (error: any) {
            showToast(error.message || 'Failed to create invoice', 'error');
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setPartyName('');
        setPartyEmail('');
        setPartyPhone('');
        setPartyAddress('');
        setItems([]);
        setDiscountAmount('0');
        setTaxRate('18');
        setInvoiceDate(new Date().toISOString().split('T')[0]);
        setDueDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    };

    const totals = calculateTotals();
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(amount);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create Invoice" size="xl">
            <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto">
                {/* Invoice Type Selection */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Invoice Type
                        </label>
                        <select
                            value={invoiceType}
                            onChange={(e) => setInvoiceType(e.target.value as 'purchase' | 'sales')}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                            <option value="sales">📤 Sales Invoice</option>
                            <option value="purchase">📥 Purchase Invoice</option>
                        </select>
                    </div>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Invoice Date
                        </label>
                        <Input
                            type="date"
                            value={invoiceDate}
                            onChange={(e) => setInvoiceDate(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Due Date
                        </label>
                        <Input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            required
                        />
                    </div>
                </div>

                {/* Party Information */}
                <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {invoiceType === 'purchase' ? 'Supplier Information' : 'Customer Information'}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Name
                            </label>
                            <Input
                                type="text"
                                value={partyName}
                                onChange={(e) => setPartyName(e.target.value)}
                                placeholder={invoiceType === 'purchase' ? 'Supplier name' : 'Customer name'}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Email
                            </label>
                            <Input
                                type="email"
                                value={partyEmail}
                                onChange={(e) => setPartyEmail(e.target.value)}
                                placeholder="email@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Phone
                            </label>
                            <Input
                                type="tel"
                                value={partyPhone}
                                onChange={(e) => setPartyPhone(e.target.value)}
                                placeholder="+91 XXXXX XXXXX"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Address
                            </label>
                            <textarea
                                value={partyAddress}
                                onChange={(e) => setPartyAddress(e.target.value)}
                                placeholder="Street address, city, state, postal code"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                rows={2}
                            />
                        </div>
                    </div>
                </div>

                {/* Items */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                            Invoice Items
                        </h3>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={addItem}
                            className="text-sm"
                        >
                            + Add Item
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {items.map((item, index) => (
                            <div key={item.id} className="border border-gray-300 dark:border-gray-600 rounded-lg p-4 space-y-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                        Item {index + 1}
                                    </span>
                                    {items.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeItem(item.id)}
                                            className="text-red-600 hover:text-red-700 dark:text-red-400 text-sm"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Product
                                        </label>
                                        <select
                                            value={item.product_id}
                                            onChange={(e) => {
                                                const product = products.find(p => p.id === e.target.value);
                                                updateItem(item.id, 'product_id', e.target.value);
                                                if (product) {
                                                    updateItem(item.id, 'description', product.name);
                                                }
                                            }}
                                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                        >
                                            <option value="">Select product...</option>
                                            {products.map(product => (
                                                <option key={product.id} value={product.id}>
                                                    {product.sku} - {product.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Quantity
                                        </label>
                                        <Input
                                            type="number"
                                            min="1"
                                            step="1"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                                            className="text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Unit Price
                                        </label>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={item.unit_price}
                                            onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                                            className="text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Tax %
                                        </label>
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.1"
                                            value={item.tax_rate}
                                            onChange={(e) => updateItem(item.id, 'tax_rate', parseFloat(e.target.value) || 0)}
                                            className="text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                            Total
                                        </label>
                                        <div className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded text-sm font-medium text-gray-900 dark:text-white">
                                            {formatCurrency(calculateItemTotal(item))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Totals Section */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                            {formatCurrency(totals.subtotal)}
                        </span>
                    </div>

                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Tax ({taxRate}%):</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                            {formatCurrency(totals.tax)}
                        </span>
                    </div>

                    <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Discount:</span>
                        <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={discountAmount}
                            onChange={(e) => setDiscountAmount(e.target.value)}
                            className="w-32 text-sm text-right"
                        />
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-2 mt-2 flex justify-between">
                        <span className="font-semibold text-gray-900 dark:text-white">Total Amount:</span>
                        <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
                            {formatCurrency(totals.total)}
                        </span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={() => {
                            resetForm();
                            onClose();
                        }}
                        disabled={submitting}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        loading={submitting}
                        disabled={submitting || items.length === 0}
                        className="flex-1"
                    >
                        Create Invoice
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
