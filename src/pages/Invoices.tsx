import { useState, useEffect } from 'react';
import { Card } from '@components/common/Card';
import { Button } from '@components/common/Button';
import { Input } from '@components/common/Input';
import { Table } from '@components/common/Table';
import { TableSkeleton } from '@components/common/Loading';
import { useToast } from '@components/common/Toast';
import { useDemo } from '@contexts/DemoContext';
import { CreateInvoiceModal } from '@components/invoices/CreateInvoiceModal';
import { sampleInvoices } from '@data/sampleData';
import { fetchInvoices } from '@services/invoices.service';
import type { Invoice } from '../types/database.types';

export function Invoices() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const { showToast } = useToast();
    const { isDemoMode } = useDemo();

    useEffect(() => {
        loadInvoices();
    }, [isDemoMode]);

    const loadInvoices = async () => {
        try {
            setLoading(true);

            if (isDemoMode) {
                setInvoices(sampleInvoices as Invoice[]);
            } else {
                const data = await fetchInvoices();
                setInvoices(data);
            }
        } catch (error: any) {
            console.error('Error fetching invoices:', error.message || error);
            showToast('Failed to load invoices', 'error');
            setInvoices([]);
        } finally {
            setLoading(false);
        }
    };

    const getPaymentStatusBadge = (status: string) => {
        const statusColors = {
            paid: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
            partial: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
            unpaid: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
            overdue: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
        };

        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status as keyof typeof statusColors]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const getStatusBadge = (status: string) => {
        const statusColors = {
            draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
            sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
            viewed: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
            paid: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
            cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
        };

        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status as keyof typeof statusColors]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const getTypeBadge = (type: string) => {
        const typeColors = {
            purchase: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400',
            sales: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400',
        };

        return (
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${typeColors[type as keyof typeof typeColors]}`}>
                {type === 'purchase' ? '📥 Purchase' : '📤 Sales'}
            </span>
        );
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const filteredInvoices = invoices.filter(invoice => {
        const matchesSearch =
            invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            invoice.party_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || invoice.invoice_type === typeFilter;
        const matchesPaymentStatus = paymentStatusFilter === 'all' || invoice.payment_status === paymentStatusFilter;
        const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;

        return matchesSearch && matchesType && matchesPaymentStatus && matchesStatus;
    });

    // Calculate summary metrics
    const totalAmount = filteredInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
    const paidAmount = filteredInvoices.reduce((sum, inv) => sum + inv.paid_amount, 0);
    const outstandingAmount = totalAmount - paidAmount;
    const overdueCount = filteredInvoices.filter(inv => inv.payment_status === 'overdue').length;

    const columns = [
        {
            key: 'invoice_number',
            header: 'Invoice #',
            render: (invoice: Invoice) => (
                <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                    {invoice.invoice_number}
                </span>
            ),
        },
        {
            key: 'invoice_type',
            header: 'Type',
            render: (invoice: Invoice) => getTypeBadge(invoice.invoice_type),
        },
        {
            key: 'party_name',
            header: 'Party Name',
            sortable: true,
            render: (invoice: Invoice) => (
                <div>
                    <div className="font-medium text-gray-900 dark:text-white">{invoice.party_name}</div>
                    {invoice.reference_type && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            From {invoice.reference_type} #{invoice.reference_id?.slice(0, 8)}
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: 'invoice_date',
            header: 'Date',
            render: (invoice: Invoice) => (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(invoice.invoice_date).toLocaleDateString()}
                </span>
            ),
        },
        {
            key: 'due_date',
            header: 'Due Date',
            render: (invoice: Invoice) => (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(invoice.due_date).toLocaleDateString()}
                </span>
            ),
        },
        {
            key: 'total_amount',
            header: 'Amount',
            render: (invoice: Invoice) => (
                <div className="text-right">
                    <div className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(invoice.total_amount)}
                    </div>
                    {invoice.paid_amount > 0 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            Paid: {formatCurrency(invoice.paid_amount)}
                        </div>
                    )}
                </div>
            ),
        },
        {
            key: 'payment_status',
            header: 'Payment',
            render: (invoice: Invoice) => getPaymentStatusBadge(invoice.payment_status),
        },
        {
            key: 'status',
            header: 'Status',
            render: (invoice: Invoice) => getStatusBadge(invoice.status),
        },
        {
            key: 'actions',
            header: 'Actions',
            render: (invoice: Invoice) => (
                <div className="flex gap-2">
                    <button
                        className="text-primary-600 hover:text-primary-700 dark:text-primary-400"
                        onClick={() => showToast('View invoice details', 'info')}
                        title="View Details"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </button>
                    {invoice.status === 'draft' && (
                        <button
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
                            onClick={() => showToast('Edit invoice', 'info')}
                            title="Edit"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                    )}
                    {invoice.payment_status !== 'paid' && (
                        <button
                            className="text-green-600 hover:text-green-700 dark:text-green-400"
                            onClick={() => showToast('Mark as paid', 'info')}
                            title="Mark as Paid"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Invoice Management
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Track purchase and sales invoices, payments, and outstanding amounts
                    </p>
                </div>
                <Button variant="primary" onClick={() => setIsCreateModalOpen(true)}>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    New Invoice
                </Button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Invoices</p>
                            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{filteredInvoices.length}</p>
                        </div>
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
                            <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Amount</p>
                            <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalAmount)}</p>
                        </div>
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Paid Amount</p>
                            <p className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(paidAmount)}</p>
                        </div>
                        <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </Card>

                <Card>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Outstanding</p>
                            <p className="mt-2 text-2xl font-bold text-orange-600 dark:text-orange-400">{formatCurrency(outstandingAmount)}</p>
                            {overdueCount > 0 && (
                                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{overdueCount} overdue</p>
                            )}
                        </div>
                        <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                            <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="lg:col-span-2">
                        <Input
                            type="text"
                            placeholder="Search by invoice # or party name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="all">All Types</option>
                            <option value="purchase">Purchase</option>
                            <option value="sales">Sales</option>
                        </select>
                    </div>
                    <div>
                        <select
                            value={paymentStatusFilter}
                            onChange={(e) => setPaymentStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="all">All Payments</option>
                            <option value="paid">Paid</option>
                            <option value="partial">Partial</option>
                            <option value="unpaid">Unpaid</option>
                            <option value="overdue">Overdue</option>
                        </select>
                    </div>
                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        >
                            <option value="all">All Status</option>
                            <option value="draft">Draft</option>
                            <option value="sent">Sent</option>
                            <option value="viewed">Viewed</option>
                            <option value="paid">Paid</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                </div>
            </Card>

            {/* Invoices Table */}
            <Card>
                {loading ? (
                    <TableSkeleton rows={5} columns={9} />
                ) : (
                    <Table
                        data={filteredInvoices}
                        columns={columns}
                        onRowClick={(invoice) => console.log('View invoice:', invoice)}
                        emptyMessage="No invoices found. Create your first invoice to get started."
                    />
                )}
            </Card>

            {/* Info Card */}
            <Card title="Invoice Management Guide" subtitle="Understanding the invoice workflow">
                <div className="prose dark:prose-invert max-w-none">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">📥 Purchase Invoices</h4>
                            <ul className="space-y-1 list-disc list-inside">
                                <li>Created for goods received from suppliers</li>
                                <li>Can be auto-generated from receipts</li>
                                <li>Track payments to vendors</li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">📤 Sales Invoices</h4>
                            <ul className="space-y-1 list-disc list-inside">
                                <li>Created for goods delivered to customers</li>
                                <li>Can be auto-generated from deliveries</li>
                                <li>Track payments from customers</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Create Invoice Modal */}
            <CreateInvoiceModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    loadInvoices();
                }}
            />
        </div>
    );
}
