-- Trayvorix Database Schema
-- Migration 008: RLS Policies for Receipts and Deliveries

-- =====================================================
-- ENABLE RLS
-- =====================================================

ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_items ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RECEIPTS POLICIES
-- =====================================================

-- Allow authenticated users to view all receipts
CREATE POLICY "Users can view all receipts"
    ON receipts FOR SELECT
    TO authenticated
    USING (true);

-- Allow authenticated users to create receipts
CREATE POLICY "Users can create receipts"
    ON receipts FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow users to update their own receipts
CREATE POLICY "Users can update receipts"
    ON receipts FOR UPDATE
    TO authenticated
    USING (created_by = auth.uid());

-- Allow users to delete their own receipts
CREATE POLICY "Users can delete receipts"
    ON receipts FOR DELETE
    TO authenticated
    USING (created_by = auth.uid());

-- =====================================================
-- RECEIPT ITEMS POLICIES
-- =====================================================

-- Allow authenticated users to view all receipt items
CREATE POLICY "Users can view all receipt items"
    ON receipt_items FOR SELECT
    TO authenticated
    USING (true);

-- Allow authenticated users to create receipt items
CREATE POLICY "Users can create receipt items"
    ON receipt_items FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow users to update receipt items for their receipts
CREATE POLICY "Users can update receipt items"
    ON receipt_items FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM receipts
            WHERE receipts.id = receipt_items.receipt_id
            AND receipts.created_by = auth.uid()
        )
    );

-- Allow users to delete receipt items for their receipts
CREATE POLICY "Users can delete receipt items"
    ON receipt_items FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM receipts
            WHERE receipts.id = receipt_items.receipt_id
            AND receipts.created_by = auth.uid()
        )
    );

-- =====================================================
-- DELIVERIES POLICIES
-- =====================================================

-- Allow authenticated users to view all deliveries
CREATE POLICY "Users can view all deliveries"
    ON deliveries FOR SELECT
    TO authenticated
    USING (true);

-- Allow authenticated users to create deliveries
CREATE POLICY "Users can create deliveries"
    ON deliveries FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow users to update their own deliveries
CREATE POLICY "Users can update deliveries"
    ON deliveries FOR UPDATE
    TO authenticated
    USING (created_by = auth.uid());

-- Allow users to delete their own deliveries
CREATE POLICY "Users can delete deliveries"
    ON deliveries FOR DELETE
    TO authenticated
    USING (created_by = auth.uid());

-- =====================================================
-- DELIVERY ITEMS POLICIES
-- =====================================================

-- Allow authenticated users to view all delivery items
CREATE POLICY "Users can view all delivery items"
    ON delivery_items FOR SELECT
    TO authenticated
    USING (true);

-- Allow authenticated users to create delivery items
CREATE POLICY "Users can create delivery items"
    ON delivery_items FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow users to update delivery items for their deliveries
CREATE POLICY "Users can update delivery items"
    ON delivery_items FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM deliveries
            WHERE deliveries.id = delivery_items.delivery_id
            AND deliveries.created_by = auth.uid()
        )
    );

-- Allow users to delete delivery items for their deliveries
CREATE POLICY "Users can delete delivery items"
    ON delivery_items FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM deliveries
            WHERE deliveries.id = delivery_items.delivery_id
            AND deliveries.created_by = auth.uid()
        )
    );

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON POLICY "Users can view all receipts" ON receipts IS 'All authenticated users can view receipts';
COMMENT ON POLICY "Users can create receipts" ON receipts IS 'All authenticated users can create receipts';
COMMENT ON POLICY "Users can update receipts" ON receipts IS 'Users can update their own receipts';
COMMENT ON POLICY "Users can delete receipts" ON receipts IS 'Users can delete their own receipts';

COMMENT ON POLICY "Users can view all deliveries" ON deliveries IS 'All authenticated users can view deliveries';
COMMENT ON POLICY "Users can create deliveries" ON deliveries IS 'All authenticated users can create deliveries';
COMMENT ON POLICY "Users can update deliveries" ON deliveries IS 'Users can update their own deliveries';
COMMENT ON POLICY "Users can delete deliveries" ON deliveries IS 'Users can delete their own deliveries';
