import { useState } from 'react';
import {
    StockMovement,
    CreateMovementData,
    createStockMovement,
    getStockMovements,
    getRecentMovements,
    MovementType
} from '@services/stockMovements.service';
import { useDemo } from '@contexts/DemoContext';
import { useToast } from '@components/common/Toast';

/**
 * Hook for creating and managing stock movements
 */
export function useStockMovements(filters?: {
    productId?: string;
    warehouseId?: string;
    movementType?: MovementType;
    limit?: number;
}) {
    const [movements, setMovements] = useState<StockMovement[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const { isDemoMode } = useDemo();
    const { showToast } = useToast();

    const fetchMovements = async () => {
        if (isDemoMode) {
            setMovements([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await getStockMovements(filters);
            setMovements(data);
        } catch (err) {
            setError(err as Error);
            console.error('Error fetching movements:', err);
        } finally {
            setLoading(false);
        }
    };

    const createMovement = async (movementData: CreateMovementData) => {
        if (isDemoMode) {
            showToast('Cannot create movements in demo mode', 'info');
            throw new Error('Cannot create movements in demo mode');
        }

        try {
            setLoading(true);
            setError(null);

            const movement = await createStockMovement(movementData);

            showToast('Stock movement created successfully', 'success');

            // Refresh movements list
            await fetchMovements();

            return movement;
        } catch (err) {
            const errorMessage = (err as Error).message || 'Failed to create stock movement';
            setError(err as Error);
            showToast(errorMessage, 'error');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        movements,
        loading,
        error,
        fetchMovements,
        createMovement,
    };
}

/**
 * Hook for getting recent movements (for activity feed)
 */
export function useRecentMovements(limit = 10) {
    const [movements, setMovements] = useState<StockMovement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const { isDemoMode } = useDemo();

    const fetchRecentMovements = async () => {
        if (isDemoMode) {
            setMovements([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const data = await getRecentMovements(limit);
            setMovements(data);
        } catch (err) {
            setError(err as Error);
            console.error('Error fetching recent movements:', err);
        } finally {
            setLoading(false);
        }
    };

    return {
        movements,
        loading,
        error,
        refetch: fetchRecentMovements,
    };
}
