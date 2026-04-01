'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Webhook as WebhookIcon,
  Loader2,
  Send,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react';
import { format } from 'date-fns';
import { api } from '@/lib/api';
import type { Webhook, WebhookEvent } from '@/lib/api';
import { useUser } from '@/lib/UserContext';
import Modal from '@/components/Modal';

const webhookEvents = [
  { value: 'finding.created', label: 'New Finding' },
  { value: 'finding.status_changed', label: 'Finding Status Changed' },
  { value: 'asset.created', label: 'Asset Created' },
  { value: 'asset.deleted', label: 'Asset Deleted' },
  { value: 'scan.completed', label: 'Scan Completed' },
  { value: 'report.generated', label: 'Report Generated' },
];

export default function WebhooksPage() {
  const { orgId, loading: userLoading } = useUser();
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [addUrl, setAddUrl] = useState('');
  const [addEvents, setAddEvents] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [deliveryLogs, setDeliveryLogs] = useState<WebhookEvent[]>([]);
  const [showDeliveries, setShowDeliveries] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchWebhooks = useCallback(async () => {
    if (!orgId) return;
    setLoading(true);
    try {
      const res = await api.get<{ webhooks: Webhook[] }>('/webhooks', { orgId });
      setWebhooks(res.webhooks || []);
    } catch {
      setWebhooks([]);
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    if (!userLoading && orgId) {
      fetchWebhooks();
    } else if (!userLoading && !orgId) {
      setLoading(false);
      setWebhooks([]);
    }
  }, [fetchWebhooks, userLoading, orgId]);

  const toggleEvent = (event: string) => {
    const next = new Set(addEvents);
    if (next.has(event)) next.delete(event);
    else next.add(event);
    setAddEvents(next);
  };

  const handleAdd = async () => {
    if (!addUrl.trim() || addEvents.size === 0 || !orgId) return;
    setSubmitting(true);
    try {
      await api.post('/webhooks', {
        orgId,
        url: addUrl,
        events: Array.from(addEvents),
      });
      showToast('success', 'Webhook created');
      setShowAdd(false);
      setAddUrl('');
      setAddEvents(new Set());
      fetchWebhooks();
    } catch (err: unknown) {
      const apiErr = err as { message?: string };
      showToast('error', apiErr.message || 'Failed to create webhook');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id: string, active: boolean) => {
    try {
      await api.put(`/webhooks/${id}`, { active: !active });
      setWebhooks((prev) =>
        prev.map((w) => (w.id === id ? { ...w, active: !active } : w))
      );
    } catch {
      showToast('error', 'Failed to update webhook');
    }
  };

  const handleTest = async (id: string) => {
    setTesting(id);
    try {
      await api.post(`/webhooks/${id}/test`);
      showToast('success', 'Test payload sent');
    } catch {
      showToast('error', 'Test delivery failed');
    } finally {
      setTesting(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/webhooks/${id}`);
      showToast('success', 'Webhook deleted');
      fetchWebhooks();
    } catch {
      showToast('error', 'Failed to delete webhook');
    }
  };

  const fetchDeliveries = async (webhookId: string) => {
    try {
      const res = await api.get<{ events: WebhookEvent[]; pagination: Record<string, unknown> }>(`/webhooks/${webhookId}/events`);
      setDeliveryLogs(res.events || []);
      setShowDeliveries(webhookId);
    } catch {
      setDeliveryLogs([]);
      setShowDeliveries(webhookId);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Webhooks</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Configure HTTP callbacks for real-time notifications
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-primary">
          <Plus className="w-4 h-4" />
          Add Webhook
        </button>
      </div>

      {/* Webhooks list */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-6">
              <div className="flex items-center gap-4">
                <div className="skeleton w-10 h-10 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-64" />
                  <div className="skeleton h-3 w-40" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : webhooks.length > 0 ? (
        <div className="space-y-4">
          {webhooks.map((wh) => (
            <div key={wh.id} className="card">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-gray-700/50 shrink-0">
                    <WebhookIcon className="w-5 h-5 text-brand-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <code className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {wh.url}
                      </code>
                      {/* Toggle */}
                      <button
                        onClick={() => handleToggle(wh.id, wh.active)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                          wh.active ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                            wh.active ? 'translate-x-4' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {wh.events.map((evt) => (
                        <span
                          key={evt}
                          className="inline-flex px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                        >
                          {evt}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      Created: {format(new Date(wh.createdAt), 'MMM d, yyyy HH:mm')}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleTest(wh.id)}
                      disabled={testing === wh.id}
                      className="btn-ghost text-xs py-1.5 px-2.5"
                      title="Send test payload"
                    >
                      {testing === wh.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Send className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => fetchDeliveries(wh.id)}
                      className="btn-ghost text-xs py-1.5 px-2.5"
                      title="View deliveries"
                    >
                      <Clock className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(wh.id)}
                      className="btn-ghost text-xs py-1.5 px-2.5 text-red-500 hover:text-red-400"
                      title="Delete webhook"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card">
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <WebhookIcon className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-sm font-medium">No webhooks configured</p>
            <p className="text-xs text-gray-400 mt-1">Set up webhooks to get real-time notifications</p>
            <button onClick={() => setShowAdd(true)} className="btn-primary mt-4">
              <Plus className="w-4 h-4" />
              Add Webhook
            </button>
          </div>
        </div>
      )}

      {/* Add Webhook Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Webhook">
        <div className="space-y-4">
          <div>
            <label className="label">Endpoint URL</label>
            <input
              type="url"
              value={addUrl}
              onChange={(e) => setAddUrl(e.target.value)}
              placeholder="https://your-server.com/webhook"
              className="input"
            />
          </div>
          <div>
            <label className="label">Events</label>
            <div className="grid grid-cols-2 gap-2">
              {webhookEvents.map((evt) => (
                <label
                  key={evt.value}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                    addEvents.has(evt.value)
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={addEvents.has(evt.value)}
                    onChange={() => toggleEvent(evt.value)}
                    className="rounded border-gray-300 dark:border-gray-600 text-brand-500"
                  />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {evt.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-400">A signing secret will be auto-generated for payload verification.</p>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setShowAdd(false)} className="btn-secondary">
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={submitting || !addUrl.trim() || addEvents.size === 0}
              className="btn-primary"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Webhook
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delivery History Modal */}
      <Modal
        open={showDeliveries !== null}
        onClose={() => setShowDeliveries(null)}
        title="Delivery History"
        maxWidth="max-w-2xl"
      >
        {deliveryLogs.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {deliveryLogs.map((log) => {
              const success = log.statusCode !== null && log.statusCode >= 200 && log.statusCode < 300;
              return (
                <div
                  key={log.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                >
                  {success ? (
                    <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{log.event}</p>
                    <p className="text-xs text-gray-500">
                      {log.deliveredAt
                        ? format(new Date(log.deliveredAt), 'MMM d, yyyy HH:mm:ss')
                        : format(new Date(log.createdAt), 'MMM d, yyyy HH:mm:ss')}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-mono font-medium ${
                      success ? 'text-green-500' : 'text-red-500'
                    }`}
                  >
                    {log.statusCode ?? '---'}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-8">No delivery history available</p>
        )}
      </Modal>

      {toast && (
        <div className={toast.type === 'success' ? 'toast-success' : 'toast-error'}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
