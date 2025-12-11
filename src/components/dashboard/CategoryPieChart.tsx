import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// Sample data - will be replaced with real data
const data = [
  { name: 'Electronics', value: 4500, color: '#3b82f6' },
  { name: 'Clothing', value: 3200, color: '#10b981' },
  { name: 'Food & Beverage', value: 2800, color: '#f59e0b' },
  { name: 'Furniture', value: 2100, color: '#8b5cf6' },
  { name: 'Others', value: 1400, color: '#ef4444' },
];

interface CategoryPieChartProps {
  data?: { name: string; value: number; color: string }[];
}

export function CategoryPieChart({ data: propData }: CategoryPieChartProps) {
  const chartData = propData || data;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white">{payload[0].name}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Quantity: <span className="font-medium">{payload[0].value.toLocaleString()}</span>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Percentage: <span className="font-medium">
              {((payload[0].value / chartData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
          animationBegin={0}
          animationDuration={1000}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          formatter={(value) => (
            <span className="text-gray-700 dark:text-gray-300 text-sm">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
