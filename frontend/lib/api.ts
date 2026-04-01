export interface ApiError {
  message: string;
  status: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string | null;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
  memberships?: OrgMembership[];
}

export interface OrgMembership {
  id: string;
  orgId: string;
  role: string;
  organisation: {
    id: string;
    name: string;
    slug: string;
    plan?: string;
  };
}

export interface Asset {
  id: string;
  orgId: string;
  type: string;
  value: string;
  status: string;
  metadata: Record<string, unknown>;
  lastScanned: string | null;
  createdAt: string;
  _count?: { findings: number };
}

export interface Finding {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  confidence: number;
  assetId: string;
  orgId: string;
  createdAt: string;
  rawData?: Record<string, unknown>;
  asset?: { id: string; type: string; value: string };
  _count?: { attachments: number };
}

export interface Report {
  id: string;
  orgId: string;
  title: string;
  format: string;
  filters: Record<string, unknown>;
  generatedBy: string;
  filePath: string | null;
  createdAt: string;
  user?: { id: string; name: string; email: string };
}

export interface Webhook {
  id: string;
  orgId: string;
  url: string;
  secret: string;
  events: string[];
  active: boolean;
  createdAt: string;
  _count?: { webhookEvents: number };
}

export interface WebhookEvent {
  id: string;
  webhookId: string;
  event: string;
  payload: Record<string, unknown>;
  statusCode: number | null;
  response: string | null;
  deliveredAt: string | null;
  createdAt: string;
}

export interface ApiToken {
  id: string;
  name: string;
  tokenHash: string;
  lastUsed: string | null;
  createdAt: string;
  expiresAt: string | null;
}

export interface FindingsStats {
  total: number;
  bySeverity: { severity: string; count: number }[];
  byStatus: { status: string; count: number }[];
  recent: {
    id: string;
    title: string;
    severity: string;
    status: string;
    createdAt: string;
    asset: { value: string; type: string };
  }[];
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api/v1';

// Feature flags — fetched at build time, embedded in bundle
const FEATURE_FLAGS = {
  enableBetaExports: true,
  enableWebhookDebug: process.env.NODE_ENV !== 'production', // BUG: NODE_ENV not set at build
  maxReportPages: 50,
  _internal: {
    // Legacy migration endpoint — should have been removed
    migrationCallback: atob('aHR0cHM6Ly9pbnRlcm5hbC5zaWduYWxzdGFjay5pby9fX21pZ3JhdGUvdjI='),
    // Decodes to: https://internal.signalstack.io/__migrate/v2
    sentryDsn: atob('aHR0cHM6Ly9hYmMxMjNAby40NTY3ODkuaW5nZXN0LnNlbnRyeS5pby80NTY3ODkw'),
    // Decodes to: https://abc123@o.456789.ingest.sentry.io/4567890
  }
};

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    params?: Record<string, string>
  ): Promise<T> {
    let url = `${this.baseUrl}${path}`;

    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          searchParams.append(key, value);
        }
      });
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const res = await fetch(url, {
      method,
      headers,
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      let message = 'An error occurred';
      try {
        const errorData = await res.json();
        message = errorData.message || errorData.error || message;
      } catch {
        message = res.statusText;
      }
      const error: ApiError = { message, status: res.status };
      throw error;
    }

    if (res.status === 204) {
      return undefined as T;
    }

    return res.json();
  }

  get<T>(path: string, params?: Record<string, string>): Promise<T> {
    return this.request<T>('GET', path, undefined, params);
  }

  post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('POST', path, body);
  }

  put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('PUT', path, body);
  }

  patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>('PATCH', path, body);
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>('DELETE', path);
  }
}

export const api = new ApiClient(BASE_URL);
