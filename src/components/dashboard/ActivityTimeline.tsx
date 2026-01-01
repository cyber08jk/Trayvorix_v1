import { useState, useEffect } from 'react';
import { supabase } from '@services/supabase';
import { Loading } from '@components/common/Loading';

interface Activity {
  id: string;
  type: 'movement' | 'transfer' | 'adjustment' | 'product';
  description: string;
  user: string;
  timestamp: string;
  icon: React.ReactElement;
  color: string;
}

export function ActivityTimeline() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('activity_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stock_movements' }, () => {
        fetchActivities();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transfer_requests' }, () => {
        fetchActivities();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchActivities = async () => {
    try {
      // Fetch recent stock movements
      const { data: movements } = await supabase
        .from('stock_movements')
        .select('id, type, quantity, created_at, user_id, products(name)')
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch recent transfer requests
      const { data: transfers } = await supabase
        .from('transfer_requests')
        .select('id, status, quantity, created_at, requested_by, products(name)')
        .order('created_at', { ascending: false })
        .limit(5);

      // Combine and format activities
      const formattedActivities: Activity[] = [];

      movements?.forEach((movement: any) => {
        formattedActivities.push({
          id: movement.id,
          type: 'movement',
          description: `${movement.type} ${movement.quantity} units of ${movement.products?.name || 'Unknown'}`,
          user: movement.user_id?.substring(0, 8) || 'System',
          timestamp: movement.created_at,
          icon: getMovementIcon(movement.type),
          color: getMovementColor(movement.type),
        });
      });

      transfers?.forEach((transfer: any) => {
        formattedActivities.push({
          id: transfer.id,
          type: 'transfer',
          description: `Transfer request ${transfer.status} for ${transfer.quantity} units of ${transfer.products?.name || 'Unknown'}`,
          user: transfer.requested_by?.substring(0, 8) || 'System',
          timestamp: transfer.created_at,
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 5a1 1 0 100 2h5.586l-1.293 1.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L13.586 5H8z" />
            </svg>
          ),
          color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20',
        });
      });

      // Sort by timestamp
      formattedActivities.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setActivities(formattedActivities.slice(0, 15));
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'receive':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
          </svg>
        );
      case 'ship':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case 'receive':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      case 'ship':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'adjust':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-700';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loading size="md" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>No recent activity</p>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {activities.map((activity, index) => (
          <li key={activity.id}>
            <div className="relative pb-8">
              {index !== activities.length - 1 && (
                <span
                  className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                  aria-hidden="true"
                />
              )}
              <div className="relative flex items-start space-x-3">
                <div className="relative">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-gray-800 ${activity.color}`}>
                    {activity.icon}
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <div>
                    <p className="text-sm text-gray-900 dark:text-white">
                      {activity.description}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      by {activity.user} • {formatTimestamp(activity.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
