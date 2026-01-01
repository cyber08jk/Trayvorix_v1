-- Trayvorix Database Schema
-- Migration 007: Receipts and Deliveries Tables

-- =====================================================
-- RECEIPTS TABLE (Incoming Stock)
-- =====================================================

CREATE TABLE receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    supplier_name TEXT NOT NULL,
    reference_number TEXT,
    expected_date DATE NOT NULL,
    received_date DATE,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'waiting', 'ready', 'done', 'cancelled')),
    total_items INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Receipt Line Items (products in each receipt)
CREATE TABLE receipt_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_id UUID NOT NULL REFERENCES receipts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES batches(id) ON DELETE SET NULL,
    quantity_expected INTEGER NOT NULL,
    quantity_received INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- DELIVERIES TABLE (Outgoing Stock)
-- =====================================================

CREATE TABLE deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name TEXT NOT NULL,
    order_number TEXT,
    delivery_date DATE NOT NULL,
    delivery_address TEXT,
    phone TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'picking', 'packing', 'ready', 'shipped', 'delivered', 'cancelled')),
    total_items INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Delivery Line Items (products in each delivery)
CREATE TABLE delivery_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    delivery_id UUID NOT NULL REFERENCES deliveries(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
    batch_id UUID REFERENCES batches(id) ON DELETE SET NULL,
    quantity_ordered INTEGER NOT NULL,
    quantity_picked INTEGER DEFAULT 0,
    quantity_shipped INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

-- Receipts indexes
CREATE INDEX idx_receipts_supplier ON receipts(supplier_name);
CREATE INDEX idx_receipts_status ON receipts(status);
CREATE INDEX idx_receipts_expected_date ON receipts(expected_date);
CREATE INDEX idx_receipts_created_by ON receipts(created_by);
CREATE INDEX idx_receipt_items_receipt ON receipt_items(receipt_id);
CREATE INDEX idx_receipt_items_product ON receipt_items(product_id);

-- Deliveries indexes
CREATE INDEX idx_deliveries_customer ON deliveries(customer_name);
CREATE INDEX idx_deliveries_status ON deliveries(status);
CREATE INDEX idx_deliveries_delivery_date ON deliveries(delivery_date);
CREATE INDEX idx_deliveries_created_by ON deliveries(created_by);
CREATE INDEX idx_delivery_items_delivery ON delivery_items(delivery_id);
CREATE INDEX idx_delivery_items_product ON delivery_items(product_id);

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at timestamp for receipts
CREATE OR REPLACE FUNCTION update_receipts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER receipts_updated_at
    BEFORE UPDATE ON receipts
    FOR EACH ROW
    EXECUTE FUNCTION update_receipts_updated_at();

-- Auto-update updated_at timestamp for deliveries
CREATE OR REPLACE FUNCTION update_deliveries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER deliveries_updated_at
    BEFORE UPDATE ON deliveries
    FOR EACH ROW
    EXECUTE FUNCTION update_deliveries_updated_at();

-- Auto-update total_items count for receipts
CREATE OR REPLACE FUNCTION update_receipt_total_items()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE receipts
    SET total_items = (
        SELECT COUNT(*)
        FROM receipt_items
        WHERE receipt_id = COALESCE(NEW.receipt_id, OLD.receipt_id)
    )
    WHERE id = COALESCE(NEW.receipt_id, OLD.receipt_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER receipt_items_count
    AFTER INSERT OR DELETE ON receipt_items
    FOR EACH ROW
    EXECUTE FUNCTION update_receipt_total_items();

-- Auto-update total_items count for deliveries
CREATE OR REPLACE FUNCTION update_delivery_total_items()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE deliveries
    SET total_items = (
        SELECT COUNT(*)
        FROM delivery_items
        WHERE delivery_id = COALESCE(NEW.delivery_id, OLD.delivery_id)
    )
    WHERE id = COALESCE(NEW.delivery_id, OLD.delivery_id);
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER delivery_items_count
    AFTER INSERT OR DELETE ON delivery_items
    FOR EACH ROW
    EXECUTE FUNCTION update_delivery_total_items();

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE receipts IS 'Incoming stock receipts from suppliers';
COMMENT ON TABLE receipt_items IS 'Line items for each receipt';
COMMENT ON TABLE deliveries IS 'Outgoing deliveries to customers';
COMMENT ON TABLE delivery_items IS 'Line items for each delivery';

COMMENT ON COLUMN receipts.status IS 'Receipt status: draft, waiting, ready, done, cancelled';
COMMENT ON COLUMN deliveries.status IS 'Delivery status: draft, picking, packing, ready, shipped, delivered, cancelled';
