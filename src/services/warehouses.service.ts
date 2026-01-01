import { supabase } from './supabase';

export interface Warehouse {
    id: string;
    name: string;
    address: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
    capacity?: number;
    manager_id?: string;
    status: 'active' | 'inactive' | 'maintenance';
    created_at: string;
    updated_at?: string;
    total_inventory?: number;
    capacity_used?: number;
    capacity_percentage?: number;
}

export interface Location {
    id: string;
    warehouse_id: string;
    name: string;
    type: 'rack' | 'shelf' | 'bin' | 'floor' | 'zone';
    aisle?: string;
    rack?: string;
    shelf?: string;
    bin?: string;
    capacity?: number;
    created_at: string;
    warehouses?: {
        id: string;
        name: string;
    };
}

/**
 * Get all warehouses
 */
export async function getAllWarehouses() {
    const { data, error } = await supabase
        .from('warehouses')
        .select('*')
        .order('name');

    if (error) throw error;
    return data as Warehouse[];
}

/**
 * Get warehouse by ID with inventory summary
 */
export async function getWarehouseById(warehouseId: string) {
    const { data: warehouse, error } = await supabase
        .from('warehouses')
        .select('*')
        .eq('id', warehouseId)
        .single();

    if (error) throw error;

    // Get inventory summary
    const { data: inventoryData } = await supabase
        .from('inventory')
        .select('quantity')
        .eq('warehouse_id', warehouseId);

    const totalInventory = inventoryData?.reduce((sum, inv) => sum + inv.quantity, 0) || 0;
    const capacityUsed = warehouse.capacity ? (totalInventory / warehouse.capacity) * 100 : 0;

    return {
        ...warehouse,
        total_inventory: totalInventory,
        capacity_used: totalInventory,
        capacity_percentage: Math.min(capacityUsed, 100),
    } as Warehouse;
}

/**
 * Get all warehouses with inventory summary
 */
export async function getWarehousesWithInventory() {
    const warehouses = await getAllWarehouses();

    const warehousesWithInventory = await Promise.all(
        warehouses.map(async (warehouse) => {
            const { data: inventoryData } = await supabase
                .from('inventory')
                .select('quantity')
                .eq('warehouse_id', warehouse.id);

            const totalInventory = inventoryData?.reduce((sum, inv) => sum + inv.quantity, 0) || 0;
            const capacityUsed = warehouse.capacity ? (totalInventory / warehouse.capacity) * 100 : 0;

            return {
                ...warehouse,
                total_inventory: totalInventory,
                capacity_used: totalInventory,
                capacity_percentage: Math.min(capacityUsed, 100),
            };
        })
    );

    return warehousesWithInventory as Warehouse[];
}

/**
 * Get locations for a warehouse
 */
export async function getLocationsByWarehouse(warehouseId: string) {
    const { data, error } = await supabase
        .from('locations')
        .select(`
      *,
      warehouses (id, name)
    `)
        .eq('warehouse_id', warehouseId)
        .order('name');

    if (error) throw error;
    return data as Location[];
}

/**
 * Get all locations
 */
export async function getAllLocations() {
    const { data, error } = await supabase
        .from('locations')
        .select(`
      *,
      warehouses (id, name)
    `)
        .order('name');

    if (error) throw error;
    return data as Location[];
}

/**
 * Create a new warehouse
 */
export async function createWarehouse(warehouseData: Omit<Warehouse, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
        .from('warehouses')
        .insert(warehouseData)
        .select()
        .single();

    if (error) throw error;
    return data as Warehouse;
}

/**
 * Update warehouse
 */
export async function updateWarehouse(warehouseId: string, updates: Partial<Warehouse>) {
    const { data, error } = await supabase
        .from('warehouses')
        .update({
            ...updates,
            updated_at: new Date().toISOString(),
        })
        .eq('id', warehouseId)
        .select()
        .single();

    if (error) throw error;
    return data as Warehouse;
}

/**
 * Create a new location
 */
export async function createLocation(locationData: Omit<Location, 'id' | 'created_at'>) {
    const { data, error } = await supabase
        .from('locations')
        .insert(locationData)
        .select(`
      *,
      warehouses (id, name)
    `)
        .single();

    if (error) throw error;
    return data as Location;
}

/**
 * Get warehouse inventory details (products in warehouse)
 */
export async function getWarehouseInventoryDetails(warehouseId: string) {
    const { data, error } = await supabase
        .from('inventory')
        .select(`
      *,
      products (id, name, sku, unit, reorder_point),
      locations (id, name, type)
    `)
        .eq('warehouse_id', warehouseId)
        .order('quantity', { ascending: false });

    if (error) throw error;
    return data;
}

/**
 * Get warehouse capacity utilization
 */
export async function getWarehouseUtilization(warehouseId: string) {
    const warehouse = await getWarehouseById(warehouseId);

    const { data: productCount } = await supabase
        .from('inventory')
        .select('product_id', { count: 'exact', head: false })
        .eq('warehouse_id', warehouseId)
        .gt('quantity', 0);

    return {
        warehouseId: warehouse.id,
        warehouseName: warehouse.name,
        capacity: warehouse.capacity || 0,
        totalInventory: warehouse.total_inventory || 0,
        capacityUsed: warehouse.capacity_used || 0,
        capacityPercentage: warehouse.capacity_percentage || 0,
        uniqueProducts: productCount?.length || 0,
        status: warehouse.status,
    };
}
