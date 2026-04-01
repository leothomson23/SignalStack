'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Globe,
  ShieldCheck,
  BarChart3,
  Workflow,
  FileText,
  Shield,
  ArrowRight,
  CheckCircle2,
  Server,
  Cloud,
  Wifi,
  Code2,
  AlertTriangle,
  Lock,
  ShieldAlert,
  Radio,
  Bell,
  Send,
  Calendar,
  Users,
  Key,
  ClipboardList,
  Building2,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Mock UI Components                                                 */
/* ------------------------------------------------------------------ */

function MockAssetList() {
  const assets = [
    { name: 'api.signalstack.io', type: 'API', icon: Code2, status: 'Active', statusColor: 'bg-green-500' },
    { name: 'app.signalstack.io', type: 'Domain', icon: Globe, status: 'Active', statusColor: 'bg-green-500' },
    { name: '10.0.1.0/24', type: 'IP Range', icon: Server, status: 'Scanning', statusColor: 'bg-yellow-500' },
    { name: 'aws-prod-us-east', type: 'Cloud', icon: Cloud, status: 'Active', statusColor: 'bg-green-500' },
    { name: 'mqtt.devices.io', type: 'IoT', icon: Wifi, status: 'Monitoring', statusColor: 'bg-blue-500' },
  ];
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-900 dark:text-white">Discovered Assets</span>
        <span className="text-xs font-medium text-brand-600 dark:text-brand-400">247 total</span>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {assets.map((a) => (
          <div key={a.name} className="flex items-center gap-3 px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              <a.icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{a.name}</p>
              <p className="text-xs text-gray-500">{a.type}</p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-400">
              <span className={`h-1.5 w-1.5 rounded-full ${a.statusColor}`} />
              {a.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockScanResults() {
  const findings = [
    { title: 'Expired SSL Certificate', severity: 'Critical', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400', host: 'api.example.com' },
    { title: 'Missing HSTS Header', severity: 'High', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400', host: 'app.example.com' },
    { title: 'Open Port 8080', severity: 'Medium', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400', host: '10.0.1.15' },
    { title: 'TLS 1.0 Enabled', severity: 'High', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400', host: 'legacy.example.com' },
    { title: 'Outdated jQuery 2.1.4', severity: 'Low', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400', host: 'marketing.example.com' },
  ];
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-900 dark:text-white">Latest Scan Results</span>
        <span className="text-xs text-gray-500">2 min ago</span>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {findings.map((f) => (
          <div key={f.title} className="flex items-center gap-3 px-4 py-3">
            <AlertTriangle className="h-4 w-4 text-gray-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{f.title}</p>
              <p className="text-xs text-gray-500">{f.host}</p>
            </div>
            <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${f.color}`}>
              {f.severity}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockFindingsDashboard() {
  const bars = [
    { label: 'Critical', count: 3, pct: 12, color: 'bg-red-500' },
    { label: 'High', count: 12, pct: 48, color: 'bg-orange-500' },
    { label: 'Medium', count: 27, pct: 70, color: 'bg-yellow-500' },
    { label: 'Low', count: 18, pct: 55, color: 'bg-blue-500' },
    { label: 'Info', count: 41, pct: 90, color: 'bg-gray-400' },
  ];
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-900 dark:text-white">Findings by Severity</span>
        <span className="text-xs font-medium text-brand-600 dark:text-brand-400">101 total</span>
      </div>
      <div className="px-4 py-4 space-y-3">
        {bars.map((b) => (
          <div key={b.label} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-gray-700 dark:text-gray-300">{b.label}</span>
              <span className="text-gray-500">{b.count}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
              <div className={`h-2 rounded-full ${b.color}`} style={{ width: `${b.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockWebhookConfig() {
  const hooks = [
    { name: 'Slack - #security-alerts', status: 'Active', icon: Bell, last: '2 min ago' },
    { name: 'PagerDuty - Critical', status: 'Active', icon: ShieldAlert, last: '14 min ago' },
    { name: 'Jira - Auto Ticket', status: 'Paused', icon: ClipboardList, last: '1 hr ago' },
    { name: 'Custom Webhook', status: 'Active', icon: Send, last: '5 min ago' },
  ];
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-900 dark:text-white">Integrations</span>
        <span className="text-xs text-brand-600 dark:text-brand-400 font-medium cursor-pointer">+ Add</span>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {hooks.map((h) => (
          <div key={h.name} className="flex items-center gap-3 px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400">
              <h.icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{h.name}</p>
              <p className="text-xs text-gray-500">Last triggered {h.last}</p>
            </div>
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                h.status === 'Active'
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}
            >
              {h.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Feature Section Data                                               */
/* ------------------------------------------------------------------ */

interface BulletItem {
  text: string;
}

interface FeatureSection {
  icon: React.ElementType;
  title: string;
  description: string;
  bullets: BulletItem[];
  visual: React.ReactNode;
  visualPosition: 'right' | 'left';
}

const features: FeatureSection[] = [
  {
    icon: Globe,
    title: 'Asset Discovery & Inventory',
    description:
      'Automatically discover and catalogue every asset across your attack surface. From shadow IT to forgotten subdomains, get a complete, always-up-to-date inventory without manual effort.',
    bullets: [
      { text: 'Automatic subdomain enumeration' },
      { text: 'Cloud provider integration (AWS, GCP, Azure)' },
      { text: 'IP range scanning and CIDR support' },
      { text: 'API endpoint discovery' },
    ],
    visual: <MockAssetList />,
    visualPosition: 'right',
  },
  {
    icon: ShieldCheck,
    title: 'Continuous Vulnerability Scanning',
    description:
      'Run 24/7 vulnerability scans against your entire asset inventory. Detect misconfigurations, exposed services, and known CVEs before attackers do.',
    bullets: [
      { text: 'CVE database integration' },
      { text: 'SSL/TLS configuration analysis' },
      { text: 'Security header validation' },
      { text: 'Open port detection' },
    ],
    visual: <MockScanResults />,
    visualPosition: 'left',
  },
  {
    icon: BarChart3,
    title: 'Intelligence & Findings',
    description:
      'Turn raw scan data into actionable intelligence. AI-powered analysis prioritizes what matters most so your team focuses on real risk, not noise.',
    bullets: [
      { text: 'AI-powered severity scoring' },
      { text: 'Confidence-based prioritization' },
      { text: 'Asset correlation' },
      { text: 'Historical trend analysis' },
    ],
    visual: <MockFindingsDashboard />,
    visualPosition: 'right',
  },
  {
    icon: Workflow,
    title: 'Automation & Integrations',
    description:
      'Connect SignalStack to your existing workflow. Push findings to Slack, create Jira tickets automatically, and trigger custom webhooks with HMAC-signed payloads.',
    bullets: [
      { text: 'Webhook delivery with HMAC signing' },
      { text: 'Slack, PagerDuty, Jira integration' },
      { text: 'Custom API workflows' },
      { text: 'Scheduled reporting' },
    ],
    visual: <MockWebhookConfig />,
    visualPosition: 'left',
  },
  {
    icon: FileText,
    title: 'Reporting & Compliance',
    description:
      'Generate boardroom-ready reports in seconds. Map findings to compliance frameworks and prove your security posture with auditable exports.',
    bullets: [
      { text: 'PDF, CSV, and JSON export' },
      { text: 'Custom date range filtering' },
      { text: 'SOC 2 / ISO 27001 templates' },
      { text: 'Automated scheduled reports' },
    ],
    visual: null,
    visualPosition: 'right',
  },
  {
    icon: Shield,
    title: 'Team & Access Control',
    description:
      'Enterprise-grade access management. Define who sees what with role-based permissions and keep a complete audit trail of every action.',
    bullets: [
      { text: 'Role-based access (Admin, Analyst, Viewer)' },
      { text: 'Organisation-based multi-tenancy' },
      { text: 'Audit logging' },
      { text: 'API token management' },
    ],
    visual: null,
    visualPosition: 'left',
  },
];

/* ------------------------------------------------------------------ */
/*  Reporting Mock                                                     */
/* ------------------------------------------------------------------ */

function MockReportingUI() {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-900 dark:text-white">Reports</span>
        <span className="text-xs font-medium text-brand-600 dark:text-brand-400">Generate</span>
      </div>
      <div className="px-4 py-4 space-y-3">
        {[
          { name: 'Q4 2025 Security Summary', format: 'PDF', date: 'Dec 31, 2025' },
          { name: 'SOC 2 Evidence Pack', format: 'ZIP', date: 'Dec 15, 2025' },
          { name: 'Monthly Vulnerability Report', format: 'CSV', date: 'Dec 1, 2025' },
          { name: 'ISO 27001 Controls Mapping', format: 'PDF', date: 'Nov 28, 2025' },
        ].map((r) => (
          <div key={r.name} className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400">
              <FileText className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{r.name}</p>
              <p className="text-xs text-gray-500">{r.date}</p>
            </div>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 rounded px-1.5 py-0.5">
              {r.format}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MockTeamUI() {
  const members = [
    { name: 'Sarah Chen', role: 'Admin', initials: 'SC', color: 'bg-brand-500' },
    { name: 'James Miller', role: 'Analyst', initials: 'JM', color: 'bg-emerald-500' },
    { name: 'Priya Patel', role: 'Analyst', initials: 'PP', color: 'bg-amber-500' },
    { name: 'Alex Kim', role: 'Viewer', initials: 'AK', color: 'bg-rose-500' },
  ];
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-900 dark:text-white">Team Members</span>
        <span className="text-xs font-medium text-brand-600 dark:text-brand-400">Invite</span>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {members.map((m) => (
          <div key={m.name} className="flex items-center gap-3 px-4 py-3">
            <div className={`flex h-8 w-8 items-center justify-center rounded-full text-white text-xs font-bold ${m.color}`}>
              {m.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{m.name}</p>
            </div>
            <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 rounded-full px-2.5 py-0.5">
              {m.role}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function FeaturesPage() {
  // Assign visuals to the last two sections that had null
  const enrichedFeatures = features.map((f) => {
    if (f.title === 'Reporting & Compliance') return { ...f, visual: <MockReportingUI /> };
    if (f.title === 'Team & Access Control') return { ...f, visual: <MockTeamUI /> };
    return f;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center rounded-full border border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-950/50 px-3 py-1 text-xs font-semibold text-brand-700 dark:text-brand-300 mb-6">
            Platform Capabilities
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white">
            Platform Features
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Everything your security team needs to identify, prioritize, and remediate threats across your attack surface.
          </p>
        </div>
      </section>

      {/* Feature Sections */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-32 space-y-32">
        {enrichedFeatures.map((feature, idx) => {
          const IconComp = feature.icon;
          const textOnLeft = feature.visualPosition === 'right';

          const textBlock = (
            <div className="flex flex-col justify-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 mb-6">
                <IconComp className="h-6 w-6" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {feature.title}
              </h2>
              <p className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                {feature.description}
              </p>
              <ul className="mt-6 space-y-3">
                {feature.bullets.map((b) => (
                  <li key={b.text} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-brand-600 dark:text-brand-400 mt-0.5 shrink-0" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{b.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          );

          const visualBlock = (
            <div className="flex items-center justify-center">
              {feature.visual}
            </div>
          );

          return (
            <div
              key={feature.title}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center"
            >
              {textOnLeft ? (
                <>
                  {textBlock}
                  {visualBlock}
                </>
              ) : (
                <>
                  <div className="order-2 lg:order-1">{visualBlock}</div>
                  <div className="order-1 lg:order-2">{textBlock}</div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <section className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
        <div className="mx-auto max-w-4xl text-center py-20 px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Ready to get started?
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
            Start securing your attack surface in minutes. No credit card required.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-950"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-6 py-3 text-sm font-semibold text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
