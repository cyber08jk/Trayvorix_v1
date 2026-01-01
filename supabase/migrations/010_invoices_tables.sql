-- Trayvorix Database Schema
-- Migration 010: Invoices Tables

-- =====================================================
-- INVOICES TABLE
-- =====================================================

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number TEXT UNIQUE NOT NULL,
    invoice_type TEXT NOT NULL CHECK (invoice_type IN ('purchase', 'sales')),
    reference_id UUID,
    reference_type TEXT CHECK (reference_type IN ('receipt', 'delivery')),
    party_name TEXT NOT NULL,
    party_address TEXT,
    party_phone TEXT,
    party_email TEXT,
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    subtotal DECIMAL(15, 2) NOT NULL DEFAULT 0,
    tax_rate DECIMAL(5, 2) NOT NULL DEFAULT 18.00,
    tax_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    paid_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid', 'overdue')),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'paid', 'cancelled')),
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Invoice Line Items
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(15, 2) NOT NULL CHECK (unit_price >= 0),
    tax_rate DECIMAL(5, 2) NOT NULL DEFAULT 18.00,
    tax_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_type ON invoices(invoice_type);
CREATE INDEX idx_invoices_party_name ON invoices(party_name);
CREATE INDEX idx_invoices_payment_status ON invoices(payment_status);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_date ON invoices(invoice_date);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_reference ON invoices(reference_id, reference_type);
CREATE INDEX idx_invoices_created_by ON invoices(created_by);
CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);
CREATE INDEX idx_invoice_items_product ON invoice_items(product_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function to generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    next_number INTEGER;
    year_month TEXT;
    invoice_num TEXT;
BEGIN
    year_month := TO_CHAR(CURRENT_DATE, 'YYYY-MM');
    
    -- Get the next number for this month
    SELECT COALESCE(MAX(
        CAST(
            SUBSTRING(invoice_number FROM 'INV-[0-9]{4}-[0-9]{2}-([0-9]{4})') 
            AS INTEGER
        )
    ), 0) + 1
    INTO next_number
    FROM invoices
    WHERE invoice_number LIKE 'INV-' || year_month || '-%';
    
    -- Format: INV-YYYY-MM-XXXX
    invoice_num := 'INV-' || year_month || '-' || LPAD(next_number::TEXT, 4, '0');
    
    RETURN invoice_num;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate invoice item totals
CREATE OR REPLACE FUNCTION calculate_invoice_item_totals()
RETURNS TRIGGER AS $$
BEGIN
    -- Calculate tax amount
    NEW.tax_amount := ROUND((NEW.quantity * NEW.unit_price * NEW.tax_rate / 100), 2);
    
    -- Calculate total amount (quantity * unit_price + tax)
    NEW.total_amount := ROUND((NEW.quantity * NEW.unit_price) + NEW.tax_amount, 2);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update invoice totals from items
CREATE OR REPLACE FUNCTION update_invoice_totals()
RETURNS TRIGGER AS $$
DECLARE
    inv_id UUID;
    calc_subtotal DECIMAL(15, 2);
    calc_tax DECIMAL(15, 2);
    calc_total DECIMAL(15, 2);
    inv_discount DECIMAL(15, 2);
BEGIN
    -- Get the invoice_id from the trigger
    inv_id := COALESCE(NEW.invoice_id, OLD.invoice_id);
    
    -- Calculate totals from invoice items
    SELECT 
        COALESCE(SUM(quantity * unit_price), 0),
        COALESCE(SUM(tax_amount), 0),
        COALESCE(SUM(total_amount), 0)
    INTO calc_subtotal, calc_tax, calc_total
    FROM invoice_items
    WHERE invoice_id = inv_id;
    
    -- Get discount amount
    SELECT discount_amount INTO inv_discount
    FROM invoices
    WHERE id = inv_id;
    
    -- Update invoice totals
    UPDATE invoices
    SET 
        subtotal = calc_subtotal,
        tax_amount = calc_tax,
        total_amount = calc_total - COALESCE(inv_discount, 0),
        updated_at = NOW()
    WHERE id = inv_id;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to update payment status based on paid amount
CREATE OR REPLACE FUNCTION update_payment_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update payment status based on paid_amount vs total_amount
    IF NEW.paid_amount >= NEW.total_amount THEN
        NEW.payment_status := 'paid';
        NEW.status := 'paid';
    ELSIF NEW.paid_amount > 0 THEN
        NEW.payment_status := 'partial';
    ELSIF NEW.due_date < CURRENT_DATE AND NEW.paid_amount = 0 THEN
        NEW.payment_status := 'overdue';
    ELSE
        NEW.payment_status := 'unpaid';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp for invoices
CREATE OR REPLACE FUNCTION update_invoices_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_invoices_updated_at();

-- Auto-calculate invoice item totals
CREATE TRIGGER invoice_items_calculate_totals
    BEFORE INSERT OR UPDATE ON invoice_items
    FOR EACH ROW
    EXECUTE FUNCTION calculate_invoice_item_totals();

-- Auto-update invoice totals when items change
CREATE TRIGGER invoice_items_update_totals
    AFTER INSERT OR UPDATE OR DELETE ON invoice_items
    FOR EACH ROW
    EXECUTE FUNCTION update_invoice_totals();

-- Auto-update payment status
CREATE TRIGGER invoices_update_payment_status
    BEFORE INSERT OR UPDATE OF paid_amount, total_amount, due_date ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_payment_status();

-- Auto-generate invoice number if not provided
CREATE OR REPLACE FUNCTION set_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
        NEW.invoice_number := generate_invoice_number();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER invoices_set_number
    BEFORE INSERT ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION set_invoice_number();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE invoices IS 'Purchase and sales invoices for financial tracking';
COMMENT ON TABLE invoice_items IS 'Line items for each invoice';

COMMENT ON COLUMN invoices.invoice_type IS 'Type: purchase (from suppliers) or sales (to customers)';
COMMENT ON COLUMN invoices.reference_type IS 'Optional link to receipt or delivery';
COMMENT ON COLUMN invoices.payment_status IS 'Payment status: unpaid, partial, paid, overdue';
COMMENT ON COLUMN invoices.status IS 'Invoice status: draft, sent, viewed, paid, cancelled';
