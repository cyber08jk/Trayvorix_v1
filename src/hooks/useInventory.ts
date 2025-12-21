import { useState, useEffect } from 'react';
import {
    InventoryItem,
    getInventoryByProduct,
    getInventoryByWarehouse,
    getLowStockItems,
    checkStockAvailability,
    updateInventoryQuantity,
    InventoryUpdate
} from '@services/inventory.service';
import { useDemo } from '@contexts/DemoContext';

/**
 * Hook for managing inventory data
 */
export function useInventory(filters?: { productId?: string; warehouseId?: string }) {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const { isDemoMode } = useDemo();

    const fetchInventory = async () => {
        if (isDemoMode) {
            // In demo mode, return empty or sample data
            setInventory([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            let data: InventoryItem[];

            if (filters?.productId) {
                data = await getInventoryByProduct(filters.productId);
            } else if (filters?.warehouseId) {
                data = await getInventoryByWarehouse(filters.warehouseId);
            } else {
                // Get all inventory - this might be expensive, consider pagination
                data = [];
            }

            setInventory(data);
        } catch (err) {
            setError(err as Error);
            console.error('Error fetching inventory:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, [filters?.productId, filters?.warehouseId, isDemoMode]);

    const updateQuantity = async (update: InventoryUpdate) => {
        if (isDemoMode) {
            throw new Error('Cannot update inventory in demo mode');
        }

        try {
            await updateInventoryQuantity(update);
            await fetchInventory(); // Refresh data
        } catch (err) {
            throw err;
        }
    };

    const checkAvailability = async (
        productId: string,
        warehouseId: string,
        locationId: string,
        requiredQuantity: number
    ) => {
        if (isDemoMode) {
            return { available: true, currentQuantity: 1000, availableQuantity: 1000 };
        }

        return checkStockAvailability(productId, warehouseId, locationId, requiredQuantity);
    };

    return {
        inventory,
        loading,
        error,
        refetch: fetchInventory,
        updateQuantity,
        checkAvailability,
    };
}

/**
 * Hook for getting low stock items
 */
export function useLowStockItems() {
    const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const { isDemoMode } = useDemo();

    const fetchLowStock = async () => {
        if (isDemoMode) {
            setLowStockItems([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await getLowStockItems();
            setLowStockItems(data);
        } catch (err) {
            setError(err as Error);
            console.error('Error fetching low stock items:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLowStock();
    }, [isDemoMode]);

    return {
        lowStockItems,
        loading,
        error,
        refetch: fetchLowStock,
    };
}
