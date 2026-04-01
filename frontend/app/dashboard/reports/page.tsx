'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Plus,
  Download,
  Loader2,
  RefreshCw,
  Calendar,
  FileJson,
  FileSpreadsheet,
  Trash2,
} from 'lucide-react';
import { format } from 'date-fns';
import { api } from '@/lib/api';
import type { Report } from '@/lib/api';
import { useUser } from '@/lib/UserContext';
import Modal from '@/components/Modal';

const severityOptions = [
  { value: 'CRITICAL', label: 'Critical' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
  { value: 'INFO', label: 'Info' },
];

export default function ReportsPage() {
  const { orgId, loading: userLoading } = useUser();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerate, setShowGenerate] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [reportTitle, setReportTitle] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sevFilters, setSevFilters] = useState<Set<string>>(new Set());
  const [reportFormat, setReportFormat] = useState<'pdf' | 'json' | 'csv'>('pdf');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const toggleSeverity = (sev: string) => {
    const next = new Set(sevFilters);
    if (next.has(sev)) next.delete(sev);
    else next.add(sev);
    setSevFilters(next);
  };

  const fetchReports = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const res = await api.get<{ reports: Report[]; pagination: Record<string, unknown> }>('/reports', { orgId });
      setReports(res.reports || []);
    } catch {
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    if (!userLoading && orgId) {
      fetchReports();
    } else if (!userLoading && !orgId) {
      setLoading(false);
      setReports([]);
    }
  }, [fetchReports, userLoading, orgId]);

  const handleGenerate = async () => {
    if (!reportTitle.trim() || !orgId) return;
    setGenerating(true);
    try {
      const filters: Record<string, unknown> = {};
      if (sevFilters.size > 0) filters.severity = Array.from(sevFilters);
      if (dateFrom || dateTo) {
        const dateRange: Record<string, string> = {};
        if (dateFrom) dateRange.from = dateFrom;
        if (dateTo) dateRange.to = dateTo;
        filters.dateRange = dateRange;
      }

      await api.post('/reports/generate', {
        orgId,
        title: reportTitle,
        format: reportFormat,
        filters,
      });
      showToast('success', 'Report generated successfully');
      setShowGenerate(false);
      setReportTitle('');
      setDateFrom('');
      setDateTo('');
      setSevFilters(new Set());
      fetchReports();
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      showToast('error', apiErr.message || 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/reports/${id}`);
      showToast('success', 'Report deleted');
      fetchReports();
    } catch {
      showToast('error', 'Failed to delete report');
    }
  };

  const formatIcon = (fmt: string) => {
    switch (fmt.toLowerCase()) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-500" />;
      case 'json':
        return <FileJson className="w-4 h-4 text-yellow-500" />;
      case 'csv':
        return <FileSpreadsheet className="w-4 h-4 text-green-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Reports</h2>
          <p className="text-sm text-gray-500 mt-0.5">Generate and download security reports</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchReports} className="btn-secondary">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button onClick={() => setShowGenerate(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            Generate Report
          </button>
        </div>
      </div>

      {/* Reports list */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="skeleton w-10 h-10 rounded-lg" />
                <div className="flex-1 space-y-1">
                  <div className="skeleton h-4 w-48" />
                  <div className="skeleton h-3 w-24" />
                </div>
                <div className="skeleton h-8 w-24 rounded-lg" />
              </div>
            ))}
          </div>
        ) : reports.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
            {reports.map((report) => (
              <div
                key={report.id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  {formatIcon(report.format)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {report.title || `Security Report - ${format(new Date(report.createdAt), 'MMM d, yyyy')}`}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-500">
                      {format(new Date(report.createdAt), 'MMM d, yyyy HH:mm')}
                    </span>
                    <span className="text-xs text-gray-400 uppercase font-medium">
                      {report.format}
                    </span>
                    {report.user && (
                      <span className="text-xs text-gray-400">
                        by {report.user.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {report.filePath && (
                    <a
                      href={`${baseUrl}/reports/${report.id}/download`}
                      className="btn-secondary text-xs py-1.5"
                      download
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </a>
                  )}
                  <button
                    onClick={() => handleDelete(report.id)}
                    className="btn-ghost text-xs py-1.5 px-2.5 text-red-500 hover:text-red-400"
                    title="Delete report"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <FileText className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-sm font-medium">No reports yet</p>
            <p className="text-xs text-gray-400 mt-1">Generate your first security report</p>
            <button onClick={() => setShowGenerate(true)} className="btn-primary mt-4">
              <Plus className="w-4 h-4" />
              Generate Report
            </button>
          </div>
        )}
      </div>

      {/* Generate Report Modal */}
      <Modal open={showGenerate} onClose={() => setShowGenerate(false)} title="Generate Report">
        <div className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input
              type="text"
              value={reportTitle}
              onChange={(e) => setReportTitle(e.target.value)}
              placeholder="Monthly Security Report"
              className="input"
            />
          </div>
          <div>
            <label className="label">Format</label>
            <div className="grid grid-cols-3 gap-2">
              {(['pdf', 'json', 'csv'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setReportFormat(fmt)}
                  className={`flex items-center justify-center gap-2 p-3 rounded-lg border text-sm font-medium transition-colors ${
                    reportFormat === fmt
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  {formatIcon(fmt)}
                  {fmt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">From Date</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="label">To Date</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="input"
              />
            </div>
          </div>
          <div>
            <label className="label">Severity Filter</label>
            <div className="flex flex-wrap gap-2">
              {severityOptions.map((sev) => (
                <button
                  key={sev.value}
                  onClick={() => toggleSeverity(sev.value)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                    sevFilters.has(sev.value)
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  {sev.label}
                </button>
              ))}
            </div>
            {sevFilters.size === 0 && (
              <p className="text-xs text-gray-400 mt-1">No filter selected -- all severities will be included</p>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowGenerate(false)} className="btn-secondary">
              Cancel
            </button>
            <button onClick={handleGenerate} disabled={generating || !reportTitle.trim()} className="btn-primary">
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Generate
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {toast && (
        <div className={toast.type === 'success' ? 'toast-success' : 'toast-error'}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
