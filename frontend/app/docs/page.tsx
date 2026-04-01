'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Book,
  Key,
  Gauge,
  AlertTriangle,
  Server,
  Search,
  FileText,
  Webhook,
  Lock,
  Building2,
  Rocket,
  Link2,
  GitBranch,
  ChevronRight,
  Menu,
  X,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface NavSection {
  title: string;
  items: { id: string; label: string; icon: React.ElementType }[];
}

/* ------------------------------------------------------------------ */
/*  Navigation structure                                               */
/* ------------------------------------------------------------------ */

const navigation: NavSection[] = [
  {
    title: 'Getting Started',
    items: [
      { id: 'introduction', label: 'Introduction', icon: Book },
      { id: 'authentication', label: 'Authentication', icon: Key },
      { id: 'rate-limits', label: 'Rate Limits', icon: Gauge },
      { id: 'errors', label: 'Errors', icon: AlertTriangle },
    ],
  },
  {
    title: 'Core Resources',
    items: [
      { id: 'assets', label: 'Assets', icon: Server },
      { id: 'findings', label: 'Findings', icon: Search },
      { id: 'reports', label: 'Reports', icon: FileText },
    ],
  },
  {
    title: 'Configuration',
    items: [
      { id: 'webhooks', label: 'Webhooks', icon: Webhook },
      { id: 'api-tokens', label: 'API Tokens', icon: Lock },
      { id: 'organisations', label: 'Organisations', icon: Building2 },
    ],
  },
  {
    title: 'Guides',
    items: [
      { id: 'quick-start', label: 'Quick Start', icon: Rocket },
      { id: 'webhook-setup', label: 'Webhook Setup', icon: Link2 },
      { id: 'cicd-integration', label: 'CI/CD Integration', icon: GitBranch },
    ],
  },
];

const allIds = navigation.flatMap((s) => s.items.map((i) => i.id));

/* ------------------------------------------------------------------ */
/*  Reusable components                                                */
/* ------------------------------------------------------------------ */

