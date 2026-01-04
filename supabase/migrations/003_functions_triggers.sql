-- Trayvorix Database Functions and Triggers
-- Migration 003: Automated Functions and Triggers

-- =====================================================
-- FUNCTION: Update timestamp
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--sql to create 
--functional changed 

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_warehouses_updated_at
    BEFORE UPDATE ON warehouses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at
    BEFORE UPDATE ON inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transfer_requests_updated_at
    BEFORE UPDATE ON transfer_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_adjustments_updated_at
    BEFORE UPDATE ON adjustments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FUNCTION: Create audit log entry
-- =====================================================
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO audit_logs (table_name, record_id, action, user_id, old_data, new_data)
        VALUES (TG_TABLE_NAME, OLD.id, 'delete', auth.uid(), row_to_json(OLD), '{}'::jsonb);
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO audit_logs (table_name, record_id, action, user_id, old_data, new_data)
        VALUES (TG_TABLE_NAME, NEW.id, 'update', auth.uid(), row_to_json(OLD), row_to_json(NEW));
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO audit_logs (table_name, record_id, action, user_id, new_data)
        VALUES (TG_TABLE_NAME, NEW.id, 'create', auth.uid(), row_to_json(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit triggers to key tables
CREATE TRIGGER audit_products
    AFTER INSERT OR UPDATE OR DELETE ON products
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_inventory
    AFTER INSERT OR UPDATE OR DELETE ON inventory
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_stock_movements
    AFTER INSERT OR UPDATE OR DELETE ON stock_movements
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_transfer_requests
    AFTER INSERT OR UPDATE OR DELETE ON transfer_requests
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_adjustments
    AFTER INSERT OR UPDATE OR DELETE ON adjustments
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- =====================================================
-- FUNCTION: Check inventory availability

-- =====================================================
CREATE OR REPLACE FUNCTION check_inventory_availability(
    p_product_id UUID,
    p_location_id UUID,
    p_quantity INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    available_qty INTEGER;
BEGIN
    SELECT (quantity - reserved_quantity)
    INTO available_qty
    FROM inventory
    WHERE product_id = p_product_id
    AND location_id = p_location_id;
    
    RETURN COALESCE(available_qty, 0) >= p_quantity;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Update inventory on stock movement

-- =====================================================
CREATE OR REPLACE FUNCTION update_inventory_on_movement()
RETURNS TRIGGER AS $$
BEGIN
    -- Decrease from location
    IF NEW.from_location_id IS NOT NULL THEN
        UPDATE inventory
        SET quantity = quantity - NEW.quantity
        WHERE product_id = NEW.product_id
        AND location_id = NEW.from_location_id
        AND (batch_id = NEW.batch_id OR (batch_id IS NULL AND NEW.batch_id IS NULL));
    END IF;
    
    -- Increase to location
    IF NEW.to_location_id IS NOT NULL THEN
        INSERT INTO inventory (product_id, location_id, batch_id, quantity)
        VALUES (NEW.product_id, NEW.to_location_id, NEW.batch_id, NEW.quantity)
        ON CONFLICT (product_id, location_id, batch_id)
        DO UPDATE SET quantity = inventory.quantity + NEW.quantity;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_inventory_on_movement
    AFTER INSERT ON stock_movements
    FOR EACH ROW
    EXECUTE FUNCTION update_inventory_on_movement();

-- =====================================================
-- FUNCTION: Create low stock notifications
-- =====================================================
CREATE OR REPLACE FUNCTION check_low_stock()
RETURNS TRIGGER AS $$
DECLARE
    product_record RECORD;
    total_qty INTEGER;
BEGIN
    -- Get product details and reorder point
    SELECT p.id, p.name, p.reorder_point
    INTO product_record
    FROM products p
    WHERE p.id = NEW.product_id;
    
    -- Calculate total quantity across all locations
    SELECT COALESCE(SUM(quantity), 0)
    INTO total_qty
    FROM inventory
    WHERE product_id = NEW.product_id;
    
    -- Create notification if below reorder point
    IF total_qty <= product_record.reorder_point THEN
        INSERT INTO notifications (user_id, type, title, message, metadata)
        SELECT 
            u.id,
            'low_stock',
            'Low Stock Alert',
            'Product "' || product_record.name || '" is below reorder point (' || total_qty || ' remaining)',
            jsonb_build_object('product_id', product_record.id, 'quantity', total_qty)
        FROM auth.users u
        WHERE u.raw_user_meta_data->>'role' IN ('admin', 'operator');
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_low_stock
    AFTER INSERT OR UPDATE ON inventory
    FOR EACH ROW
    EXECUTE FUNCTION check_low_stock();

-- =====================================================
-- FUNCTION: Check expiring batches
-- =====================================================
CREATE OR REPLACE FUNCTION check_expiring_batches()
RETURNS void AS $$
DECLARE
    batch_record RECORD;
BEGIN
    FOR batch_record IN
        SELECT b.id, b.batch_number, b.expiry_date, p.name as product_name, p.id as product_id
        FROM batches b
        JOIN products p ON b.product_id = p.id
        WHERE b.expiry_date <= CURRENT_DATE + INTERVAL '30 days'
        AND b.expiry_date >= CURRENT_DATE
    LOOP
        INSERT INTO notifications (user_id, type, title, message, metadata)
        SELECT 
            u.id,
            'expiring_batch',
            'Batch Expiring Soon',
            'Batch "' || batch_record.batch_number || '" of product "' || batch_record.product_name || '" expires on ' || batch_record.expiry_date,
            jsonb_build_object('batch_id', batch_record.id, 'product_id', batch_record.product_id, 'expiry_date', batch_record.expiry_date)
        FROM auth.users u
        WHERE u.raw_user_meta_data->>'role' IN ('admin', 'operator')
        ON CONFLICT DO NOTHING;
    END LOOP;
END;
$$ LANGUAGE plpgsql;
