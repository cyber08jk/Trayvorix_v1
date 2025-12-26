import { useState, useEffect } from 'react';
import { Card } from '@components/common/Card';
import { Table } from '@components/common/Table';
import { TableSkeleton } from '@components/common/Loading';

import { fetchAuditLogs } from '@services/audit.service';
import { AuditLog } from '../types/database.types';

export function AuditLogs() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    useEffect(() => {
        loadLogs();
    }, []);

    const loadLogs = async () => {
        setLoading(true);
        try {
            const { data } = await fetchAuditLogs({ page: 1, limit: 50 });
            setLogs(data);
        } catch (error) {
            console.error('Failed to load logs', error);
        } finally {
            setLoading(false);
        }
    };

    const getActionColor = (action: string) => {
        switch (action.toLowerCase()) {
            case 'create': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
            case 'update': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
            case 'delete': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const columns = [
        {
            key: 'created_at',
            header: 'Timestamp',
            render: (log: AuditLog) => (
                <span className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(log.createdAt).toLocaleString()}
                </span>
            ),
        },
        {
            key: 'action',
            header: 'Action',
            render: (log: AuditLog) => (
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getActionColor(log.action)}`}>
                    {log.action.toUpperCase()}
                </span>
            ),
        },
        {
            key: 'tableName',
            header: 'Resource',
            render: (log: AuditLog) => (
                <span className="font-mono text-sm text-gray-900 dark:text-white">
                    {log.tableName}
                </span>
            ),
        },
        {
            key: 'user',
            header: 'User ID',
            render: (log: AuditLog) => (
                <span className="text-xs text-gray-500 font-mono">
                    {log.userId.slice(0, 8)}...
                </span>
            ),
        },
        {
            key: 'actions',
            header: 'Details',
            render: (log: AuditLog) => (
                <button
                    onClick={(e) => { e.stopPropagation(); setSelectedLog(log); }}
                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium"
                >
                    View Changes
                </button>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Audit Logs</h1>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Track all system changes and security events
                </p>
            </div>

            <Card>
                {loading ? (
                    <TableSkeleton rows={8} columns={5} />
                ) : (
                    <Table
                        data={logs}
                        columns={columns}
                        onRowClick={(log) => setSelectedLog(log)}
                        emptyMessage="No audit logs found."
                    />
                )}
            </Card>

            {/* Detail Modal */}
            {selectedLog && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setSelectedLog(null)}></div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
                            <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="sm:flex sm:items-start">
                                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                                            Log Details: {selectedLog.action.toUpperCase()} {selectedLog.tableName}
                                        </h3>
                                        <div className="mt-4 space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                                                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Metadata</h4>
                                                    <p className="text-sm text-gray-700 dark:text-gray-300"><span className="font-medium">Date:</span> {new Date(selectedLog.createdAt).toLocaleString()}</p>
                                                    <p className="text-sm text-gray-700 dark:text-gray-300"><span className="font-medium">User:</span> {selectedLog.userId}</p>
                                                    <p className="text-sm text-gray-700 dark:text-gray-300"><span className="font-medium">Record ID:</span> {selectedLog.recordId}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {selectedLog.oldData && (
                                                    <div>
                                                        <h4 className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-2">Old Data</h4>
                                                        <pre className="bg-red-50 dark:bg-red-900/10 p-3 rounded-lg text-xs overflow-auto max-h-60 text-gray-800 dark:text-gray-200">
                                                            {JSON.stringify(selectedLog.oldData, null, 2)}
                                                        </pre>
                                                    </div>
                                                )}
                                                {selectedLog.newData && (
                                                    <div className={selectedLog.oldData ? '' : 'md:col-span-2'}>
                                                        <h4 className="text-xs font-semibold text-green-500 uppercase tracking-wider mb-2">New Data</h4>
                                                        <pre className="bg-green-50 dark:bg-green-900/10 p-3 rounded-lg text-xs overflow-auto max-h-60 text-gray-800 dark:text-gray-200">
                                                            {JSON.stringify(selectedLog.newData, null, 2)}
                                                        </pre>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                                <button
                                    type="button"
                                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                                    onClick={() => setSelectedLog(null)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
