import type { ReactNode } from 'react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  loading?: boolean;
}

export function KPICard({ title, value, icon, trend, color = 'blue', loading }: KPICardProps) {
  const gradientClasses = {
    blue: 'from-blue-500 via-blue-600 to-indigo-600',
    green: 'from-emerald-500 via-green-600 to-teal-600',
    yellow: 'from-amber-500 via-yellow-600 to-orange-600',
    red: 'from-rose-500 via-red-600 to-pink-600',
    purple: 'from-purple-500 via-violet-600 to-indigo-600',
  };

  const glowClasses = {
    blue: 'shadow-blue-500/50',
    green: 'shadow-green-500/50',
    yellow: 'shadow-yellow-500/50',
    red: 'shadow-red-500/50',
    purple: 'shadow-purple-500/50',
  };

  if (loading) {
    return (
      <div className="glass-card rounded-2xl p-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-4"></div>
            <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
          </div>
          <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative glass-card rounded-2xl p-6 overflow-hidden card-hover">
      {/* Animated Background Gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClasses[color]} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
      
      {/* Glow Effect on Hover */}
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${gradientClasses[color]} rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500 ${glowClasses[color]}`}></div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
              {title}
            </p>
            <p className="text-4xl font-black text-gray-900 dark:text-white mb-1 transition-transform duration-300 group-hover:scale-105">
              {value}
            </p>
            {trend && (
              <div className="flex items-center text-sm font-medium mt-2">
                <span
                  className={`flex items-center px-2 py-1 rounded-full ${
                    trend.isPositive
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}
                >
                  {trend.isPositive ? (
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  {Math.abs(trend.value)}%
                </span>
                <span className="text-gray-500 dark:text-gray-400 ml-2 text-xs">vs last month</span>
              </div>
            )}
          </div>
          
          {/* Premium Icon with Gradient */}
          <div className={`relative p-4 rounded-2xl bg-gradient-to-br ${gradientClasses[color]} shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-6`}>
            <div className="text-white">
              {icon}
            </div>
            {/* Icon Glow */}
            <div className={`absolute inset-0 bg-gradient-to-br ${gradientClasses[color]} rounded-2xl blur-md opacity-50`}></div>
          </div>
        </div>
        
        
        {/* Bottom Accent Line */}
        <div className={`h-1 w-0 group-hover:w-full bg-gradient-to-r ${gradientClasses[color]} rounded-full transition-all duration-500`}></div>
      </div>
    </div>
  );
}
