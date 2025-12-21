import { supabase } from './supabase';

export interface InventoryItem {
  id: string;
  product_id: string;
  warehouse_id: string;
  location_id: string;
  quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  batch_id?: string;
  created_at: string;
  updated_at: string;
  products?: {
    id: string;
    name: string;
    sku: string;
    unit: string;
    reorder_point: number;
  };
  warehouses?: {
    id: string;
    name: string;
  };
  locations?: {
    id: string;
    name: string;
  };
}

export interface InventoryUpdate {
  product_id: string;
  warehouse_id: string;
  location_id: string;
  quantity_change: number;
  reason?: string;
  reference_id?: string;
  reference_type?: 'receipt' | 'delivery' | 'adjustment' | 'transfer';
}

/**
 * Get inventory for a specific product across all warehouses
 */
export async function getInventoryByProduct(productId: string) {
  const { data, error } = await supabase
    .from('inventory')
    .select(`
      *,
      products (id, name, sku, unit, reorder_point),
      warehouses (id, name),
      locations (id, name)
    `)
    .eq('product_id', productId);

  if (error) throw error;
  return data as InventoryItem[];
}

/**
 * Get inventory for a specific warehouse
 */
export async function getInventoryByWarehouse(warehouseId: string) {
  const { data, error } = await supabase
    .from('inventory')
    .select(`
      *,
      products (id, name, sku, unit, reorder_point),
      locations (id, name)
    `)
    .eq('warehouse_id', warehouseId)
    .order('quantity', { ascending: false });

  if (error) throw error;
  return data as InventoryItem[];
}

/**
 * Get all inventory items with low stock (quantity < reorder_point)
 */
export async function getLowStockItems() {
  const { data, error } = await supabase
    .from('inventory')
    .select(`
      *,
      products!inner (id, name, sku, unit, reorder_point),
      warehouses (id, name),
      locations (id, name)
    `)
    .lt('quantity', supabase.rpc('get_reorder_point'));

  if (error) {
    // Fallback: fetch all and filter client-side
    const { data: allData, error: allError } = await supabase
      .from('inventory')
      .select(`
        *,
        products (id, name, sku, unit, reorder_point),
        warehouses (id, name),
        locations (id, name)
      `);

    if (allError) throw allError;
    
    const lowStock = (allData as InventoryItem[]).filter(
      item => item.products && item.quantity < item.products.reorder_point
    );
    
    return lowStock;
  }

  return data as InventoryItem[];
}

/**
 * Get total inventory value across all warehouses
 */
export async function getTotalInventoryValue() {
  // This would ideally use a database function, but for now we'll calculate client-side
  const { data, error } = await supabase
    .from('inventory')
    .select(`
      quantity,
      products (id, name)
    `);

  if (error) throw error;

  // In a real implementation, you'd have product prices and calculate:
  // SUM(quantity * unit_price)
  // For now, return a placeholder
  return {
    totalValue: 0,
    totalItems: data?.reduce((sum, item) => sum + item.quantity, 0) || 0,
  };
}

/**
 * Update inventory quantity (used by stock movements)
 * This should be called within a transaction
 */
export async function updateInventoryQuantity(update: InventoryUpdate) {
  const { product_id, warehouse_id, location_id, quantity_change } = update;

  // Check if inventory record exists
  const { data: existing, error: fetchError } = await supabase
    .from('inventory')
    .select('*')
    .eq('product_id', product_id)
    .eq('warehouse_id', warehouse_id)
    .eq('location_id', location_id)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    // PGRST116 = no rows returned, which is fine
    throw fetchError;
  }

  if (existing) {
    // Update existing inventory
    const newQuantity = existing.quantity + quantity_change;
    
    if (newQuantity < 0) {
      throw new Error('Insufficient inventory. Cannot reduce below zero.');
    }

    const { data, error } = await supabase
      .from('inventory')
      .update({
        quantity: newQuantity,
        available_quantity: newQuantity - existing.reserved_quantity,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } else {
    // Create new inventory record
    if (quantity_change < 0) {
      throw new Error('Cannot create inventory with negative quantity');
    }

    const { data, error } = await supabase
      .from('inventory')
      .insert({
        product_id,
        warehouse_id,
        location_id,
        quantity: quantity_change,
        reserved_quantity: 0,
        available_quantity: quantity_change,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

/**
 * Check if sufficient stock is available for a delivery
 */
export async function checkStockAvailability(
  productId: string,
  warehouseId: string,
  locationId: string,
  requiredQuantity: number
): Promise<{ available: boolean; currentQuantity: number; availableQuantity: number }> {
  const { data, error } = await supabase
    .from('inventory')
    .select('quantity, reserved_quantity, available_quantity')
    .eq('product_id', productId)
    .eq('warehouse_id', warehouseId)
    .eq('location_id', locationId)
    .single();

  if (error) {
    return {
      available: false,
      currentQuantity: 0,
      availableQuantity: 0,
    };
  }

  return {
    available: data.available_quantity >= requiredQuantity,
    currentQuantity: data.quantity,
    availableQuantity: data.available_quantity,
  };
}

/**
 * Reserve inventory for a delivery (during picking phase)
 */
export async function reserveInventory(
  productId: string,
  warehouseId: string,
  locationId: string,
  quantity: number
) {
  const { data: existing, error: fetchError } = await supabase
    .from('inventory')
    .select('*')
    .eq('product_id', productId)
    .eq('warehouse_id', warehouseId)
    .eq('location_id', locationId)
    .single();

  if (fetchError) throw fetchError;

  const newReserved = existing.reserved_quantity + quantity;
  const newAvailable = existing.quantity - newReserved;

  if (newAvailable < 0) {
    throw new Error('Insufficient available inventory to reserve');
  }

  const { data, error } = await supabase
    .from('inventory')
    .update({
      reserved_quantity: newReserved,
      available_quantity: newAvailable,
      updated_at: new Date().toISOString(),
    })
    .eq('id', existing.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Release reserved inventory (if delivery is cancelled)
 */
export async function releaseReservedInventory(
  productId: string,
  warehouseId: string,
  locationId: string,
  quantity: number
) {
  const { data: existing, error: fetchError } = await supabase
    .from('inventory')
    .select('*')
    .eq('product_id', productId)
    .eq('warehouse_id', warehouseId)
    .eq('location_id', locationId)
    .single();

  if (fetchError) throw fetchError;

  const newReserved = Math.max(0, existing.reserved_quantity - quantity);
  const newAvailable = existing.quantity - newReserved;

  const { data, error } = await supabase
    .from('inventory')
    .update({
      reserved_quantity: newReserved,
      available_quantity: newAvailable,
      updated_at: new Date().toISOString(),
    })
    .eq('id', existing.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
