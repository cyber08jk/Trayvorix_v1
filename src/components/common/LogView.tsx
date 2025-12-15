import { useEffect, useState } from 'react';
import { fetchLogs, LogEntry } from '../../services/logs';
import { useAuth } from '@hooks/useAuth';
import { Card } from './Card';

export function LogView() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchLogs(user.id)
        .then(setLogs)
        .finally(() => setLoading(false));
    }
  }, [user]);

  return (
    <Card>
      <h3 className="text-lg font-semibold mb-2">Change Log</h3>
      {loading ? (
        <div>Loading...</div>
      ) : logs.length === 0 ? (
        <div>No log entries found.</div>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {logs.map(log => (
            <li key={log.id} className="py-2 text-sm">
              <span className="font-medium">{log.action}:</span> {log.details}
              <span className="block text-xs text-gray-400">{new Date(log.created_at).toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
