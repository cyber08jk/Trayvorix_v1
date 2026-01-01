import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Sample data - will be replaced with real data
const data = [
  { name: 'Product A', sales: 4500, color: '#3b82f6' },
  { name: 'Product B', sales: 3800, color: '#10b981' },
  { name: 'Product C', sales: 3200, color: '#8b5cf6' },
  { name: 'Product D', sales: 2800, color: '#f59e0b' },
  { name: 'Product E', sales: 2400, color: '#ec4899' },
];

interface TopProductsChartProps {
  data?: { name: string; sales: number; color: string }[];
  title?: string;
}

export function TopProductsChart({ data: propData, title = 'Top 5 Products' }: TopProductsChartProps) {
  const chartData = propData || data;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Sales: <span className="font-medium text-blue-600 dark:text-blue-400">
              {payload[0].value.toLocaleString()} units
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-4">{title}</h4>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart 
          data={chartData} 
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" horizontal={true} vertical={false} />
          <XAxis 
            type="number" 
            tick={{ fontSize: 12 }}
            className="text-gray-600 dark:text-gray-400"
          />
          <YAxis 
            type="category" 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            width={80}
            className="text-gray-600 dark:text-gray-400"
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="sales" 
            radius={[0, 4, 4, 0]}
            animationDuration={1000}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
