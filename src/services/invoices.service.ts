import { supabase } from './supabase';
import type { Invoice, InvoiceItem } from '../types/database.types';

export interface InvoiceWithItems extends Invoice {
    invoice_items?: InvoiceItem[];
}

export interface CreateInvoiceData {
    invoice_type: 'purchase' | 'sales';
    reference_id?: string;
    reference_type?: 'receipt' | 'delivery';
    party_name: string;
    party_address?: string;
    party_phone?: string;
    party_email?: string;
    invoice_date: string;
    due_date: string;
    tax_rate?: number;
    discount_amount?: number;
    notes?: string;
    items: {
        product_id: string;
        description: string;
        quantity: number;
        unit_price: number;
        tax_rate?: number;
    }[];
}

/**
 * Fetch all invoices with optional filters
 */
export async function fetchInvoices(filters?: {
    invoice_type?: 'purchase' | 'sales';
    payment_status?: string;
    status?: string;
    search?: string;
}) {
    try {
        let query = supabase
            .from('invoices')
            .select('*')
            .order('created_at', { ascending: false });

        if (filters?.invoice_type) {
            query = query.eq('invoice_type', filters.invoice_type);
        }

        if (filters?.payment_status && filters.payment_status !== 'all') {
            query = query.eq('payment_status', filters.payment_status);
        }

        if (filters?.status && filters.status !== 'all') {
            query = query.eq('status', filters.status);
        }

        if (filters?.search) {
            query = query.or(
                `invoice_number.ilike.%${filters.search}%,party_name.ilike.%${filters.search}%`
            );
        }

        const { data, error } = await query;

        if (error) throw error;
        return data as Invoice[];
    } catch (error: any) {
        console.error('Error fetching invoices:', error.message);
        throw error;
    }
}

/**
 * Fetch a single invoice with its items
 */
export async function fetchInvoiceById(id: string): Promise<InvoiceWithItems | null> {
    try {
        const { data: invoice, error: invoiceError } = await supabase
            .from('invoices')
            .select('*')
            .eq('id', id)
            .single();

        if (invoiceError) throw invoiceError;

        const { data: items, error: itemsError } = await supabase
            .from('invoice_items')
            .select('*')
            .eq('invoice_id', id);

        if (itemsError) throw itemsError;

        return {
            ...invoice,
            invoice_items: items,
        } as InvoiceWithItems;
    } catch (error: any) {
        console.error('Error fetching invoice:', error.message);
        throw error;
    }
}

/**
 * Create a new invoice with items
 */
export async function createInvoice(data: CreateInvoiceData) {
    try {
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) throw new Error('User not authenticated');

        // Create invoice
        const { data: invoice, error: invoiceError } = await supabase
            .from('invoices')
            .insert({
                invoice_type: data.invoice_type,
                reference_id: data.reference_id,
                reference_type: data.reference_type,
                party_name: data.party_name,
                party_address: data.party_address,
                party_phone: data.party_phone,
                party_email: data.party_email,
                invoice_date: data.invoice_date,
                due_date: data.due_date,
                tax_rate: data.tax_rate || 18,
                discount_amount: data.discount_amount || 0,
                notes: data.notes,
                created_by: user.id,
            })
            .select()
            .single();

        if (invoiceError) throw invoiceError;

        // Create invoice items
        const itemsToInsert = data.items.map(item => ({
            invoice_id: invoice.id,
            product_id: item.product_id,
            description: item.description,
            quantity: item.quantity,
            unit_price: item.unit_price,
            tax_rate: item.tax_rate || data.tax_rate || 18,
        }));

        const { error: itemsError } = await supabase
            .from('invoice_items')
            .insert(itemsToInsert);

        if (itemsError) throw itemsError;

        return invoice as Invoice;
    } catch (error: any) {
        console.error('Error creating invoice:', error.message);
        throw error;
    }
}

/**
 * Update an existing invoice
 */
