-- Trayvorix Database Schema
-- Migration 011: Invoices RLS Policies

-- =====================================================
-- ENABLE RLS
-- =====================================================

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- INVOICES POLICIES
-- =====================================================

-- Admin: Full access to all invoices
CREATE POLICY "Admins can view all invoices"
    ON invoices FOR SELECT
    TO authenticated
    USING (is_admin());

CREATE POLICY "Admins can insert invoices"
    ON invoices FOR INSERT
    TO authenticated
    WITH CHECK (is_admin());

CREATE POLICY "Admins can update invoices"
    ON invoices FOR UPDATE
    TO authenticated
    USING (is_admin());

CREATE POLICY "Admins can delete invoices"
    ON invoices FOR DELETE
    TO authenticated
    USING (is_admin());

-- Operator: Can view and create invoices
CREATE POLICY "Operators can view all invoices"
    ON invoices FOR SELECT
    TO authenticated
    USING (is_operator_or_admin());

CREATE POLICY "Operators can insert invoices"
    ON invoices FOR INSERT
    TO authenticated
    WITH CHECK (is_operator_or_admin());

CREATE POLICY "Operators can update draft invoices"
    ON invoices FOR UPDATE
    TO authenticated
    USING (
        is_operator_or_admin() AND
        status = 'draft'
    );

-- Auditor: Read-only access
CREATE POLICY "Auditors can view all invoices"
    ON invoices FOR SELECT
    TO authenticated
    USING (get_user_role() = 'auditor');

-- Vendor: Can only view their own purchase invoices
CREATE POLICY "Vendors can view their purchase invoices"
    ON invoices FOR SELECT
    TO authenticated
    USING (
        get_user_role() = 'vendor' AND
        invoice_type = 'purchase' AND
        created_by = auth.uid()
    );

-- =====================================================
-- INVOICE ITEMS POLICIES
-- =====================================================

-- Admin: Full access to all invoice items
CREATE POLICY "Admins can view all invoice items"
    ON invoice_items FOR SELECT
    TO authenticated
    USING (is_admin());

CREATE POLICY "Admins can insert invoice items"
    ON invoice_items FOR INSERT
    TO authenticated
    WITH CHECK (is_admin());

CREATE POLICY "Admins can update invoice items"
    ON invoice_items FOR UPDATE
    TO authenticated
    USING (is_admin());

CREATE POLICY "Admins can delete invoice items"
    ON invoice_items FOR DELETE
    TO authenticated
    USING (is_admin());

-- Operator: Can manage items for draft invoices
CREATE POLICY "Operators can view all invoice items"
    ON invoice_items FOR SELECT
    TO authenticated
    USING (is_operator_or_admin());

CREATE POLICY "Operators can insert invoice items"
    ON invoice_items FOR INSERT
    TO authenticated
    WITH CHECK (
        is_operator_or_admin() AND
        EXISTS (
            SELECT 1 FROM invoices
            WHERE invoices.id = invoice_items.invoice_id
            AND invoices.status = 'draft'
        )
    );

CREATE POLICY "Operators can update items in draft invoices"
    ON invoice_items FOR UPDATE
    TO authenticated
    USING (
        is_operator_or_admin() AND
        EXISTS (
            SELECT 1 FROM invoices
            WHERE invoices.id = invoice_items.invoice_id
            AND invoices.status = 'draft'
        )
    );

CREATE POLICY "Operators can delete items from draft invoices"
    ON invoice_items FOR DELETE
    TO authenticated
    USING (
        is_operator_or_admin() AND
        EXISTS (
            SELECT 1 FROM invoices
            WHERE invoices.id = invoice_items.invoice_id
            AND invoices.status = 'draft'
        )
    );

-- Auditor: Read-only access
CREATE POLICY "Auditors can view all invoice items"
    ON invoice_items FOR SELECT
    TO authenticated
    USING (get_user_role() = 'auditor');

-- Vendor: Can view items from their invoices
CREATE POLICY "Vendors can view their invoice items"
    ON invoice_items FOR SELECT
    TO authenticated
    USING (
        get_user_role() = 'vendor' AND
        EXISTS (
            SELECT 1 FROM invoices
            WHERE invoices.id = invoice_items.invoice_id
            AND invoices.invoice_type = 'purchase'
            AND invoices.created_by = auth.uid()
        )
    );

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON POLICY "Admins can view all invoices" ON invoices IS 'Admins have full read access to all invoices';
COMMENT ON POLICY "Operators can view all invoices" ON invoices IS 'Operators can view all invoices';
COMMENT ON POLICY "Operators can update draft invoices" ON invoices IS 'Operators can only update invoices in draft status';
COMMENT ON POLICY "Auditors can view all invoices" ON invoices IS 'Auditors have read-only access to all invoices';
COMMENT ON POLICY "Vendors can view their purchase invoices" ON invoices IS 'Vendors can only view purchase invoices they created';
