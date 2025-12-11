import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// Sample data - will be replaced with real data
const data = [
  { metric: 'Capacity', warehouseA: 85, warehouseB: 70, warehouseC: 90 },
  { metric: 'Efficiency', warehouseA: 78, warehouseB: 85, warehouseC: 72 },
  { metric: 'Turnover', warehouseA: 92, warehouseB: 68, warehouseC: 80 },
  { metric: 'Accuracy', warehouseA: 95, warehouseB: 88, warehouseC: 92 },
  { metric: 'Fulfillment', warehouseA: 88, warehouseB: 92, warehouseC: 85 },
  { metric: 'Cost Control', warehouseA: 75, warehouseB: 82, warehouseC: 78 },
];

interface WarehouseRadarChartProps {
  data?: { metric: string; warehouseA: number; warehouseB: number; warehouseC: number }[];
}

export function WarehouseRadarChart({ data: propData }: WarehouseRadarChartProps) {
  const chartData = propData || data;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">{payload[0]?.payload?.metric}</p>
          {payload.map((item: any, index: number) => (
            <p key={index} className="text-sm flex items-center gap-2">
              <span 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-600 dark:text-gray-400">{item.name}:</span>
              <span className="font-medium text-gray-900 dark:text-white">{item.value}%</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={chartData}>
        <PolarGrid className="stroke-gray-200 dark:stroke-gray-700" />
        <PolarAngleAxis 
          dataKey="metric" 
          tick={{ fontSize: 11 }}
          className="text-gray-600 dark:text-gray-400"
        />
        <PolarRadiusAxis 
          angle={30} 
          domain={[0, 100]} 
          tick={{ fontSize: 10 }}
          className="text-gray-600 dark:text-gray-400"
        />
        <Tooltip content={<CustomTooltip />} />
        <Radar
          name="Warehouse A"
          dataKey="warehouseA"
          stroke="#3b82f6"
          fill="#3b82f6"
          fillOpacity={0.2}
          strokeWidth={2}
        />
        <Radar
          name="Warehouse B"
          dataKey="warehouseB"
          stroke="#10b981"
          fill="#10b981"
          fillOpacity={0.2}
          strokeWidth={2}
        />
        <Radar
          name="Warehouse C"
          dataKey="warehouseC"
          stroke="#f59e0b"
          fill="#f59e0b"
          fillOpacity={0.2}
          strokeWidth={2}
        />
        <Legend 
          formatter={(value) => (
            <span className="text-gray-700 dark:text-gray-300 text-sm">{value}</span>
          )}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
