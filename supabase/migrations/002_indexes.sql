-- Trayvorix Database Indexes
-- Migration 002: Performance Indexes

-- Products indexes
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_name ON products(name);

-- Inventory indexes
CREATE INDEX idx_inventory_product ON inventory(product_id);
CREATE INDEX idx_inventory_location ON inventory(location_id);
CREATE INDEX idx_inventory_quantity ON inventory(quantity);
CREATE INDEX idx_inventory_batch ON inventory(batch_id);

-- Stock movements indexes
CREATE INDEX idx_movements_product_date ON stock_movements(product_id, created_at DESC);
CREATE INDEX idx_movements_type_date ON stock_movements(type, created_at DESC);
CREATE INDEX idx_movements_from_location ON stock_movements(from_location_id);
CREATE INDEX idx_movements_to_location ON stock_movements(to_location_id);
CREATE INDEX idx_movements_user ON stock_movements(user_id);

-- Transfer requests indexes
CREATE INDEX idx_transfers_status ON transfer_requests(status);
CREATE INDEX idx_transfers_requested_by ON transfer_requests(requested_by);
CREATE INDEX idx_transfers_product ON transfer_requests(product_id);

-- Adjustments indexes
CREATE INDEX idx_adjustments_status ON adjustments(status);
CREATE INDEX idx_adjustments_product ON adjustments(product_id);
CREATE INDEX idx_adjustments_created_by ON adjustments(created_by);

-- Audit logs indexes
CREATE INDEX idx_audit_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_user_date ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at DESC);

-- Notifications indexes
CREATE INDEX idx_notifications_user_read ON notifications(user_id, read, created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);

-- Tasks indexes
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to, status);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- Locations indexes
CREATE INDEX idx_locations_warehouse ON locations(warehouse_id);
CREATE INDEX idx_locations_type ON locations(type);

-- Batches indexes
CREATE INDEX idx_batches_product ON batches(product_id);
CREATE INDEX idx_batches_expiry ON batches(expiry_date);

-- Product barcodes indexes
CREATE INDEX idx_barcodes_product ON product_barcodes(product_id);
CREATE INDEX idx_barcodes_code ON product_barcodes(barcode);

-- Files indexes
CREATE INDEX idx_files_entity ON files(entity_type, entity_id);
CREATE INDEX idx_files_uploaded_by ON files(uploaded_by);

-- Categories indexes
CREATE INDEX idx_categories_parent ON categories(parent_id);
