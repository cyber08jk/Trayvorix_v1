import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Sample data - will be replaced with real data
const data = [
  { name: 'Mon', received: 120, shipped: 80 },
  { name: 'Tue', received: 150, shipped: 100 },
  { name: 'Wed', received: 100, shipped: 120 },
  { name: 'Thu', received: 180, shipped: 90 },
  { name: 'Fri', received: 140, shipped: 110 },
  { name: 'Sat', received: 90, shipped: 70 },
  { name: 'Sun', received: 60, shipped: 50 },
];

export function MovementsChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis 
          dataKey="name" 
          className="text-xs text-gray-600 dark:text-gray-400"
        />
        <YAxis 
          className="text-xs text-gray-600 dark:text-gray-400"
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'var(--tooltip-bg, rgba(255, 255, 255, 0.95))',
            border: '1px solid var(--tooltip-border, #e5e7eb)',
            borderRadius: '0.5rem',
            color: 'var(--tooltip-text, #111827)',
          }}
          labelStyle={{ color: 'var(--tooltip-text, #111827)' }}
        />
        <Legend />
        <Bar 
          dataKey="received" 
          fill="#10b981" 
          name="Received"
          radius={[4, 4, 0, 0]}
        />
        <Bar 
          dataKey="shipped" 
          fill="#3b82f6" 
          name="Shipped"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
