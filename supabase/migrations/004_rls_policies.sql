-- Trayvorix Row Level Security Policies
-- Migration 004: RLS Configuration

-- =====================================================
-- HELPER FUNCTIONS FOR RLS
-- =====================================================

-- Function to get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
BEGIN
    RETURN COALESCE(
        (SELECT raw_user_meta_data->>'role' FROM auth.users WHERE id = auth.uid()),
        'operator'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role() = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user is operator or admin
CREATE OR REPLACE FUNCTION is_operator_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN get_user_role() IN ('admin', 'operator');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ENABLE RLS ON ALL TABLES
-- =====================================================

ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_barcodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- WAREHOUSES POLICIES
-- =====================================================

-- Admins: full access
CREATE POLICY "Admins can do everything on warehouses"
    ON warehouses FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

-- Operators: read and update
CREATE POLICY "Operators can view warehouses"
    ON warehouses FOR SELECT
    USING (is_operator_or_admin());

CREATE POLICY "Operators can update warehouses"
    ON warehouses FOR UPDATE
    USING (is_operator_or_admin())
    WITH CHECK (is_operator_or_admin());

-- Auditors and Vendors: read only
CREATE POLICY "Auditors and vendors can view warehouses"
    ON warehouses FOR SELECT
    USING (get_user_role() IN ('auditor', 'vendor'));

-- =====================================================
-- LOCATIONS POLICIES
-- =====================================================

CREATE POLICY "Admins full access to locations"
    ON locations FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY "Operators can manage locations"
    ON locations FOR ALL
    USING (is_operator_or_admin())
    WITH CHECK (is_operator_or_admin());

CREATE POLICY "Others can view locations"
    ON locations FOR SELECT
    USING (get_user_role() IN ('auditor', 'vendor'));

-- =====================================================
-- CATEGORIES POLICIES
-- =====================================================

CREATE POLICY "Admins full access to categories"
    ON categories FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY "Operators can manage categories"
    ON categories FOR ALL
    USING (is_operator_or_admin())
    WITH CHECK (is_operator_or_admin());

CREATE POLICY "Others can view categories"
    ON categories FOR SELECT
    USING (TRUE); -- Everyone can view categories

-- =====================================================
-- PRODUCTS POLICIES
-- =====================================================

CREATE POLICY "Admins full access to products"
    ON products FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY "Operators can manage products"
    ON products FOR ALL
    USING (is_operator_or_admin())
    WITH CHECK (is_operator_or_admin());

CREATE POLICY "Auditors can view all products"
    ON products FOR SELECT
    USING (get_user_role() = 'auditor');

-- Vendors can only view their products (based on metadata)
CREATE POLICY "Vendors can view their products"
    ON products FOR SELECT
    USING (
        get_user_role() = 'vendor' AND
        metadata->>'vendor_id' = auth.uid()::text
    );

-- =====================================================
-- PRODUCT BARCODES POLICIES
-- =====================================================

CREATE POLICY "Admins full access to barcodes"
    ON product_barcodes FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY "Operators can manage barcodes"
    ON product_barcodes FOR ALL
    USING (is_operator_or_admin())
    WITH CHECK (is_operator_or_admin());

CREATE POLICY "Others can view barcodes"
    ON product_barcodes FOR SELECT
    USING (TRUE);

-- =====================================================
-- BATCHES POLICIES
-- =====================================================

CREATE POLICY "Admins full access to batches"
    ON batches FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY "Operators can manage batches"
    ON batches FOR ALL
    USING (is_operator_or_admin())
    WITH CHECK (is_operator_or_admin());

CREATE POLICY "Others can view batches"
    ON batches FOR SELECT
    USING (get_user_role() IN ('auditor', 'vendor'));

-- =====================================================
-- INVENTORY POLICIES
-- =====================================================

CREATE POLICY "Admins full access to inventory"
    ON inventory FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY "Operators can manage inventory"
    ON inventory FOR ALL
    USING (is_operator_or_admin())
    WITH CHECK (is_operator_or_admin());

CREATE POLICY "Auditors can view inventory"
    ON inventory FOR SELECT
    USING (get_user_role() = 'auditor');

CREATE POLICY "Vendors can view their inventory"
    ON inventory FOR SELECT
    USING (
        get_user_role() = 'vendor' AND
        EXISTS (
            SELECT 1 FROM products p
            WHERE p.id = inventory.product_id
            AND p.metadata->>'vendor_id' = auth.uid()::text
        )
    );

-- =====================================================
-- STOCK MOVEMENTS POLICIES
-- =====================================================

CREATE POLICY "Admins full access to movements"
    ON stock_movements FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY "Operators can manage movements"
    ON stock_movements FOR ALL
    USING (is_operator_or_admin())
    WITH CHECK (is_operator_or_admin());

CREATE POLICY "Auditors can view movements"
    ON stock_movements FOR SELECT
    USING (get_user_role() = 'auditor');

-- =====================================================
-- TRANSFER REQUESTS POLICIES
-- =====================================================

CREATE POLICY "Admins full access to transfers"
    ON transfer_requests FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY "Operators can create and view transfers"
    ON transfer_requests FOR INSERT
    WITH CHECK (is_operator_or_admin());

CREATE POLICY "Operators can view all transfers"
    ON transfer_requests FOR SELECT
    USING (is_operator_or_admin());

CREATE POLICY "Operators can update their own draft transfers"
    ON transfer_requests FOR UPDATE
    USING (
        is_operator_or_admin() AND
        (requested_by = auth.uid() OR is_admin())
    )
    WITH CHECK (is_operator_or_admin());

CREATE POLICY "Auditors can view transfers"
    ON transfer_requests FOR SELECT
    USING (get_user_role() = 'auditor');

-- =====================================================
-- ADJUSTMENTS POLICIES
-- =====================================================

CREATE POLICY "Admins full access to adjustments"
    ON adjustments FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY "Operators can create adjustments"
    ON adjustments FOR INSERT
    WITH CHECK (is_operator_or_admin());

CREATE POLICY "Operators can view adjustments"
    ON adjustments FOR SELECT
    USING (is_operator_or_admin());

CREATE POLICY "Operators can update their pending adjustments"
    ON adjustments FOR UPDATE
    USING (
        is_operator_or_admin() AND
        (created_by = auth.uid() OR is_admin()) AND
        status = 'pending'
    )
    WITH CHECK (is_operator_or_admin());

CREATE POLICY "Auditors can view adjustments"
    ON adjustments FOR SELECT
    USING (get_user_role() = 'auditor');

-- =====================================================
-- AUDIT LOGS POLICIES
-- =====================================================

CREATE POLICY "Admins can view all audit logs"
    ON audit_logs FOR SELECT
    USING (is_admin());

CREATE POLICY "Auditors can view all audit logs"
    ON audit_logs FOR SELECT
    USING (get_user_role() = 'auditor');

CREATE POLICY "Operators can view audit logs"
    ON audit_logs FOR SELECT
    USING (is_operator_or_admin());

-- No one can modify audit logs (append-only via triggers)

-- =====================================================
-- NOTIFICATIONS POLICIES
-- =====================================================

CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications"
    ON notifications FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "System can create notifications"
    ON notifications FOR INSERT
    WITH CHECK (TRUE); -- Notifications created by triggers

-- =====================================================
-- TASKS POLICIES
-- =====================================================

CREATE POLICY "Admins full access to tasks"
    ON tasks FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY "Users can view tasks assigned to them"
    ON tasks FOR SELECT
    USING (assigned_to = auth.uid() OR created_by = auth.uid());

CREATE POLICY "Operators can create tasks"
    ON tasks FOR INSERT
    WITH CHECK (is_operator_or_admin());

CREATE POLICY "Users can update tasks assigned to them"
    ON tasks FOR UPDATE
    USING (assigned_to = auth.uid() OR created_by = auth.uid() OR is_admin())
    WITH CHECK (assigned_to = auth.uid() OR created_by = auth.uid() OR is_admin());

-- =====================================================
-- FILES POLICIES
-- =====================================================

CREATE POLICY "Admins full access to files"
    ON files FOR ALL
    USING (is_admin())
    WITH CHECK (is_admin());

CREATE POLICY "Operators can manage files"
    ON files FOR ALL
    USING (is_operator_or_admin())
    WITH CHECK (is_operator_or_admin());

CREATE POLICY "Auditors can view files"
    ON files FOR SELECT
    USING (get_user_role() = 'auditor');

CREATE POLICY "Users can view files they uploaded"
    ON files FOR SELECT
    USING (uploaded_by = auth.uid());
