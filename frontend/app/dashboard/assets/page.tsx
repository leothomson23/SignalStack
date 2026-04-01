'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Search,
  Globe,
  Server,
  Link2,
  MoreVertical,
  Loader2,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import { api } from '@/lib/api';
import type { Asset } from '@/lib/api';
import { useUser } from '@/lib/UserContext';
import Badge from '@/components/Badge';
import Modal from '@/components/Modal';

const assetTypeIcons: Record<string, React.ElementType> = {
  DOMAIN: Globe,
  IP: Server,
  API: Link2,
  SERVICE: Server,
};

const assetTypes = [
  { value: 'DOMAIN', label: 'Domain' },
  { value: 'IP', label: 'IP Address' },
  { value: 'API', label: 'API' },
  { value: 'SERVICE', label: 'Service' },
];

export default function AssetsPage() {
  const { orgId, loading: userLoading } = useUser();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [addType, setAddType] = useState('DOMAIN');
  const [addValue, setAddValue] = useState('');
  const [addMeta, setAddMeta] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAssets = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const params: Record<string, string> = {
        orgId,
        page: page.toString(),
        limit: '20',
      };
      if (typeFilter) params.type = typeFilter;
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;

      const res = await api.get<{ assets: Asset[]; pagination: { total: number; page: number; limit: number; pages: number } }>('/assets', params);
      setAssets(res.assets || []);
      setTotal(res.pagination?.total || 0);
    } catch {
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, [orgId, page, typeFilter, statusFilter, search]);

  useEffect(() => {
    if (!userLoading && orgId) {
      fetchAssets();
    } else if (!userLoading && !orgId) {
      setLoading(false);
      setAssets([]);
    }
  }, [fetchAssets, userLoading, orgId]);

  const handleAdd = async () => {
    if (!addValue.trim() || !orgId) return;
    setSubmitting(true);
    try {
      let metadata = {};
      if (addMeta.trim()) {
        try {
          metadata = JSON.parse(addMeta);
        } catch {
          showToast('error', 'Invalid JSON in metadata');
          setSubmitting(false);
          return;
        }
      }
      await api.post('/assets', { orgId, type: addType, value: addValue, metadata });
      showToast('success', 'Asset added successfully');
      setShowAdd(false);
      setAddValue('');
      setAddMeta('');
      fetchAssets();
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      showToast('error', apiErr.message || 'Failed to add asset');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/assets/${id}`);
      showToast('success', 'Asset deleted');
      fetchAssets();
    } catch {
      showToast('error', 'Failed to delete asset');
    }
    setMenuOpen(null);
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Assets</h2>
          <p className="text-sm text-gray-500 mt-0.5">{total} assets total</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Add Asset
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search assets..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="input pl-9"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
          className="input w-auto"
        >
          <option value="">All Types</option>
          {assetTypes.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
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
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="MONITORING">Monitoring</option>
          <option value="ARCHIVED">Archived</option>
        </select>
        <button onClick={fetchAssets} className="btn-ghost" title="Refresh">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="skeleton w-8 h-8 rounded" />
                <div className="skeleton h-4 flex-1" />
                <div className="skeleton h-5 w-20 rounded-full" />
                <div className="skeleton h-4 w-28" />
              </div>
            ))}
          </div>
        ) : assets.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="table-header">Type</th>
                    <th className="table-header">Value</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Last Scanned</th>
                    <th className="table-header w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {assets.map((asset) => {
                    const TypeIcon = assetTypeIcons[asset.type] || Server;
                    return (
                      <tr
                        key={asset.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-700">
                              <TypeIcon className="w-4 h-4 text-gray-500" />
                            </div>
                            <span className="text-xs uppercase font-medium text-gray-500">
                              {asset.type}
                            </span>
                          </div>
                        </td>
                        <td className="table-cell font-medium text-gray-900 dark:text-white font-mono text-xs">
                          {asset.value}
                        </td>
                        <td className="table-cell">
                          <Badge variant="status" value={asset.status} />
                        </td>
                        <td className="table-cell text-gray-500 whitespace-nowrap text-xs">
                          {asset.lastScanned
                            ? format(new Date(asset.lastScanned), 'MMM d, yyyy HH:mm')
                            : 'Never'}
                        </td>
                        <td className="table-cell relative">
                          <button
                            onClick={() =>
                              setMenuOpen(menuOpen === asset.id ? null : asset.id)
                            }
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </button>
                          {menuOpen === asset.id && (
                            <div className="absolute right-4 top-full mt-1 z-10 w-40 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1">
                              <button
                                onClick={() => handleDelete(asset.id)}
                                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
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
            <Server className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-sm font-medium">No assets found</p>
            <p className="text-xs text-gray-400 mt-1">Add your first asset to get started</p>
            <button onClick={() => setShowAdd(true)} className="btn-primary mt-4">
              <Plus className="w-4 h-4" />
              Add Asset
            </button>
          </div>
        )}
      </div>

      {/* Add Asset Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Asset">
        <div className="space-y-4">
          <div>
            <label className="label">Asset Type</label>
            <select
              value={addType}
              onChange={(e) => setAddType(e.target.value)}
              className="input"
            >
              {assetTypes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Value</label>
            <input
              type="text"
              value={addValue}
              onChange={(e) => setAddValue(e.target.value)}
              placeholder={
                addType === 'DOMAIN'
                  ? 'example.com'
                  : addType === 'IP'
                  ? '192.168.1.1'
                  : addType === 'API'
                  ? 'https://api.example.com'
                  : 'my-service'
              }
              className="input"
            />
          </div>
          <div>
            <label className="label">
              Metadata <span className="text-gray-400 font-normal">(optional JSON)</span>
            </label>
            <textarea
              value={addMeta}
              onChange={(e) => setAddMeta(e.target.value)}
              placeholder='{"environment": "production"}'
              rows={3}
              className="input resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowAdd(false)} className="btn-secondary">
              Cancel
            </button>
            <button onClick={handleAdd} disabled={submitting || !addValue.trim()} className="btn-primary">
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Add Asset
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Toast */}
      {toast && (
        <div className={toast.type === 'success' ? 'toast-success' : 'toast-error'}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
