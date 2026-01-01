import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Sample data - will be replaced with real data
const data = [
  { date: 'Week 1', inStock: 4000, lowStock: 200, outOfStock: 50 },
  { date: 'Week 2', inStock: 4200, lowStock: 180, outOfStock: 45 },
  { date: 'Week 3', inStock: 3800, lowStock: 250, outOfStock: 80 },
  { date: 'Week 4', inStock: 4500, lowStock: 150, outOfStock: 30 },
  { date: 'Week 5', inStock: 4800, lowStock: 120, outOfStock: 25 },
  { date: 'Week 6', inStock: 5200, lowStock: 100, outOfStock: 20 },
  { date: 'Week 7', inStock: 5000, lowStock: 130, outOfStock: 35 },
  { date: 'Week 8', inStock: 5500, lowStock: 90, outOfStock: 15 },
];

interface StockTrendChartProps {
  data?: { date: string; inStock: number; lowStock: number; outOfStock: number }[];
}

export function StockTrendChart({ data: propData }: StockTrendChartProps) {
  const chartData = propData || data;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
          {payload.map((item: any, index: number) => (
            <p key={index} className="text-sm flex items-center gap-2">
              <span 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-600 dark:text-gray-400">{item.name}:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {item.value.toLocaleString()}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData}>
        <defs>
          <linearGradient id="colorInStock" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorLowStock" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorOutOfStock" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12 }}
          className="text-gray-600 dark:text-gray-400"
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          className="text-gray-600 dark:text-gray-400"
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          formatter={(value) => (
            <span className="text-gray-700 dark:text-gray-300 text-sm">{value}</span>
          )}
        />
        <Area
          type="monotone"
          dataKey="inStock"
          name="In Stock"
          stroke="#10b981"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorInStock)"
        />
        <Area
          type="monotone"
          dataKey="lowStock"
          name="Low Stock"
          stroke="#f59e0b"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorLowStock)"
        />
        <Area
          type="monotone"
          dataKey="outOfStock"
          name="Out of Stock"
          stroke="#ef4444"
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#colorOutOfStock)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
