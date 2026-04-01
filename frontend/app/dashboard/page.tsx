'use client';

import { useState, useEffect } from 'react';
import { Server, ShieldAlert, AlertTriangle, Activity, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { api } from '@/lib/api';
import type { FindingsStats } from '@/lib/api';
import { useUser } from '@/lib/UserContext';
import StatsCard from '@/components/StatsCard';
import Badge from '@/components/Badge';

export default function DashboardPage() {
  const { orgId } = useUser();
  const [stats, setStats] = useState<FindingsStats | null>(null);
  const [totalAssets, setTotalAssets] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orgId) return;

    async function fetchData() {
      setLoading(true);
      try {
        const [statsRes, assetsRes] = await Promise.allSettled([
          api.get<FindingsStats>('/findings/stats', { orgId: orgId! }),
          api.get<{ assets: unknown[]; pagination: { total: number } }>('/assets', {
            orgId: orgId!,
            limit: '1',
          }),
        ]);

        if (statsRes.status === 'fulfilled') {
          setStats(statsRes.value);
        }

        if (assetsRes.status === 'fulfilled') {
          setTotalAssets(assetsRes.value.pagination.total);
        }
      } catch {
        // fallback values already set
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [orgId]);

  const openCount =
    stats?.byStatus?.find((s) => s.status === 'OPEN')?.count ?? 0;
  const criticalCount =
    stats?.bySeverity?.find((s) => s.severity === 'CRITICAL')?.count ?? 0;

  const severityTotal = stats?.bySeverity?.reduce((sum, s) => sum + s.count, 0) ?? 0;

  const severityBars = (stats?.bySeverity ?? []).map((s) => {
    const colorMap: Record<string, string> = {
      CRITICAL: 'bg-red-500',
      HIGH: 'bg-orange-500',
      MEDIUM: 'bg-yellow-500',
      LOW: 'bg-blue-500',
      INFO: 'bg-gray-500',
    };
    return {
      label: s.severity.charAt(0) + s.severity.slice(1).toLowerCase(),
      value: s.count,
      color: colorMap[s.severity] || 'bg-gray-500',
      pct: severityTotal ? (s.count / severityTotal) * 100 : 0,
    };
  });

  const recentFindings = stats?.recent ?? [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total Assets"
          value={totalAssets}
          icon={Server}
          iconColor="text-blue-500"
          loading={loading}
        />
        <StatsCard
          label="Open Findings"
          value={openCount}
          icon={ShieldAlert}
          iconColor="text-orange-500"
          loading={loading}
        />
        <StatsCard
          label="Critical Findings"
          value={criticalCount}
          icon={AlertTriangle}
          iconColor="text-red-500"
          loading={loading}
        />
        <StatsCard
          label="Total Findings"
          value={stats?.total ?? 0}
          icon={Activity}
          iconColor="text-green-500"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Severity Distribution */}
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
            Severity Distribution
          </h2>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="skeleton h-3 w-20" />
                  <div className="skeleton h-5 w-full" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {severityBars.map((bar) => (
                <div key={bar.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      {bar.label}
                    </span>
                    <span className="text-xs font-semibold text-gray-900 dark:text-white">
                      {bar.value}
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${bar.color} transition-all duration-500`}
                      style={{ width: `${Math.max(bar.pct, 2)}%` }}
                    />
                  </div>
                </div>
              ))}
              {severityTotal === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No findings yet</p>
              )}
            </div>
          )}
        </div>

        {/* Recent Findings */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
              Recent Findings
            </h2>
            <Link
              href="/dashboard/findings"
              className="flex items-center gap-1 text-xs font-medium text-brand-500 hover:text-brand-400 transition-colors"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="skeleton h-5 w-16 rounded-full" />
                  <div className="skeleton h-4 flex-1" />
                  <div className="skeleton h-4 w-24" />
                </div>
              ))}
            </div>
          ) : recentFindings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-700/50">
                    <th className="table-header">Severity</th>
                    <th className="table-header">Title</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {recentFindings.map((f) => (
                    <tr
                      key={f.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="table-cell">
                        <Badge variant="severity" value={f.severity} />
                      </td>
                      <td className="table-cell font-medium text-gray-900 dark:text-white max-w-[280px] truncate">
                        {f.title}
                      </td>
                      <td className="table-cell">
                        <Badge variant="status" value={f.status} />
                      </td>
                      <td className="table-cell text-gray-500 whitespace-nowrap">
                        {format(new Date(f.createdAt), 'MMM d, HH:mm')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
              <ShieldAlert className="w-10 h-10 mb-2 text-gray-400" />
              <p className="text-sm">No findings yet</p>
              <p className="text-xs text-gray-400 mt-1">Findings will appear here as scans run</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