function MethodBadge({ method }: { method: string }) {
  const colors: Record<string, string> = {
    GET: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    POST: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
    PUT: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
    DELETE: 'bg-red-500/15 text-red-400 border-red-500/25',
  };
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-bold tracking-wide ${colors[method] ?? 'bg-gray-700 text-gray-300'}`}
    >
      {method}
    </span>
  );
}

function CodeBlock({ code, language = 'bash' }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <div className="group relative rounded-lg border border-gray-700/50 bg-gray-900 text-sm">
      <div className="flex items-center justify-between border-b border-gray-700/50 px-4 py-2">
        <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
          {language}
        </span>
        <button
          onClick={copy}
          className="flex items-center gap-1 rounded px-2 py-1 text-xs text-gray-400 transition hover:bg-gray-800 hover:text-gray-200"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" /> Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" /> Copy
            </>
          )}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 leading-relaxed">
        <code className="font-mono text-[13px] text-gray-300 whitespace-pre">{code}</code>
      </pre>
    </div>
  );
}

function EndpointCard({
  method,
  path,
  description,
  request,
  response,
  params,
  body,
}: {
  method: string;
  path: string;
  description: string;
  request?: string;
  response?: string;
  params?: { name: string; type: string; description: string }[];
  body?: { name: string; type: string; description: string; required?: boolean }[];
}) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-800/40 overflow-hidden">
      <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-700/60 px-5 py-3.5">
        <MethodBadge method={method} />
        <code className="text-sm font-semibold text-gray-900 dark:text-gray-100">{path}</code>
      </div>
      <div className="space-y-4 p-5">
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>

        {params && params.length > 0 && (
          <div>
            <h5 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Query Parameters
            </h5>
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700/50">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/60">
                    <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-400">
                      Name
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-400">
                      Type
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-400">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {params.map((p) => (
                    <tr
                      key={p.name}
                      className="border-b border-gray-200 dark:border-gray-700/50 last:border-0"
                    >
                      <td className="px-4 py-2 font-mono text-xs text-brand-400">{p.name}</td>
                      <td className="px-4 py-2 text-xs text-gray-500">{p.type}</td>
                      <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
                        {p.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {body && body.length > 0 && (
          <div>
            <h5 className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Request Body
            </h5>
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700/50">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/60">
                    <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-400">
                      Field
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-400">
                      Type
                    </th>
                    <th className="px-4 py-2 text-left font-medium text-gray-600 dark:text-gray-400">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {body.map((b) => (
                    <tr
                      key={b.name}
                      className="border-b border-gray-200 dark:border-gray-700/50 last:border-0"
                    >
                      <td className="px-4 py-2 font-mono text-xs text-brand-400">
                        {b.name}
                        {b.required && (
                          <span className="ml-1 text-[10px] text-red-400">required</span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-xs text-gray-500">{b.type}</td>
                      <td className="px-4 py-2 text-gray-600 dark:text-gray-400">
                        {b.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {request && <CodeBlock code={request} language="bash" />}
        {response && <CodeBlock code={response} language="json" />}
      </div>
    </div>
  );
}

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="scroll-mt-24 text-2xl font-bold tracking-tight text-gray-900 dark:text-white"
    >
      {children}
    </h2>
  );
}

function SubHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">{children}</h3>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function DocsPage() {
  const [activeId, setActiveId] = useState('introduction');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* Intersection observer for active link tracking */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0.1 }
    );

    allIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    setActiveId(id);
    setSidebarOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  /* ---- Sidebar ---- */
  const sidebar = (
    <nav className="space-y-6">
      {navigation.map((section) => (
        <div key={section.title}>
          <h4 className="mb-2 px-3 text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            {section.title}
          </h4>
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = activeId === item.id;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => scrollTo(item.id)}
                    className={`group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                      active
                        ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 flex-shrink-0 ${
                        active
                          ? 'text-brand-500 dark:text-brand-400'
                          : 'text-gray-400 group-hover:text-gray-600 dark:text-gray-500 dark:group-hover:text-gray-300'
                      }`}
                    />
                    {item.label}
                    {active && (
                      <ChevronRight className="ml-auto h-3.5 w-3.5 text-brand-400" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  /* ---- Render ---- */
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition hover:bg-brand-700 lg:hidden"
        aria-label="Toggle navigation"
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform overflow-y-auto border-r border-gray-200 bg-white px-4 py-6 pt-20 transition-transform dark:border-gray-800 dark:bg-gray-900 lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebar}
      </aside>

      <div className="mx-auto max-w-[1440px] lg:flex">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block lg:w-64 xl:w-72 flex-shrink-0">
          <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto border-r border-gray-200 px-4 py-8 dark:border-gray-800">
            {sidebar}
          </div>
        </aside>

        {/* Main content */}
        <main className="min-w-0 flex-1 px-6 py-10 md:px-10 lg:px-16">
          <div className="mx-auto max-w-3xl space-y-20">
            {/* ============================================================ */}
            {/*  INTRODUCTION                                                */}
            {/* ============================================================ */}
            <section id="introduction" className="space-y-6">
              <div className="space-y-2">
                <p className="text-sm font-semibold uppercase tracking-wider text-brand-500">
                  API Reference
                </p>
                <SectionHeading id="introduction">Introduction</SectionHeading>
              </div>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Welcome to the SignalStack API. Our REST API gives you programmatic access to
                your organisation&apos;s attack surface data &mdash; assets, findings, reports,
                and more. Integrate SignalStack into your existing workflows, build custom
                dashboards, or automate your security operations.
              </p>

              <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700/60 dark:bg-gray-800/40">
                <h4 className="mb-3 text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Base URL
                </h4>
                <code className="block rounded-lg bg-gray-900 px-4 py-3 font-mono text-sm text-brand-400">
                  https://api.signalstack.io/v1
                </code>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: 'Format', value: 'JSON' },
                  { label: 'API Version', value: 'v1 (stable)' },
                  { label: 'Transport', value: 'HTTPS only' },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700/60 dark:bg-gray-800/40"
                  >
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>

              <p className="text-sm text-gray-500">
                All responses include standard HTTP status codes. Successful requests return a{' '}
                <code className="rounded bg-gray-200 px-1.5 py-0.5 text-xs dark:bg-gray-700">
                  2xx
                </code>{' '}
                status code with a JSON body. Error responses follow a consistent format
                described in the{' '}
                <button
                  onClick={() => scrollTo('errors')}
                  className="font-medium text-brand-500 hover:underline"
                >
                  Errors
                </button>{' '}
                section.
              </p>
            </section>

            {/* ============================================================ */}
            {/*  AUTHENTICATION                                              */}
            {/* ============================================================ */}
            <section id="authentication" className="space-y-6">
              <SectionHeading id="authentication">Authentication</SectionHeading>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                All API requests require authentication via one of these methods:
              </p>

              <div className="space-y-4">
                {[
                  {
                    title: 'Bearer Token (recommended)',
                    description:
                      'Pass a JWT token obtained from the login endpoint in the Authorization header.',
                    header: 'Authorization: Bearer <token>',
                  },
                  {
                    title: 'API Key',
                    description:
                      'Use a long-lived API key generated in the dashboard settings.',
                    header: 'X-API-Key: <api_key>',
                  },
                  {
                    title: 'Cookie-based (browser sessions)',
                    description:
                      'Automatically handled for browser-based clients after login. Not recommended for programmatic access.',
                    header: 'Cookie: session=<session_token>',
                  },
                ].map((method) => (
                  <div
                    key={method.title}
                    className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700/60 dark:bg-gray-800/40"
                  >
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {method.title}
                    </h4>
                    <p className="mt-1 text-sm text-gray-500">{method.description}</p>
                    <code className="mt-2 block rounded bg-gray-100 px-3 py-1.5 font-mono text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      {method.header}
                    </code>
                  </div>
                ))}
              </div>

              <SubHeading>Example Request</SubHeading>
              <CodeBlock
                code={`curl -X GET https://api.signalstack.io/v1/assets \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..." \\
  -H "Content-Type: application/json"`}
                language="bash"
              />
            </section>

            {/* ============================================================ */}
            {/*  RATE LIMITS                                                 */}
            {/* ============================================================ */}
            <section id="rate-limits" className="space-y-6">
              <SectionHeading id="rate-limits">Rate Limits</SectionHeading>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                API requests are rate-limited per API key. Limits vary by plan:
              </p>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700/60 dark:bg-gray-800/40">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Pro Plan
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                    1,000{' '}
                    <span className="text-sm font-normal text-gray-500">req / min</span>
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700/60 dark:bg-gray-800/40">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Free Plan
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                    100{' '}
                    <span className="text-sm font-normal text-gray-500">req / min</span>
                  </p>
                </div>
              </div>

              <SubHeading>Rate Limit Headers</SubHeading>
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700/50">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/60">
                      <th className="px-4 py-2.5 text-left font-medium text-gray-600 dark:text-gray-400">
                        Header
                      </th>
                      <th className="px-4 py-2.5 text-left font-medium text-gray-600 dark:text-gray-400">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800/40">
                    {[
                      ['X-RateLimit-Limit', 'Maximum requests per window'],
                      ['X-RateLimit-Remaining', 'Remaining requests in current window'],
                      ['X-RateLimit-Reset', 'Unix timestamp when the window resets'],
                    ].map(([header, desc]) => (
                      <tr
                        key={header}
                        className="border-b border-gray-200 dark:border-gray-700/50 last:border-0"
                      >
                        <td className="px-4 py-2.5 font-mono text-xs text-brand-400">
                          {header}
                        </td>
                        <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/5">
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  <strong>429 Too Many Requests</strong> &mdash; When you exceed the rate
                  limit, the API responds with a{' '}
                  <code className="rounded bg-amber-200/60 px-1 py-0.5 text-xs dark:bg-amber-800/40">
                    429
                  </code>{' '}
                  status. Use the{' '}
                  <code className="rounded bg-amber-200/60 px-1 py-0.5 text-xs dark:bg-amber-800/40">
                    X-RateLimit-Reset
                  </code>{' '}
                  header to determine when to retry.
                </p>
              </div>
            </section>

            {/* ============================================================ */}
            {/*  ERRORS                                                      */}
            {/* ============================================================ */}
            <section id="errors" className="space-y-6">
              <SectionHeading id="errors">Errors</SectionHeading>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                The API uses conventional HTTP status codes. All error responses follow a
                consistent JSON format:
              </p>

              <CodeBlock
                code={`{
  "error": "ValidationError",
  "message": "The 'type' field is required.",
  "statusCode": 422
}`}
                language="json"
              />

              <SubHeading>HTTP Status Codes</SubHeading>
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700/50">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/60">
                      <th className="px-4 py-2.5 text-left font-medium text-gray-600 dark:text-gray-400">
                        Code
                      </th>
                      <th className="px-4 py-2.5 text-left font-medium text-gray-600 dark:text-gray-400">
                        Name
                      </th>
                      <th className="px-4 py-2.5 text-left font-medium text-gray-600 dark:text-gray-400">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800/40">
                    {[
                      ['400', 'Bad Request', 'The request was malformed or missing required fields.'],
                      ['401', 'Unauthorized', 'Invalid or missing authentication credentials.'],
                      ['403', 'Forbidden', 'You do not have permission to access this resource.'],
                      ['404', 'Not Found', 'The requested resource does not exist.'],
                      ['409', 'Conflict', 'The request conflicts with the current state (e.g. duplicate asset).'],
                      ['422', 'Unprocessable Entity', 'Validation failed for the provided data.'],
                      ['429', 'Too Many Requests', 'You have exceeded the rate limit.'],
                      ['500', 'Internal Server Error', 'Something went wrong on our end.'],
                    ].map(([code, name, desc]) => (
                      <tr
                        key={code}
                        className="border-b border-gray-200 dark:border-gray-700/50 last:border-0"
                      >
                        <td className="px-4 py-2.5 font-mono text-xs font-bold text-red-400">
                          {code}
                        </td>
                        <td className="px-4 py-2.5 font-medium text-gray-800 dark:text-gray-200">
                          {name}
                        </td>
                        <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* ============================================================ */}
            {/*  ASSETS                                                      */}
            {/* ============================================================ */}
            <section id="assets" className="space-y-6">
              <SectionHeading id="assets">Assets</SectionHeading>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Assets represent the targets in your attack surface &mdash; domains, IP
                addresses, web applications, cloud services, and more.
              </p>

              <div className="space-y-6">
                <EndpointCard
                  method="GET"
                  path="/api/v1/assets"
                  description="Retrieve a paginated list of assets for your organisation."
                  params={[
                    { name: 'orgId', type: 'string', description: 'Organisation ID (required)' },
                    { name: 'type', type: 'string', description: 'Filter by type: domain, ip, webapp, cloud' },
                    { name: 'status', type: 'string', description: 'Filter by status: active, inactive, archived' },
                    { name: 'page', type: 'integer', description: 'Page number (default: 1)' },
                    { name: 'limit', type: 'integer', description: 'Items per page (default: 25, max: 100)' },
                  ]}
                  request={`curl -X GET "https://api.signalstack.io/v1/assets?orgId=org_abc123&type=domain&page=1&limit=25" \\
  -H "Authorization: Bearer <token>"`}
                  response={`{
  "data": [
    {
      "id": "ast_8xk2m9",
      "orgId": "org_abc123",
      "type": "domain",
      "value": "example.com",
      "status": "active",
      "metadata": {
        "registrar": "Cloudflare",
        "nameservers": ["ns1.cloudflare.com"]
      },
      "lastScanned": "2026-03-18T14:30:00Z",
      "createdAt": "2026-01-15T09:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "total": 142,
    "totalPages": 6
  }
}`}
                />

                <EndpointCard
                  method="POST"
                  path="/api/v1/assets"
                  description="Create a new asset in your organisation."
                  body={[
                    { name: 'orgId', type: 'string', description: 'Organisation ID', required: true },
                    { name: 'type', type: 'string', description: 'Asset type: domain, ip, webapp, cloud', required: true },
                    { name: 'value', type: 'string', description: 'Asset identifier (e.g. example.com, 192.168.1.1)', required: true },
                    { name: 'metadata', type: 'object', description: 'Optional key-value metadata' },
                  ]}
                  request={`curl -X POST https://api.signalstack.io/v1/assets \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "orgId": "org_abc123",
    "type": "domain",
    "value": "example.com",
    "metadata": { "environment": "production" }
  }'`}
                  response={`{
  "id": "ast_8xk2m9",
  "orgId": "org_abc123",
  "type": "domain",
  "value": "example.com",
  "status": "active",
  "metadata": { "environment": "production" },
  "createdAt": "2026-03-20T10:15:00Z"
}`}
                />

                <EndpointCard
                  method="GET"
                  path="/api/v1/assets/:id"
                  description="Retrieve a single asset by its ID, including full metadata and scan history."
                  request={`curl -X GET https://api.signalstack.io/v1/assets/ast_8xk2m9 \\
  -H "Authorization: Bearer <token>"`}
                  response={`{
  "id": "ast_8xk2m9",
  "orgId": "org_abc123",
  "type": "domain",
  "value": "example.com",
  "status": "active",
  "metadata": {
    "registrar": "Cloudflare",
    "nameservers": ["ns1.cloudflare.com"],
    "environment": "production"
  },
  "findingsCount": 12,
  "lastScanned": "2026-03-18T14:30:00Z",
  "createdAt": "2026-01-15T09:00:00Z",
  "updatedAt": "2026-03-18T14:30:00Z"
}`}
                />

                <EndpointCard
                  method="PUT"
                  path="/api/v1/assets/:id"
                  description="Update an existing asset's metadata, status, or other properties."
                  body={[
                    { name: 'status', type: 'string', description: 'New status: active, inactive, archived' },
                    { name: 'metadata', type: 'object', description: 'Updated metadata (merged with existing)' },
                  ]}
                  request={`curl -X PUT https://api.signalstack.io/v1/assets/ast_8xk2m9 \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '{ "status": "inactive", "metadata": { "reason": "decommissioned" } }'`}
                  response={`{
  "id": "ast_8xk2m9",
  "status": "inactive",
  "metadata": {
    "registrar": "Cloudflare",
    "environment": "production",
    "reason": "decommissioned"
  },
  "updatedAt": "2026-03-20T11:00:00Z"
}`}
                />

                <EndpointCard
                  method="DELETE"
                  path="/api/v1/assets/:id"
                  description="Permanently delete an asset and all associated data. This action cannot be undone."
                  request={`curl -X DELETE https://api.signalstack.io/v1/assets/ast_8xk2m9 \\
  -H "Authorization: Bearer <token>"`}
                  response={`{
  "message": "Asset deleted successfully",
  "id": "ast_8xk2m9"
}`}
                />

                <EndpointCard
                  method="POST"
                  path="/api/v1/assets/:id/scan"
                  description="Trigger an on-demand security scan for the specified asset. The scan runs asynchronously and results are delivered via webhooks or can be polled."
                  request={`curl -X POST https://api.signalstack.io/v1/assets/ast_8xk2m9/scan \\
  -H "Authorization: Bearer <token>"`}
                  response={`{
  "scanId": "scn_4jf9a2",
  "assetId": "ast_8xk2m9",
  "status": "queued",
  "estimatedDuration": "5-10 minutes",
  "createdAt": "2026-03-20T11:05:00Z"
}`}
                />
              </div>
            </section>

            {/* ============================================================ */}
            {/*  FINDINGS                                                    */}
            {/* ============================================================ */}
            <section id="findings" className="space-y-6">
              <SectionHeading id="findings">Findings</SectionHeading>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Findings represent security issues discovered during scans. Each finding
                includes severity, status, and remediation guidance.
              </p>

              <div className="space-y-6">
                <EndpointCard
                  method="GET"
                  path="/api/v1/findings"
                  description="List all findings with optional filters. Results are paginated and sorted by severity (critical first)."
                  params={[
                    { name: 'orgId', type: 'string', description: 'Organisation ID (required)' },
                    { name: 'severity', type: 'string', description: 'Filter by severity: critical, high, medium, low, info' },
                    { name: 'status', type: 'string', description: 'Filter by status: open, in_progress, resolved, false_positive' },
                    { name: 'assetId', type: 'string', description: 'Filter by asset ID' },
                    { name: 'search', type: 'string', description: 'Full-text search across title and description' },
                    { name: 'page', type: 'integer', description: 'Page number (default: 1)' },
                    { name: 'limit', type: 'integer', description: 'Items per page (default: 25, max: 100)' },
                  ]}
                  request={`curl -X GET "https://api.signalstack.io/v1/findings?orgId=org_abc123&severity=critical&status=open" \\
  -H "Authorization: Bearer <token>"`}
                  response={`{
  "data": [
    {
      "id": "fnd_3kx8n1",
      "assetId": "ast_8xk2m9",
      "title": "SQL Injection in login form",
      "description": "The login endpoint is vulnerable to SQL injection via the username parameter.",
      "severity": "critical",
      "status": "open",
      "cvss": 9.8,
      "cwe": "CWE-89",
      "remediation": "Use parameterised queries or prepared statements.",
      "evidence": {
        "url": "https://example.com/login",
        "parameter": "username",
        "payload": "' OR 1=1 --"
      },
      "discoveredAt": "2026-03-18T14:32:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 25, "total": 3, "totalPages": 1 }
}`}
                />

                <EndpointCard
                  method="GET"
                  path="/api/v1/findings/:id"
                  description="Retrieve a single finding with full details including evidence, remediation steps, and audit trail."
                  request={`curl -X GET https://api.signalstack.io/v1/findings/fnd_3kx8n1 \\
  -H "Authorization: Bearer <token>"`}
                  response={`{
  "id": "fnd_3kx8n1",
  "assetId": "ast_8xk2m9",
  "title": "SQL Injection in login form",
  "severity": "critical",
  "status": "open",
  "cvss": 9.8,
  "cwe": "CWE-89",
  "description": "The login endpoint is vulnerable to SQL injection via the username parameter.",
  "remediation": "Use parameterised queries or prepared statements.",
  "evidence": {
    "url": "https://example.com/login",
    "parameter": "username",
    "payload": "' OR 1=1 --",
    "screenshot": "https://cdn.signalstack.io/evidence/scr_abc123.png"
  },
  "history": [
    { "action": "created", "user": "system", "timestamp": "2026-03-18T14:32:00Z" }
  ],
  "discoveredAt": "2026-03-18T14:32:00Z"
}`}
                />

                <EndpointCard
                  method="PUT"
                  path="/api/v1/findings/:id/status"
                  description="Update the status of a finding. Add optional notes to explain the status change."
                  body={[
                    { name: 'status', type: 'string', description: 'New status: open, in_progress, resolved, false_positive', required: true },
                    { name: 'notes', type: 'string', description: 'Explanation for the status change' },
                  ]}
                  request={`curl -X PUT https://api.signalstack.io/v1/findings/fnd_3kx8n1/status \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '{ "status": "resolved", "notes": "Patched in release v2.4.1" }'`}
                  response={`{
  "id": "fnd_3kx8n1",
  "status": "resolved",
  "notes": "Patched in release v2.4.1",
  "updatedBy": "usr_john42",
  "updatedAt": "2026-03-20T12:00:00Z"
}`}
                />

                <EndpointCard
                  method="GET"
                  path="/api/v1/findings/stats"
                  description="Get aggregated finding statistics for your organisation, grouped by severity and status."
                  request={`curl -X GET "https://api.signalstack.io/v1/findings/stats?orgId=org_abc123" \\
  -H "Authorization: Bearer <token>"`}
                  response={`{
  "total": 247,
  "bySeverity": {
    "critical": 5,
    "high": 23,
    "medium": 89,
    "low": 102,
    "info": 28
  },
  "byStatus": {
    "open": 45,
    "in_progress": 12,
    "resolved": 180,
    "false_positive": 10
  },
  "meanTimeToResolve": "4.2 days",
  "trend": { "last7Days": -12, "last30Days": -34 }
}`}
                />
              </div>
            </section>

            {/* ============================================================ */}
            {/*  REPORTS                                                     */}
            {/* ============================================================ */}
            <section id="reports" className="space-y-6">
              <SectionHeading id="reports">Reports</SectionHeading>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Generate, list, and download security reports. Reports can be filtered by
                severity, date range, and asset type.
              </p>

              <div className="space-y-6">
                <EndpointCard
                  method="POST"
                  path="/api/v1/reports/generate"
                  description="Generate a new security report. The report is created asynchronously; poll the report status or use webhooks for notification."
                  body={[
                    { name: 'orgId', type: 'string', description: 'Organisation ID', required: true },
                    { name: 'title', type: 'string', description: 'Report title', required: true },
                    { name: 'format', type: 'string', description: 'Output format: pdf, csv, json', required: true },
                    { name: 'filters', type: 'object', description: 'Optional filters: severity[], dateRange, assetIds[]' },
                  ]}
                  request={`curl -X POST https://api.signalstack.io/v1/reports/generate \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "orgId": "org_abc123",
    "title": "Q1 2026 Security Report",
    "format": "pdf",
    "filters": {
      "severity": ["critical", "high"],
      "dateRange": { "from": "2026-01-01", "to": "2026-03-31" }
    }
  }'`}
                  response={`{
  "id": "rpt_9vm3x2",
  "title": "Q1 2026 Security Report",
  "format": "pdf",
  "status": "generating",
  "createdAt": "2026-03-20T12:30:00Z"
}`}
                />

                <EndpointCard
                  method="GET"
                  path="/api/v1/reports"
                  description="List all generated reports for your organisation."
                  request={`curl -X GET "https://api.signalstack.io/v1/reports?orgId=org_abc123" \\
  -H "Authorization: Bearer <token>"`}
                  response={`{
  "data": [
    {
      "id": "rpt_9vm3x2",
      "title": "Q1 2026 Security Report",
      "format": "pdf",
      "status": "completed",
      "fileSize": "2.4 MB",
      "createdAt": "2026-03-20T12:30:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 25, "total": 8, "totalPages": 1 }
}`}
                />

                <EndpointCard
                  method="GET"
                  path="/api/v1/reports/:id/download"
                  description="Download a completed report. Returns a temporary signed URL valid for 15 minutes."
                  request={`curl -X GET https://api.signalstack.io/v1/reports/rpt_9vm3x2/download \\
  -H "Authorization: Bearer <token>"`}
                  response={`{
  "downloadUrl": "https://cdn.signalstack.io/reports/rpt_9vm3x2.pdf?sig=abc123&exp=1711020600",
  "expiresAt": "2026-03-20T13:00:00Z"
}`}
                />

                <EndpointCard
                  method="DELETE"
                  path="/api/v1/reports/:id"
                  description="Delete a report permanently."
                  request={`curl -X DELETE https://api.signalstack.io/v1/reports/rpt_9vm3x2 \\
  -H "Authorization: Bearer <token>"`}
                  response={`{
  "message": "Report deleted successfully",
  "id": "rpt_9vm3x2"
}`}
                />
              </div>
            </section>

            {/* ============================================================ */}
            {/*  WEBHOOKS                                                    */}
            {/* ============================================================ */}
            <section id="webhooks" className="space-y-6">
              <SectionHeading id="webhooks">Webhooks</SectionHeading>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Configure webhooks to receive real-time notifications when events occur in
                your SignalStack account. Webhooks are signed with HMAC-SHA256 for
                verification.
              </p>

              <div className="space-y-6">
                <EndpointCard
                  method="GET"
                  path="/api/v1/webhooks"
                  description="List all configured webhooks for your organisation."
                  request={`curl -X GET "https://api.signalstack.io/v1/webhooks?orgId=org_abc123" \\
  -H "Authorization: Bearer <token>"`}
                  response={`{
  "data": [
    {
      "id": "whk_7mn2p1",
      "url": "https://yourapp.com/webhooks/signalstack",
      "events": ["finding.created", "scan.completed"],
      "active": true,
      "secret": "whsec_••••••••••••",
      "createdAt": "2026-02-10T08:00:00Z"
    }
  ]
}`}
                />

                <EndpointCard
                  method="POST"
                  path="/api/v1/webhooks"
                  description="Create a new webhook endpoint."
                  body={[
                    { name: 'url', type: 'string', description: 'HTTPS URL to receive webhook payloads', required: true },
                    { name: 'events', type: 'string[]', description: 'Array of event types to subscribe to', required: true },
                    { name: 'orgId', type: 'string', description: 'Organisation ID', required: true },
                  ]}
                  request={`curl -X POST https://api.signalstack.io/v1/webhooks \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "orgId": "org_abc123",
    "url": "https://yourapp.com/webhooks/signalstack",
    "events": ["finding.created", "finding.status_changed", "scan.completed"]
  }'`}
                  response={`{
  "id": "whk_7mn2p1",
  "url": "https://yourapp.com/webhooks/signalstack",
  "events": ["finding.created", "finding.status_changed", "scan.completed"],
  "active": true,
  "secret": "whsec_a1b2c3d4e5f6g7h8i9j0",
  "createdAt": "2026-03-20T13:00:00Z"
}`}
                />

                <EndpointCard
                  method="PUT"
                  path="/api/v1/webhooks/:id"
                  description="Update webhook configuration (URL, events, or active status)."
                  request={`curl -X PUT https://api.signalstack.io/v1/webhooks/whk_7mn2p1 \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '{ "events": ["finding.created"], "active": false }'`}
                  response={`{
  "id": "whk_7mn2p1",
  "events": ["finding.created"],
  "active": false,
  "updatedAt": "2026-03-20T13:15:00Z"
}`}
                />

                <EndpointCard
                  method="DELETE"
                  path="/api/v1/webhooks/:id"
                  description="Delete a webhook endpoint."
                  request={`curl -X DELETE https://api.signalstack.io/v1/webhooks/whk_7mn2p1 \\
  -H "Authorization: Bearer <token>"`}
                  response={`{
  "message": "Webhook deleted successfully",
  "id": "whk_7mn2p1"
}`}
                />

                <EndpointCard
                  method="POST"
                  path="/api/v1/webhooks/:id/test"
                  description="Send a test payload to the webhook URL to verify it is correctly configured."
                  request={`curl -X POST https://api.signalstack.io/v1/webhooks/whk_7mn2p1/test \\
  -H "Authorization: Bearer <token>"`}
                  response={`{
  "success": true,
  "statusCode": 200,
  "responseTime": "142ms"
}`}
                />
              </div>

              <SubHeading>Webhook Events</SubHeading>
              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700/50">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700/50 bg-gray-50 dark:bg-gray-800/60">
                      <th className="px-4 py-2.5 text-left font-medium text-gray-600 dark:text-gray-400">
                        Event
                      </th>
                      <th className="px-4 py-2.5 text-left font-medium text-gray-600 dark:text-gray-400">
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800/40">
                    {[
                      ['finding.created', 'A new security finding was discovered'],
                      ['finding.status_changed', 'A finding status was updated'],
                      ['asset.created', 'A new asset was added'],
                      ['asset.deleted', 'An asset was removed'],
                      ['scan.completed', 'A scan has finished running'],
                      ['report.generated', 'A report has been generated and is ready'],
                    ].map(([event, desc]) => (
                      <tr
                        key={event}
                        className="border-b border-gray-200 dark:border-gray-700/50 last:border-0"
                      >
                        <td className="px-4 py-2.5 font-mono text-xs text-brand-400">
                          {event}
                        </td>
                        <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <SubHeading>Webhook Payload Format</SubHeading>
              <CodeBlock
                code={`{
  "id": "evt_x9k2m1",
  "type": "finding.created",
  "timestamp": "2026-03-20T14:00:00Z",
  "data": {
    "id": "fnd_3kx8n1",
    "title": "SQL Injection in login form",
    "severity": "critical",
    "assetId": "ast_8xk2m9"
  }
}`}
                language="json"
              />

              <SubHeading>Signature Verification</SubHeading>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Every webhook request includes an{' '}
                <code className="rounded bg-gray-200 px-1.5 py-0.5 text-xs dark:bg-gray-700">
                  X-SignalStack-Signature
                </code>{' '}
                header containing an HMAC-SHA256 signature. Verify it to ensure the request
                is authentic:
              </p>
              <CodeBlock
                code={`const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

// In your Express handler:
app.post('/webhooks/signalstack', (req, res) => {
  const signature = req.headers['x-signalstack-signature'];
  const isValid = verifyWebhookSignature(
    JSON.stringify(req.body),
    signature,
    process.env.WEBHOOK_SECRET
  );

  if (!isValid) {
    return res.status(401).send('Invalid signature');
  }

  // Process the webhook event
  const { type, data } = req.body;
  console.log(\`Received event: \${type}\`, data);

  res.status(200).send('OK');
});`}
                language="javascript"
              />
            </section>

            {/* ============================================================ */}
            {/*  API TOKENS                                                  */}
            {/* ============================================================ */}
            <section id="api-tokens" className="space-y-6">
              <SectionHeading id="api-tokens">API Tokens</SectionHeading>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Manage authentication tokens. JWTs are issued on login and expire after 24
                hours. Refresh tokens can be used to obtain new access tokens without
                re-authenticating.
              </p>

              <div className="space-y-6">
                <EndpointCard
                  method="POST"
                  path="/api/v1/auth/login"
                  description="Authenticate with email and password to receive a JWT access token."
                  body={[
                    { name: 'email', type: 'string', description: 'Account email address', required: true },
                    { name: 'password', type: 'string', description: 'Account password', required: true },
                  ]}
                  request={`curl -X POST https://api.signalstack.io/v1/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{ "email": "user@example.com", "password": "your-password" }'`}
                  response={`{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "rt_a1b2c3d4e5f6",
  "expiresIn": 86400,
  "user": {
    "id": "usr_john42",
    "email": "user@example.com",
    "name": "John Doe"
  }
}`}
                />

                <EndpointCard
                  method="POST"
                  path="/api/v1/auth/register"
                  description="Create a new user account."
                  body={[
                    { name: 'name', type: 'string', description: 'Full name', required: true },
                    { name: 'email', type: 'string', description: 'Email address', required: true },
                    { name: 'password', type: 'string', description: 'Password (min 8 chars, 1 uppercase, 1 number)', required: true },
                  ]}
                  request={`curl -X POST https://api.signalstack.io/v1/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "password": "SecureP4ss!"
  }'`}
                  response={`{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "usr_jane99",
    "email": "jane@example.com",
    "name": "Jane Smith"
  }
}`}
                />

                <EndpointCard
                  method="GET"
                  path="/api/v1/auth/me"
                  description="Get the currently authenticated user's profile."
                  request={`curl -X GET https://api.signalstack.io/v1/auth/me \\
  -H "Authorization: Bearer <token>"`}
                  response={`{
  "id": "usr_john42",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "admin",
  "organisations": [
    { "id": "org_abc123", "name": "Acme Corp", "role": "owner" }
  ],
  "createdAt": "2025-11-01T09:00:00Z"
}`}
                />
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-500/30 dark:bg-blue-500/5">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Token format:</strong> Access tokens are JSON Web Tokens (JWT)
                  signed with HS256. They expire after <strong>24 hours</strong>. Use the{' '}
                  <code className="rounded bg-blue-200/60 px-1 py-0.5 text-xs dark:bg-blue-800/40">
                    refreshToken
                  </code>{' '}
                  to obtain a new access token without requiring the user to log in again.
                </p>
              </div>
            </section>

            {/* ============================================================ */}
            {/*  ORGANISATIONS                                               */}
            {/* ============================================================ */}
            <section id="organisations" className="space-y-6">
              <SectionHeading id="organisations">Organisations</SectionHeading>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Organisations are the top-level container for all resources. Users can belong
                to multiple organisations with different roles.
              </p>

              <div className="space-y-6">
                <EndpointCard
                  method="GET"
                  path="/api/v1/organisations"
                  description="List all organisations the current user belongs to."
                  request={`curl -X GET https://api.signalstack.io/v1/organisations \\
  -H "Authorization: Bearer <token>"`}
                  response={`{
  "data": [
    {
      "id": "org_abc123",
      "name": "Acme Corp",
      "plan": "pro",
      "memberCount": 12,
      "assetCount": 142,
      "createdAt": "2025-06-15T09:00:00Z"
    }
  ]
}`}
                />

                <EndpointCard
                  method="POST"
                  path="/api/v1/organisations"
                  description="Create a new organisation. The creating user becomes the owner."
                  body={[
                    { name: 'name', type: 'string', description: 'Organisation name', required: true },
                  ]}
                  request={`curl -X POST https://api.signalstack.io/v1/organisations \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '{ "name": "New Startup Inc" }'`}
                  response={`{
  "id": "org_def456",
  "name": "New Startup Inc",
  "plan": "free",
  "memberCount": 1,
  "createdAt": "2026-03-20T14:00:00Z"
}`}
                />

                <EndpointCard
                  method="GET"
                  path="/api/v1/organisations/:orgId/members"
                  description="List all members of an organisation with their roles."
                  request={`curl -X GET https://api.signalstack.io/v1/organisations/org_abc123/members \\
  -H "Authorization: Bearer <token>"`}
                  response={`{
  "data": [
    {
      "userId": "usr_john42",
      "name": "John Doe",
      "email": "john@acmecorp.com",
      "role": "owner",
      "joinedAt": "2025-06-15T09:00:00Z"
    },
    {
      "userId": "usr_jane99",
      "name": "Jane Smith",
      "email": "jane@acmecorp.com",
      "role": "member",
      "joinedAt": "2025-07-01T10:00:00Z"
    }
  ]
}`}
                />

                <EndpointCard
                  method="POST"
                  path="/api/v1/organisations/:orgId/invite"
                  description="Invite a new member to the organisation by email. An invitation email is sent automatically."
                  body={[
                    { name: 'email', type: 'string', description: 'Email address to invite', required: true },
                    { name: 'role', type: 'string', description: 'Role: admin, member, viewer (default: member)' },
                  ]}
                  request={`curl -X POST https://api.signalstack.io/v1/organisations/org_abc123/invite \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '{ "email": "newmember@acmecorp.com", "role": "member" }'`}
                  response={`{
  "message": "Invitation sent successfully",
  "inviteId": "inv_k2m9x1",
  "email": "newmember@acmecorp.com",
  "expiresAt": "2026-03-27T14:00:00Z"
}`}
                />
              </div>
            </section>

            {/* ============================================================ */}
            {/*  QUICK START GUIDE                                           */}
            {/* ============================================================ */}
            <section id="quick-start" className="space-y-6">
              <SectionHeading id="quick-start">Quick Start Guide</SectionHeading>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Get up and running with SignalStack in five minutes. This guide walks you
                through your first API integration.
              </p>

              <div className="space-y-8">
                {/* Step 1 */}
                <div className="relative border-l-2 border-brand-500 pl-6">
                  <div className="absolute -left-3 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                    1
                  </div>
                  <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                    Register for an account
                  </h4>
                  <p className="mt-1 text-sm text-gray-500">
                    Create your account and get an access token.
                  </p>
                  <div className="mt-3">
                    <CodeBlock
                      code={`curl -X POST https://api.signalstack.io/v1/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Your Name",
    "email": "you@company.com",
    "password": "SecureP4ss!"
  }'

# Save the token from the response
export SIGNALSTACK_TOKEN="eyJhbG..."`}
                      language="bash"
                    />
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative border-l-2 border-brand-500 pl-6">
                  <div className="absolute -left-3 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                    2
                  </div>
                  <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                    Create an organisation
                  </h4>
                  <p className="mt-1 text-sm text-gray-500">
                    Organisations group your assets, findings, and team members.
                  </p>
                  <div className="mt-3">
                    <CodeBlock
                      code={`curl -X POST https://api.signalstack.io/v1/organisations \\
  -H "Authorization: Bearer $SIGNALSTACK_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{ "name": "My Company" }'

# Note the org ID from the response: org_abc123`}
                      language="bash"
                    />
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative border-l-2 border-brand-500 pl-6">
                  <div className="absolute -left-3 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                    3
                  </div>
                  <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                    Add your first asset
                  </h4>
                  <p className="mt-1 text-sm text-gray-500">
                    Register a domain, IP, or web application to monitor.
                  </p>
                  <div className="mt-3">
                    <CodeBlock
                      code={`curl -X POST https://api.signalstack.io/v1/assets \\
  -H "Authorization: Bearer $SIGNALSTACK_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "orgId": "org_abc123",
    "type": "domain",
    "value": "yourcompany.com"
  }'`}
                      language="bash"
                    />
                  </div>
                </div>

                {/* Step 4 */}
                <div className="relative border-l-2 border-brand-500 pl-6">
                  <div className="absolute -left-3 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                    4
                  </div>
                  <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                    View findings
                  </h4>
                  <p className="mt-1 text-sm text-gray-500">
                    After a scan completes, check for discovered vulnerabilities.
                  </p>
                  <div className="mt-3">
                    <CodeBlock
                      code={`# Trigger a scan
curl -X POST https://api.signalstack.io/v1/assets/ast_8xk2m9/scan \\
  -H "Authorization: Bearer $SIGNALSTACK_TOKEN"

# Check findings (after scan completes)
curl -X GET "https://api.signalstack.io/v1/findings?orgId=org_abc123&severity=critical" \\
  -H "Authorization: Bearer $SIGNALSTACK_TOKEN"`}
                      language="bash"
                    />
                  </div>
                </div>

                {/* Step 5 */}
                <div className="relative border-l-2 border-brand-500 pl-6">
                  <div className="absolute -left-3 top-0 flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                    5
                  </div>
                  <h4 className="text-base font-semibold text-gray-900 dark:text-white">
                    Set up webhook notifications
                  </h4>
                  <p className="mt-1 text-sm text-gray-500">
                    Get notified in real-time when new findings are discovered.
                  </p>
                  <div className="mt-3">
                    <CodeBlock
                      code={`curl -X POST https://api.signalstack.io/v1/webhooks \\
  -H "Authorization: Bearer $SIGNALSTACK_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "orgId": "org_abc123",
    "url": "https://yourapp.com/webhooks/signalstack",
    "events": ["finding.created", "scan.completed"]
  }'`}
                      language="bash"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* ============================================================ */}
            {/*  WEBHOOK SETUP GUIDE                                         */}
            {/* ============================================================ */}
            <section id="webhook-setup" className="space-y-6">
              <SectionHeading id="webhook-setup">Webhook Setup Guide</SectionHeading>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                This guide covers how to set up, verify, and handle webhooks from
                SignalStack.
              </p>

              <SubHeading>1. Configure Your Endpoint</SubHeading>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your webhook endpoint must be a publicly accessible HTTPS URL that accepts
                POST requests and returns a{' '}
                <code className="rounded bg-gray-200 px-1.5 py-0.5 text-xs dark:bg-gray-700">
                  200
                </code>{' '}
                status within 30 seconds.
              </p>

              <SubHeading>2. Register the Webhook</SubHeading>
              <CodeBlock
                code={`curl -X POST https://api.signalstack.io/v1/webhooks \\
  -H "Authorization: Bearer $SIGNALSTACK_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "orgId": "org_abc123",
    "url": "https://yourapp.com/webhooks/signalstack",
    "events": ["finding.created", "finding.status_changed", "scan.completed"]
  }'

# Save the secret from the response for signature verification`}
                language="bash"
              />

              <SubHeading>3. Verify Webhook Signatures</SubHeading>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Always verify webhook signatures to ensure requests are genuinely from
                SignalStack. Here is a complete Node.js / Express example:
              </p>
              <CodeBlock
                code={`const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

const WEBHOOK_SECRET = process.env.SIGNALSTACK_WEBHOOK_SECRET;

function verifySignature(payload, signature) {
  const expected = crypto
    .createHmac('sha256', WEBHOOK_SECRET)
    .update(JSON.stringify(payload), 'utf8')
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature, 'utf8'),
    Buffer.from(expected, 'utf8')
  );
}

app.post('/webhooks/signalstack', (req, res) => {
  const signature = req.headers['x-signalstack-signature'];

  if (!signature || !verifySignature(req.body, signature)) {
    console.error('Invalid webhook signature');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const { type, data } = req.body;

  switch (type) {
    case 'finding.created':
      console.log('New finding:', data.title, '- Severity:', data.severity);
      // Create a Jira ticket, send a Slack message, etc.
      break;
    case 'scan.completed':
      console.log('Scan finished for asset:', data.assetId);
      break;
    default:
      console.log('Unhandled event type:', type);
  }

  res.status(200).json({ received: true });
});

app.listen(3000, () => console.log('Webhook server running on port 3000'));`}
                language="javascript"
              />

              <SubHeading>4. Handling Retries</SubHeading>
              <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700/60 dark:bg-gray-800/40">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  If your endpoint does not return a{' '}
                  <code className="rounded bg-gray-200 px-1.5 py-0.5 text-xs dark:bg-gray-700">
                    2xx
                  </code>{' '}
                  status, SignalStack will retry delivery with exponential backoff:
                </p>
                <ul className="mt-3 space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-400" />
                    Retry 1: after 1 minute
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-400" />
                    Retry 2: after 5 minutes
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-400" />
                    Retry 3: after 30 minutes
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-400" />
                    Retry 4: after 2 hours
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-brand-400" />
                    Retry 5 (final): after 24 hours
                  </li>
                </ul>
                <p className="mt-3 text-sm text-gray-500">
                  After 5 failed attempts, the webhook is automatically disabled and the
                  organisation owner is notified via email.
                </p>
              </div>
            </section>

            {/* ============================================================ */}
            {/*  CI/CD INTEGRATION GUIDE                                     */}
            {/* ============================================================ */}
            <section id="cicd-integration" className="space-y-6">
              <SectionHeading id="cicd-integration">CI/CD Integration</SectionHeading>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                Integrate SignalStack into your CI/CD pipelines to automatically scan assets
                on every deployment and block releases with critical vulnerabilities.
              </p>

              <SubHeading>GitHub Actions Workflow</SubHeading>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Add this workflow to{' '}
                <code className="rounded bg-gray-200 px-1.5 py-0.5 text-xs dark:bg-gray-700">
                  .github/workflows/security-scan.yml
                </code>{' '}
                to scan on every push to main:
              </p>
              <CodeBlock
                code={`name: SignalStack Security Scan

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  security-scan:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger scan
        id: scan
        run: |
          RESPONSE=$(curl -s -X POST \\
            https://api.signalstack.io/v1/assets/\${{ secrets.ASSET_ID }}/scan \\
            -H "Authorization: Bearer \${{ secrets.SIGNALSTACK_TOKEN }}")
          SCAN_ID=$(echo $RESPONSE | jq -r '.scanId')
          echo "scan_id=$SCAN_ID" >> $GITHUB_OUTPUT

      - name: Wait for scan completion
        run: |
          for i in {1..30}; do
            STATUS=$(curl -s \\
              "https://api.signalstack.io/v1/scans/\${{ steps.scan.outputs.scan_id }}" \\
              -H "Authorization: Bearer \${{ secrets.SIGNALSTACK_TOKEN }}" \\
              | jq -r '.status')
            if [ "$STATUS" = "completed" ]; then
              echo "Scan completed"
              break
            fi
            echo "Scan status: $STATUS — waiting 30s..."
            sleep 30
          done

      - name: Check for critical findings
        run: |
          CRITICAL=$(curl -s \\
            "https://api.signalstack.io/v1/findings?orgId=\${{ secrets.ORG_ID }}&severity=critical&status=open" \\
            -H "Authorization: Bearer \${{ secrets.SIGNALSTACK_TOKEN }}" \\
            | jq '.pagination.total')
          echo "Critical findings: $CRITICAL"
          if [ "$CRITICAL" -gt 0 ]; then
            echo "::error::$CRITICAL critical vulnerabilities found — blocking deployment"
            exit 1
          fi`}
                language="yaml"
              />

              <SubHeading>Automated Scan Script</SubHeading>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Use this shell script in any CI/CD platform (GitLab CI, Jenkins, CircleCI,
                etc.):
              </p>
              <CodeBlock
                code={`#!/bin/bash
set -e

API_URL="https://api.signalstack.io/v1"
TOKEN="$SIGNALSTACK_TOKEN"
ASSET_ID="$SIGNALSTACK_ASSET_ID"
ORG_ID="$SIGNALSTACK_ORG_ID"

echo "==> Triggering security scan..."
SCAN=$(curl -sf -X POST "$API_URL/assets/$ASSET_ID/scan" \\
  -H "Authorization: Bearer $TOKEN")
SCAN_ID=$(echo "$SCAN" | jq -r '.scanId')
echo "    Scan ID: $SCAN_ID"

echo "==> Waiting for scan to complete..."
while true; do
  STATUS=$(curl -sf "$API_URL/scans/$SCAN_ID" \\
    -H "Authorization: Bearer $TOKEN" | jq -r '.status')
  [ "$STATUS" = "completed" ] && break
  [ "$STATUS" = "failed" ] && echo "Scan failed!" && exit 1
  sleep 15
done

echo "==> Checking for critical vulnerabilities..."
CRITICAL=$(curl -sf "$API_URL/findings?orgId=$ORG_ID&severity=critical&status=open" \\
  -H "Authorization: Bearer $TOKEN" | jq '.pagination.total')

if [ "$CRITICAL" -gt 0 ]; then
  echo "BLOCKED: $CRITICAL critical vulnerabilities found."
  exit 1
fi

echo "PASSED: No critical vulnerabilities found."
exit 0`}
                language="bash"
              />

              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/5">
                <p className="text-sm text-emerald-800 dark:text-emerald-300">
                  <strong>Tip:</strong> Store your{' '}
                  <code className="rounded bg-emerald-200/60 px-1 py-0.5 text-xs dark:bg-emerald-800/40">
                    SIGNALSTACK_TOKEN
                  </code>{' '}
                  and{' '}
                  <code className="rounded bg-emerald-200/60 px-1 py-0.5 text-xs dark:bg-emerald-800/40">
                    ASSET_ID
                  </code>{' '}
                  as encrypted secrets in your CI/CD platform. Never hardcode credentials in
                  your pipeline configuration.
                </p>
              </div>
            </section>

            {/* Bottom spacer */}
            <div className="pb-16" />
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