export async function updateInvoice(id: string, data: Partial<CreateInvoiceData>) {
    try {
        const { data: invoice, error } = await supabase
            .from('invoices')
            .update({
                party_name: data.party_name,
                party_address: data.party_address,
                party_phone: data.party_phone,
                party_email: data.party_email,
                invoice_date: data.invoice_date,
                due_date: data.due_date,
                tax_rate: data.tax_rate,
                discount_amount: data.discount_amount,
                notes: data.notes,
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return invoice as Invoice;
    } catch (error: any) {
        console.error('Error updating invoice:', error.message);
        throw error;
    }
}

/**
 * Delete an invoice (only if draft)
 */
export async function deleteInvoice(id: string) {
    try {
        const { error } = await supabase
            .from('invoices')
            .delete()
            .eq('id', id)
            .eq('status', 'draft');

        if (error) throw error;
    } catch (error: any) {
        console.error('Error deleting invoice:', error.message);
        throw error;
    }
}

/**
 * Update payment status and paid amount
 */
export async function updatePayment(id: string, paidAmount: number) {
    try {
        const { data, error } = await supabase
            .from('invoices')
            .update({ paid_amount: paidAmount })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Invoice;
    } catch (error: any) {
        console.error('Error updating payment:', error.message);
        throw error;
    }
}

/**
 * Generate invoice from receipt
 */
export async function generateInvoiceFromReceipt(receiptId: string) {
    try {
        // Fetch receipt data
        const { data: receipt, error: receiptError } = await supabase
            .from('receipts')
            .select('*, receipt_items(*, products(*))')
            .eq('id', receiptId)
            .single();

        if (receiptError) throw receiptError;

        // Fetch receipt items separately if needed
        const { data: receiptItems, error: itemsError } = await supabase
            .from('receipt_items')
            .select('*, products(*)')
            .eq('receipt_id', receiptId);

        if (itemsError) throw itemsError;

        // Create invoice data
        const invoiceData: CreateInvoiceData = {
            invoice_type: 'purchase',
            reference_id: receiptId,
            reference_type: 'receipt',
            party_name: receipt.supplier_name,
            invoice_date: new Date().toISOString().split('T')[0],
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days
            notes: `Generated from receipt #${receipt.id.slice(0, 8)}`,
            items: receiptItems.map(item => ({
                product_id: item.product_id,
                description: item.products?.name || 'Product',
                quantity: item.quantity_received || item.quantity_expected,
                unit_price: 100, // Default price - should be updated
                tax_rate: 18,
            })),
        };

        return await createInvoice(invoiceData);
    } catch (error: any) {
        console.error('Error generating invoice from receipt:', error.message);
        throw error;
    }
}

/**
 * Generate invoice from delivery
 */
export async function generateInvoiceFromDelivery(deliveryId: string) {
    try {
        // Fetch delivery data
        const { data: delivery, error: deliveryError } = await supabase
            .from('deliveries')
            .select('*')
            .eq('id', deliveryId)
            .single();

        if (deliveryError) throw deliveryError;

        // Fetch delivery items
        const { data: deliveryItems, error: itemsError } = await supabase
            .from('delivery_items')
            .select('*, products(*)')
            .eq('delivery_id', deliveryId);

        if (itemsError) throw itemsError;

        // Create invoice data
        const invoiceData: CreateInvoiceData = {
            invoice_type: 'sales',
            reference_id: deliveryId,
            reference_type: 'delivery',
            party_name: delivery.customer_name,
            party_address: delivery.delivery_address,
            party_phone: delivery.phone,
            invoice_date: new Date().toISOString().split('T')[0],
            due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days
            notes: `Generated from delivery #${delivery.id.slice(0, 8)}`,
            items: deliveryItems.map(item => ({
                product_id: item.product_id,
                description: item.products?.name || 'Product',
                quantity: item.quantity_shipped || item.quantity_ordered,
                unit_price: 150, // Default price - should be updated
                tax_rate: 18,
            })),
        };

        return await createInvoice(invoiceData);
    } catch (error: any) {
        console.error('Error generating invoice from delivery:', error.message);
        throw error;
    }
}

/**
 * Calculate invoice totals
 */
export function calculateInvoiceTotals(
    items: { quantity: number; unit_price: number; tax_rate: number }[],
    discountAmount: number = 0
) {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    const taxAmount = items.reduce(
        (sum, item) => sum + (item.quantity * item.unit_price * item.tax_rate) / 100,
        0
    );
    const total = subtotal + taxAmount - discountAmount;

    return {
        subtotal: Math.round(subtotal * 100) / 100,
        taxAmount: Math.round(taxAmount * 100) / 100,
        total: Math.round(total * 100) / 100,
    };
}
