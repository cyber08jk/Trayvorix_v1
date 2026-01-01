import { supabase } from './supabase';
import { AuditLog } from '../types/database.types';

interface FetchAuditLogsOptions {
    page?: number;
    limit?: number;
}

interface FetchAuditLogsResult {
    data: AuditLog[];
    count: number;
}

export async function fetchAuditLogs({ page = 1, limit = 20 }: FetchAuditLogsOptions = {}): Promise<FetchAuditLogsResult> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    try {
        const { data, count, error } = await supabase
            .from('audit_logs')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to);

        if (error) {
            throw error;
        }

        return {
            data: (data as any[])?.map(item => ({
                id: item.id,
                tableName: item.table_name, // Map snake_case from DB to camelCase if needed, or adjust interface
                recordId: item.record_id,
                action: item.action,
                userId: item.user_id,
                oldData: item.old_data,
                newData: item.new_data,
                reason: item.reason,
                createdAt: item.created_at
            })) as AuditLog[],
            count: count || 0
        };
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        return { data: [], count: 0 };
    }
}
