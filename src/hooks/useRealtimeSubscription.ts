import { useEffect, useRef } from 'react';
import { supabase } from '@services/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

type SubscriptionCallback = (payload: any) => void;

/**
 * Generic hook for Supabase real-time subscriptions
 * Automatically handles cleanup on unmount
 */
export function useRealtimeSubscription(
    table: string,
    event: 'INSERT' | 'UPDATE' | 'DELETE' | '*',
    callback: SubscriptionCallback,
    filter?: string
) {
    const channelRef = useRef<RealtimeChannel | null>(null);


    useEffect(() => {
        // Create a unique channel name
        const channelName = `${table}_${event}_${Date.now()}`;

        // Subscribe to changes
        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes',
                {
                    event,
                    schema: 'public',
                    table,
                    filter,
                } as any,
                callback
            )
            .subscribe();

        channelRef.current = channel;

        // Cleanup on unmount
        return () => {
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current);
            }
        };
    }, [table, event, filter]);
}

/**
 * Hook for subscribing to inventory changes
 */
export function useInventorySubscription(callback: SubscriptionCallback, productId?: string) {
    const filter = productId ? `product_id=eq.${productId}` : undefined;
    useRealtimeSubscription('inventory', '*', callback, filter);
}

/**
 * Hook for subscribing to stock movement changes
 */
export function useStockMovementsSubscription(callback: SubscriptionCallback) {
    useRealtimeSubscription('stock_movements', 'INSERT', callback);
}

/**
 * Hook for subscribing to product changes
 */
export function useProductsSubscription(callback: SubscriptionCallback) {
    useRealtimeSubscription('products', '*', callback);
}

/**
 * Hook for subscribing to notification changes
 */
export function useNotificationsSubscription(callback: SubscriptionCallback, userId?: string) {
    const filter = userId ? `user_id=eq.${userId}` : undefined;
    useRealtimeSubscription('notifications', 'INSERT', callback, filter);
}
