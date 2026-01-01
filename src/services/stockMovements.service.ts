import { supabase } from './supabase';
import { updateInventoryQuantity } from './inventory.service';

export type MovementType = 'receive' | 'ship' | 'transfer' | 'adjust';
export type MovementStatus = 'pending' | 'completed' | 'cancelled';

export interface StockMovement {
    id: string;
    product_id: string;
    from_location_id?: string;
    to_location_id?: string;
    quantity: number;
    movement_type: MovementType;
    status: MovementStatus;
    reference_type?: 'receipt' | 'delivery' | 'adjustment' | 'transfer';
    reference_id?: string;
    notes?: string;
    created_by: string;
    created_at: string;
    products?: {
        id: string;
        name: string;
        sku: string;
        unit: string;
    };
    from_location?: {
        id: string;
        name: string;
        warehouse_id: string;
    };
    to_location?: {
        id: string;
        name: string;
        warehouse_id: string;
    };
}

export interface CreateMovementData {
    product_id: string;
    from_location_id?: string;
    to_location_id?: string;
    quantity: number;
    movement_type: MovementType;
    reference_type?: 'receipt' | 'delivery' | 'adjustment' | 'transfer';
    reference_id?: string;
    notes?: string;
    created_by: string;
}

/**
 * Create a stock movement and update inventory
 * This should be called within a transaction for data consistency
 */
export async function createStockMovement(movementData: CreateMovementData) {
    const { data: movement, error: movementError } = await supabase
        .from('stock_movements')
        .insert({
            ...movementData,
            status: 'completed',
        })
        .select(`
      *,
      products (id, name, sku, unit),
      from_location:locations!from_location_id (id, name, warehouse_id),
      to_location:locations!to_location_id (id, name, warehouse_id)
    `)
        .single();

    if (movementError) throw movementError;

    // Update inventory based on movement type
    try {
        if (movementData.movement_type === 'receive' && movementData.to_location_id) {
            // Get warehouse_id from location
            const { data: location } = await supabase
                .from('locations')
                .select('warehouse_id')
                .eq('id', movementData.to_location_id)
                .single();

            if (location) {
                await updateInventoryQuantity({
                    product_id: movementData.product_id,
                    warehouse_id: location.warehouse_id,
                    location_id: movementData.to_location_id,
                    quantity_change: movementData.quantity,
                    reason: 'receipt',
                    reference_id: movementData.reference_id,
                    reference_type: movementData.reference_type,
                });
            }
        } else if (movementData.movement_type === 'ship' && movementData.from_location_id) {
            // Get warehouse_id from location
            const { data: location } = await supabase
                .from('locations')
                .select('warehouse_id')
                .eq('id', movementData.from_location_id)
                .single();

            if (location) {
                await updateInventoryQuantity({
                    product_id: movementData.product_id,
                    warehouse_id: location.warehouse_id,
                    location_id: movementData.from_location_id,
                    quantity_change: -movementData.quantity,
                    reason: 'shipment',
                    reference_id: movementData.reference_id,
                    reference_type: movementData.reference_type,
                });
            }
        } else if (movementData.movement_type === 'transfer' && movementData.from_location_id && movementData.to_location_id) {
            // Decrease from source
            const { data: fromLocation } = await supabase
                .from('locations')
                .select('warehouse_id')
                .eq('id', movementData.from_location_id)
                .single();

            // Increase at destination
            const { data: toLocation } = await supabase
                .from('locations')
                .select('warehouse_id')
                .eq('id', movementData.to_location_id)
                .single();

            if (fromLocation && toLocation) {
                await updateInventoryQuantity({
                    product_id: movementData.product_id,
                    warehouse_id: fromLocation.warehouse_id,
                    location_id: movementData.from_location_id,
                    quantity_change: -movementData.quantity,
                    reason: 'transfer_out',
                    reference_id: movementData.reference_id,
                    reference_type: movementData.reference_type,
                });

                await updateInventoryQuantity({
                    product_id: movementData.product_id,
                    warehouse_id: toLocation.warehouse_id,
                    location_id: movementData.to_location_id,
                    quantity_change: movementData.quantity,
                    reason: 'transfer_in',
                    reference_id: movementData.reference_id,
                    reference_type: movementData.reference_type,
                });
            }
        } else if (movementData.movement_type === 'adjust') {
            // For adjustments, the quantity can be positive or negative
            const locationId = movementData.to_location_id || movementData.from_location_id;

            if (locationId) {
                const { data: location } = await supabase
                    .from('locations')
                    .select('warehouse_id')
                    .eq('id', locationId)
                    .single();

                if (location) {
                    await updateInventoryQuantity({
                        product_id: movementData.product_id,
                        warehouse_id: location.warehouse_id,
                        location_id: locationId,
                        quantity_change: movementData.quantity,
                        reason: 'adjustment',
                        reference_id: movementData.reference_id,
                        reference_type: movementData.reference_type,
                    });
                }
            }
        }
    } catch (inventoryError) {
        // If inventory update fails, we should ideally rollback the movement
        // For now, we'll mark it as failed
        await supabase
            .from('stock_movements')
            .update({ status: 'cancelled' })
            .eq('id', movement.id);

        throw inventoryError;
    }

    return movement as StockMovement;
}

/**
 * Get all stock movements with filters
 */
export async function getStockMovements(filters?: {
    productId?: string;
    warehouseId?: string;
    movementType?: MovementType;
    startDate?: string;
    endDate?: string;
    limit?: number;
}) {
    let query = supabase
        .from('stock_movements')
        .select(`
      *,
      products (id, name, sku, unit),
      from_location:locations!from_location_id (id, name, warehouse_id),
      to_location:locations!to_location_id (id, name, warehouse_id)
    `)
        .order('created_at', { ascending: false });

    if (filters?.productId) {
        query = query.eq('product_id', filters.productId);
    }

    if (filters?.movementType) {
        query = query.eq('movement_type', filters.movementType);
    }

    if (filters?.startDate) {
        query = query.gte('created_at', filters.startDate);
    }

    if (filters?.endDate) {
        query = query.lte('created_at', filters.endDate);
    }

    if (filters?.limit) {
        query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data as StockMovement[];
}

/**
 * Get recent stock movements (for activity feed)
 */
export async function getRecentMovements(limit = 10) {
    return getStockMovements({ limit });
}

/**
 * Get movements for a specific product
 */
export async function getMovementsByProduct(productId: string, limit = 50) {
    return getStockMovements({ productId, limit });
}

/**
 * Get movement statistics
 */
export async function getMovementStats(startDate?: string, endDate?: string) {
    let query = supabase
        .from('stock_movements')
        .select('movement_type, quantity, created_at')
        .eq('status', 'completed');

    if (startDate) {
        query = query.gte('created_at', startDate);
    }

    if (endDate) {
        query = query.lte('created_at', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    // Calculate statistics
    const stats = {
        totalReceived: 0,
        totalShipped: 0,
        totalTransferred: 0,
        totalAdjusted: 0,
        movementCount: data?.length || 0,
    };

    data?.forEach(movement => {
        switch (movement.movement_type) {
            case 'receive':
                stats.totalReceived += movement.quantity;
                break;
            case 'ship':
                stats.totalShipped += movement.quantity;
                break;
            case 'transfer':
                stats.totalTransferred += movement.quantity;
                break;
            case 'adjust':
                stats.totalAdjusted += Math.abs(movement.quantity);
                break;
        }
    });

    return stats;
}
