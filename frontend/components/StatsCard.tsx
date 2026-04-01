'use client';

import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  iconColor?: string;
  loading?: boolean;
}

export default function StatsCard({
  label,
  value,
  icon: Icon,
  trend,
  iconColor = 'text-brand-500',
  loading = false,
}: StatsCardProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
        <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    );
  }

  const trendIsPositive = trend !== undefined && trend > 0;
  const trendIsNegative = trend !== undefined && trend < 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</span>
        <div className={`p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/50 ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-end gap-3">
        <span className="text-3xl font-bold text-gray-900 dark:text-white">{value}</span>
        {trend !== undefined && (
          <div
            className={`flex items-center gap-0.5 text-xs font-medium mb-1 ${
              trendIsPositive
                ? 'text-green-500'
                : trendIsNegative
                ? 'text-red-500'
                : 'text-gray-400'
            }`}
          >
            {trendIsPositive ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : trendIsNegative ? (
              <TrendingDown className="w-3.5 h-3.5" />
            ) : (
              <Minus className="w-3.5 h-3.5" />
            )}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
