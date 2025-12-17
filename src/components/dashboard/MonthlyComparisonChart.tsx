import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useCurrency } from '@contexts/CurrencyContext';
import { formatCurrency } from '@utils/currency';

// Sample data - will be replaced with real data
// NOTE: All values are in USD (base currency) and will be converted for display
const data = [
  { month: 'Jan', revenue: 45000, cost: 32000, profit: 13000 },
  { month: 'Feb', revenue: 52000, cost: 35000, profit: 17000 },
  { month: 'Mar', revenue: 48000, cost: 34000, profit: 14000 },
  { month: 'Apr', revenue: 61000, cost: 38000, profit: 23000 },
  { month: 'May', revenue: 55000, cost: 36000, profit: 19000 },
  { month: 'Jun', revenue: 67000, cost: 42000, profit: 25000 },
  { month: 'Jul', revenue: 72000, cost: 45000, profit: 27000 },
  { month: 'Aug', revenue: 65000, cost: 41000, profit: 24000 },
  { month: 'Sep', revenue: 78000, cost: 48000, profit: 30000 },
  { month: 'Oct', revenue: 82000, cost: 50000, profit: 32000 },
  { month: 'Nov', revenue: 75000, cost: 46000, profit: 29000 },
  { month: 'Dec', revenue: 88000, cost: 52000, profit: 36000 },
];

interface MonthlyComparisonChartProps {
  data?: { month: string; revenue: number; cost: number; profit: number }[];
}

export function MonthlyComparisonChart({ data: propData }: MonthlyComparisonChartProps) {
  const chartData = propData || data;
  const { currency } = useCurrency();

  const formatCurrencyValue = (value: number) => {
    return formatCurrency(value, currency, true);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
          {payload.map((item: any, index: number) => (
            <p key={index} className="text-sm flex items-center gap-2">
              <span 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-600 dark:text-gray-400">{item.name}:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrencyValue(item.value)}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={350}>
      <ComposedChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
        <XAxis 
          dataKey="month" 
          tick={{ fontSize: 12 }}
          className="text-gray-600 dark:text-gray-400"
        />
        <YAxis 
          tick={{ fontSize: 12 }}
          tickFormatter={(value) => `$${(value / 1000)}k`}
          className="text-gray-600 dark:text-gray-400"
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          formatter={(value) => (
            <span className="text-gray-700 dark:text-gray-300 text-sm">{value}</span>
          )}
        />
        <Bar 
          dataKey="revenue" 
          name="Revenue"
          fill="#3b82f6" 
          radius={[4, 4, 0, 0]}
          opacity={0.8}
        />
        <Bar 
          dataKey="cost" 
          name="Cost"
          fill="#ef4444" 
          radius={[4, 4, 0, 0]}
          opacity={0.8}
        />
        <Line
          type="monotone"
          dataKey="profit"
          name="Profit"
          stroke="#10b981"
          strokeWidth={3}
          dot={{ fill: '#10b981', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
