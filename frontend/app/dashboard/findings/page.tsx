'use client';

import { useState, useEffect, useCallback, Fragment } from 'react';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  ShieldAlert,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { api } from '@/lib/api';
import type { Finding } from '@/lib/api';
import { useUser } from '@/lib/UserContext';
import Badge from '@/components/Badge';

interface FindingsResponse {
  findings: Finding[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export default function FindingsPage() {
  const { orgId, loading: userLoading } = useUser();
  const [findings, setFindings] = useState<Finding[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [dataLoading, setDataLoading] = useState(false);
  const loading = userLoading || dataLoading;
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchFindings = useCallback(async () => {
    if (!orgId) return;
    setDataLoading(true);
    try {
      const params: Record<string, string> = {
        orgId,
        page: page.toString(),
        limit: '20',
      };
      if (severityFilter) params.severity = severityFilter.toUpperCase();
      if (statusFilter) params.status = statusFilter.toUpperCase();
      if (search) params.search = search;

      const res = await api.get<FindingsResponse>('/findings', params);
      setFindings(res.findings || []);
      setTotal(res.pagination?.total || 0);
    } catch {
      setFindings([]);
    } finally {
      setDataLoading(false);
    }
  }, [orgId, page, severityFilter, statusFilter, search]);

  useEffect(() => {
    fetchFindings();
  }, [fetchFindings]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const toggleSelectAll = () => {
    if (selected.size === findings.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(findings.map((f) => f.id)));
    }
  };

  const handleBulkUpdate = async () => {
    if (!bulkStatus || selected.size === 0) return;
    setUpdating(true);
    try {
      await Promise.all(
        Array.from(selected).map((id) =>
          api.put(`/findings/${id}/status`, { status: bulkStatus.toUpperCase() })
        )
      );
      showToast('success', `Updated ${selected.size} findings`);
      setSelected(new Set());
      setBulkStatus('');
      fetchFindings();
    } catch {
      showToast('error', 'Failed to update findings');
    } finally {
      setUpdating(false);
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return null;
    return sortOrder === 'asc' ? (
      <ChevronUp className="w-3.5 h-3.5" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5" />
    );
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Findings</h2>
          <p className="text-sm text-gray-500 mt-0.5">{total} findings total</p>
        </div>
        <button onClick={fetchFindings} className="btn-secondary">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search findings..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="input pl-9"
          />
        </div>
        <select
          value={severityFilter}
          onChange={(e) => {
            setSeverityFilter(e.target.value);
            setPage(1);
          }}
          className="input w-auto"
        >
          <option value="">All Severities</option>
          <option value="CRITICAL">Critical</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
          <option value="INFO">Info</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="input w-auto"
        >
          <option value="">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="RESOLVED">Resolved</option>
          <option value="FALSE_POSITIVE">False Positive</option>
        </select>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 p-3 bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-lg">
          <CheckSquare className="w-4 h-4 text-brand-500" />
          <span className="text-sm font-medium text-brand-700 dark:text-brand-300">
            {selected.size} selected
          </span>
          <select
            value={bulkStatus}
            onChange={(e) => setBulkStatus(e.target.value)}
            className="input w-auto text-xs py-1.5"
          >
            <option value="">Set status...</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="RESOLVED">Resolved</option>
            <option value="FALSE_POSITIVE">False Positive</option>
          </select>
          <button
            onClick={handleBulkUpdate}
            disabled={!bulkStatus || updating}
            className="btn-primary text-xs py-1.5"
          >
            {updating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Apply'}
          </button>
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="skeleton w-4 h-4 rounded" />
                <div className="skeleton h-4 flex-1" />
                <div className="skeleton h-5 w-16 rounded-full" />
                <div className="skeleton h-5 w-16 rounded-full" />
                <div className="skeleton h-4 w-24" />
              </div>
            ))}
          </div>
        ) : findings.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="table-header w-10">
                      <input
                        type="checkbox"
                        checked={selected.size === findings.length && findings.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300 dark:border-gray-600"
                      />
                    </th>
                    <th
                      className="table-header cursor-pointer select-none"
                      onClick={() => handleSort('title')}
                    >
                      <div className="flex items-center gap-1">
                        Title <SortIcon field="title" />
                      </div>
                    </th>
                    <th
                      className="table-header cursor-pointer select-none"
                      onClick={() => handleSort('severity')}
                    >
                      <div className="flex items-center gap-1">
                        Severity <SortIcon field="severity" />
                      </div>
                    </th>
                    <th className="table-header">Asset</th>
                    <th
                      className="table-header cursor-pointer select-none"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center gap-1">
                        Status <SortIcon field="status" />
                      </div>
                    </th>
                    <th className="table-header">Confidence</th>
                    <th
                      className="table-header cursor-pointer select-none"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex items-center gap-1">
                        Date <SortIcon field="createdAt" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {findings.map((f) => (
                    <Fragment key={f.id}>
                      <tr
                        className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer ${
                          expandedId === f.id ? 'bg-gray-50 dark:bg-gray-800/50' : ''
                        }`}
                        onClick={() => setExpandedId(expandedId === f.id ? null : f.id)}
                      >
                        <td
                          className="table-cell"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelect(f.id);
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selected.has(f.id)}
                            onChange={() => {}}
                            className="rounded border-gray-300 dark:border-gray-600"
                          />
                        </td>
                        <td className="table-cell font-medium text-gray-900 dark:text-white max-w-[300px] truncate">
                          {f.title}
                        </td>
                        <td className="table-cell">
                          <Badge variant="severity" value={f.severity} />
                        </td>
                        <td className="table-cell text-xs font-mono text-gray-500">
                          {f.asset?.value || f.assetId?.slice(0, 8)}
                        </td>
                        <td className="table-cell">
                          <Badge variant="status" value={f.status} />
                        </td>
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-brand-500 rounded-full"
                                style={{ width: `${Math.round(f.confidence * 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">
                              {Math.round(f.confidence * 100)}%
                            </span>
                          </div>
                        </td>
                        <td className="table-cell text-gray-500 whitespace-nowrap text-xs">
                          {format(new Date(f.createdAt), 'MMM d, yyyy')}
                        </td>
                      </tr>
                      {expandedId === f.id && (
                        <tr key={`${f.id}-detail`}>
                          <td colSpan={7} className="px-6 py-4 bg-gray-50 dark:bg-gray-800/30">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                                  Description
                                </h4>
                                <p className="text-sm text-gray-700 dark:text-gray-300">
                                  {f.description || 'No description available'}
                                </p>
                              </div>
                              <div>
                                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                                  Asset
                                </h4>
                                <p className="text-sm text-gray-700 dark:text-gray-300 font-mono">
                                  {f.asset?.value || 'Unknown'} {f.asset?.type ? `(${f.asset.type})` : ''}
                                </p>
                              </div>
                              <div>
                                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                                  Raw Data
                                </h4>
                                <pre className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900 p-3 rounded-lg overflow-x-auto">
                                  {f.rawData ? JSON.stringify(f.rawData, null, 2) : 'None'}
                                </pre>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="btn-ghost text-xs"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(Math.min(totalPages, page + 1))}
                    disabled={page === totalPages}
                    className="btn-ghost text-xs"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <ShieldAlert className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-sm font-medium">No findings found</p>
            <p className="text-xs text-gray-400 mt-1">
              Findings will appear here as scans discover issues
            </p>
          </div>
        )}
      </div>

      {toast && (
        <div className={toast.type === 'success' ? 'toast-success' : 'toast-error'}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
