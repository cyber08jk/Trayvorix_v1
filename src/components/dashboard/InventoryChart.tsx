import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Sample data - will be replaced with real data
const data = [
  { name: 'Jan', value: 4000, target: 3800 },
  { name: 'Feb', value: 3000, target: 3200 },
  { name: 'Mar', value: 5000, target: 4500 },
  { name: 'Apr', value: 4500, target: 4800 },
  { name: 'May', value: 6000, target: 5500 },
  { name: 'Jun', value: 5500, target: 5800 },
];

export function InventoryChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
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
        <Line 
          type="monotone" 
          dataKey="value" 
          stroke="#3b82f6" 
          strokeWidth={2}
          name="Current Value"
          dot={{ fill: '#3b82f6', r: 4 }}
        />
        <Line 
          type="monotone" 
          dataKey="target" 
          stroke="#10b981" 
          strokeWidth={2}
          strokeDasharray="5 5"
          name="Target"
          dot={{ fill: '#10b981', r: 4 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
