'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Globe,
  ShieldAlert,
  Bell,
  FileText,
  Users,
  Code,
  ArrowRight,
  Activity,
  Shield,
  Search,
  BarChart3,
  AlertTriangle,
  Layers,
  Terminal,
} from 'lucide-react';

const features = [
  {
    icon: Globe,
    title: 'Asset Discovery',
    description:
      'Automatically discover and inventory your external attack surface including domains, IPs, APIs, and cloud services.',
  },
  {
    icon: ShieldAlert,
    title: 'Vulnerability Detection',
    description:
      'Continuous scanning detects misconfigurations, exposed services, and known CVEs across your infrastructure.',
  },
  {
    icon: Bell,
    title: 'Real-time Alerts',
    description:
      'Instant notifications via Slack, PagerDuty, or webhooks when critical findings are detected.',
  },
  {
    icon: FileText,
    title: 'Compliance Reporting',
    description:
      'Generate audit-ready reports for SOC 2, ISO 27001, and PCI-DSS with one click.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description:
      'Role-based access control lets analysts, engineers, and executives work together securely.',
  },
  {
    icon: Code,
    title: 'API-First Design',
    description:
      'Full REST API with SDKs for Python, Go, and JavaScript. Integrate with your existing toolchain.',
  },
];

const testimonials = [
  {
    quote:
      'SignalStack cut our mean time to detect from days to minutes. The asset discovery alone saved us hundreds of hours.',
    name: 'Sarah Chen',
    title: 'Head of Security',
    company: 'Meridian Labs',
  },
  {
    quote:
      'We replaced three separate tools with SignalStack. The unified dashboard and API made our security operations significantly more efficient.',
    name: 'Marcus Torres',
    title: 'CISO',
    company: 'Apex Systems',
  },
  {
    quote:
      'The webhook integrations are fantastic. We have findings flowing directly into our Jira and Slack workflows automatically.',
    name: 'Priya Patel',
    title: 'Security Engineer',
    company: 'Northstar AI',
  },
];

const trustLogos = [
  'Acme Corp',
  'TechStart',
  'GlobalSec',
  'Meridian Labs',
  'Apex Systems',
  'Northstar AI',
];

const mockFindings = [
  { id: 'FIND-2847', title: 'TLS certificate expiring in 7 days', severity: 'High', asset: 'api.acme.com', status: 'Open' },
  { id: 'FIND-2843', title: 'Open SSH port detected (22/tcp)', severity: 'Critical', asset: '10.0.4.12', status: 'Open' },
  { id: 'FIND-2841', title: 'HTTP Security headers missing', severity: 'Medium', asset: 'app.acme.com', status: 'In Progress' },
  { id: 'FIND-2839', title: 'Outdated nginx version (1.18.0)', severity: 'High', asset: 'cdn.acme.com', status: 'Open' },
  { id: 'FIND-2835', title: 'CORS misconfiguration detected', severity: 'Medium', asset: 'api.acme.com', status: 'Resolved' },
];

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    Critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    High: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${colors[severity] || colors.Low}`}>
      {severity}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Open: 'text-red-400',
    'In Progress': 'text-yellow-400',
    Resolved: 'text-green-400',
  };
  return <span className={`text-xs font-medium ${colors[status] || 'text-gray-400'}`}>{status}</span>;
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />

      {/* ===================== HERO ===================== */}
      <section className="relative overflow-hidden pt-16">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-brand-950/50 to-gray-950" />
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-brand-600/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-brand-500/5 rounded-full blur-3xl" />
        </div>
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-32 text-center">
          {/* Announcement pill */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-sm text-brand-300 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-500" />
            </span>
            New: AI-Powered Threat Detection
            <Link href="/features" className="inline-flex items-center font-medium text-brand-200 hover:text-white transition-colors">
              Read more <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </div>

          {/* Heading */}
          <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
              Monitor, Detect, and Respond to Security Threats
            </span>
          </h1>

          {/* Subheading */}
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400 leading-relaxed sm:text-xl">
            SignalStack provides continuous asset monitoring, real-time vulnerability detection, and actionable intelligence for modern security teams.
          </p>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 hover:bg-brand-500 transition-all hover:shadow-brand-500/30 hover:shadow-xl"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-lg border border-gray-600 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/10 hover:border-gray-500 transition-all"
            >
              Book a Demo
            </Link>
          </div>

          {/* Trust note */}
          <p className="mt-6 text-sm text-gray-500">
            No credit card required &middot; 14-day free trial &middot; Cancel anytime
          </p>

          {/* Mock Dashboard Screenshot */}
          <div className="mx-auto mt-16 max-w-5xl">
            <div className="relative rounded-xl border border-gray-700/50 bg-gray-900/80 p-1 shadow-2xl shadow-brand-500/5 backdrop-blur-sm" style={{ transform: 'perspective(2000px) rotateX(4deg)' }}>
              {/* Browser chrome */}
              <div className="flex items-center gap-2 rounded-t-lg bg-gray-800/80 px-4 py-2.5 border-b border-gray-700/50">
                <div className="flex gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80" />
                </div>
                <div className="mx-4 flex-1 rounded-md bg-gray-700/50 px-3 py-1 text-xs text-gray-400">
                  app.signalstack.io/dashboard
                </div>
              </div>

              {/* Dashboard content */}
              <div className="p-4 sm:p-6">
                {/* Stats row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
                  {[
                    { label: 'Total Assets', value: '1,247', icon: Layers, change: '+12%', color: 'text-brand-400' },
                    { label: 'Open Findings', value: '23', icon: AlertTriangle, change: '-8%', color: 'text-orange-400' },
                    { label: 'Critical', value: '3', icon: ShieldAlert, change: '+1', color: 'text-red-400' },
                    { label: 'Active Scans', value: '7', icon: Activity, change: 'Running', color: 'text-green-400' },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-lg border border-gray-700/50 bg-gray-800/50 p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-2">
                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        <span className={`text-xs font-medium ${stat.color}`}>{stat.change}</span>
                      </div>
                      <div className="text-xl sm:text-2xl font-bold text-white">{stat.value}</div>
                      <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Chart + mini table */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Chart placeholder */}
                  <div className="rounded-lg border border-gray-700/50 bg-gray-800/50 p-4">
                    <div className="text-sm font-medium text-gray-300 mb-4">Findings by Severity</div>
                    <div className="flex items-end gap-3 h-28">
                      {[
                        { label: 'Critical', h: '25%', color: 'bg-red-500' },
                        { label: 'High', h: '45%', color: 'bg-orange-500' },
                        { label: 'Medium', h: '70%', color: 'bg-yellow-500' },
                        { label: 'Low', h: '90%', color: 'bg-blue-500' },
                        { label: 'Info', h: '55%', color: 'bg-gray-500' },
                      ].map((bar) => (
                        <div key={bar.label} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full rounded-t" style={{ height: bar.h, minHeight: '8px' }}>
                            <div className={`w-full h-full rounded-t ${bar.color} opacity-80`} />
                          </div>
                          <span className="text-[10px] text-gray-500">{bar.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mini findings table */}
                  <div className="rounded-lg border border-gray-700/50 bg-gray-800/50 p-4">
                    <div className="text-sm font-medium text-gray-300 mb-3">Recent Findings</div>
                    <div className="space-y-2">
                      {[
                        { title: 'Open SSH port (22/tcp)', severity: 'Critical' },
                        { title: 'TLS cert expiring', severity: 'High' },
                        { title: 'Missing HSTS header', severity: 'Medium' },
                      ].map((f) => (
                        <div key={f.title} className="flex items-center justify-between rounded-md bg-gray-900/50 px-3 py-2 text-xs">
                          <span className="text-gray-300 truncate mr-2">{f.title}</span>
                          <SeverityBadge severity={f.severity} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Glow effect below dashboard */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-brand-600/10 blur-3xl rounded-full" />
          </div>
        </div>
      </section>

      {/* ===================== TRUST BAR ===================== */}
      <section className="relative py-16 border-t border-gray-800/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm font-medium text-gray-500 uppercase tracking-wider mb-8">
            Trusted by security teams at
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {trustLogos.map((name) => (
              <span
                key={name}
                className="text-lg font-semibold text-gray-600/60 select-none whitespace-nowrap"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== FEATURES GRID ===================== */}
      <section className="relative py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-900/50 to-gray-950" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Everything you need for security intelligence
            </h2>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
              From asset discovery to threat remediation, SignalStack gives your team complete visibility.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative rounded-xl border border-gray-800 bg-gray-900/50 p-6 hover:border-gray-700 hover:bg-gray-900/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-500/5"
              >
                <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-brand-600/10 border border-brand-500/20 text-brand-400 group-hover:bg-brand-600/20 transition-colors">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== DASHBOARD PREVIEW ===================== */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-brand-600/5 rounded-full blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              See SignalStack in action
            </h2>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
              A unified command center for your entire security posture.
            </p>
          </div>

          {/* Browser frame */}
          <div className="mx-auto max-w-6xl rounded-xl border border-gray-700/50 bg-gray-900 shadow-2xl shadow-black/40 overflow-hidden">
            {/* Chrome bar */}
            <div className="flex items-center gap-2 bg-gray-800 px-4 py-2.5 border-b border-gray-700/50">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <div className="h-3 w-3 rounded-full bg-green-500/80" />
              </div>
              <div className="mx-4 flex-1 rounded-md bg-gray-700/50 px-3 py-1 text-xs text-gray-400 flex items-center gap-2">
                <Shield className="h-3 w-3 text-green-500" />
                app.signalstack.io/dashboard
              </div>
            </div>

            {/* App content with sidebar */}
            <div className="flex min-h-[480px]">
              {/* Sidebar */}
              <div className="hidden sm:flex w-56 flex-col border-r border-gray-800 bg-gray-950 p-3">
                <div className="flex items-center gap-2 px-3 py-2 mb-4">
                  <div className="h-6 w-6 rounded-md bg-brand-600 flex items-center justify-center">
                    <Activity className="h-3.5 w-3.5 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-white">SignalStack</span>
                </div>
                {[
                  { icon: BarChart3, label: 'Dashboard', active: true },
                  { icon: Globe, label: 'Assets', active: false },
                  { icon: ShieldAlert, label: 'Findings', active: false },
                  { icon: Search, label: 'Scans', active: false },
                  { icon: Terminal, label: 'Recon', active: false },
                  { icon: Bell, label: 'Alerts', active: false },
                  { icon: FileText, label: 'Reports', active: false },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                      item.active
                        ? 'bg-brand-600/15 text-brand-400 font-medium'
                        : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/50'
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </div>
                ))}
              </div>

              {/* Main content */}
              <div className="flex-1 p-5 bg-gray-950/50">
                {/* Top bar */}
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-semibold text-white">Dashboard</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Last scan: 4 min ago</span>
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse-soft" />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
                  {[
                    { label: 'Assets', value: '127', color: 'text-brand-400', bg: 'bg-brand-500/10' },
                    { label: 'Open Findings', value: '23', color: 'text-orange-400', bg: 'bg-orange-500/10' },
                    { label: 'Critical', value: '3', color: 'text-red-400', bg: 'bg-red-500/10' },
                    { label: 'Active Scans', value: '2', color: 'text-green-400', bg: 'bg-green-500/10' },
                  ].map((s) => (
                    <div key={s.label} className="rounded-lg border border-gray-800 bg-gray-900/80 p-3">
                      <div className="text-xs text-gray-500 mb-1">{s.label}</div>
                      <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* Severity chart */}
                <div className="rounded-lg border border-gray-800 bg-gray-900/80 p-4 mb-5">
                  <div className="text-sm font-medium text-gray-300 mb-3">Severity Distribution</div>
                  <div className="flex rounded-full overflow-hidden h-3 bg-gray-800">
                    <div className="bg-red-500 h-full" style={{ width: '8%' }} />
                    <div className="bg-orange-500 h-full" style={{ width: '17%' }} />
                    <div className="bg-yellow-500 h-full" style={{ width: '30%' }} />
                    <div className="bg-blue-500 h-full" style={{ width: '25%' }} />
                    <div className="bg-gray-500 h-full" style={{ width: '20%' }} />
                  </div>
                  <div className="flex items-center gap-4 mt-2.5 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" /> Critical (3)</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-orange-500" /> High (7)</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-yellow-500" /> Medium (12)</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-500" /> Low (9)</span>
                    <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-gray-500" /> Info (8)</span>
                  </div>
                </div>

                {/* Findings table */}
                <div className="rounded-lg border border-gray-800 bg-gray-900/80 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                    <div className="text-sm font-medium text-gray-300">Recent Findings</div>
                    <span className="text-xs text-brand-400 cursor-pointer hover:text-brand-300">View all</span>
                  </div>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800/50">
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Finding</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Asset</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Severity</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockFindings.map((f) => (
                        <tr key={f.id} className="border-b border-gray-800/30 hover:bg-gray-800/30 transition-colors">
                          <td className="px-4 py-2.5 text-xs font-mono text-gray-500">{f.id}</td>
                          <td className="px-4 py-2.5 text-xs text-gray-300">{f.title}</td>
                          <td className="px-4 py-2.5 text-xs font-mono text-gray-500 hidden md:table-cell">{f.asset}</td>
                          <td className="px-4 py-2.5"><SeverityBadge severity={f.severity} /></td>
                          <td className="px-4 py-2.5 hidden lg:table-cell"><StatusBadge status={f.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== TESTIMONIALS ===================== */}
      <section className="relative py-24 border-t border-gray-800/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Loved by security teams
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              Hear from the teams that rely on SignalStack every day.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="relative rounded-xl border border-gray-800 bg-gray-900/50 p-6 hover:border-gray-700 transition-colors"
              >
                {/* Quote mark */}
                <div className="text-brand-600/30 text-5xl font-serif leading-none mb-4">&ldquo;</div>
                <p className="text-gray-300 text-sm leading-relaxed mb-6">
                  {t.quote}
                </p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-sm font-bold text-white">
                    {t.name.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.title}, {t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== CTA SECTION ===================== */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-brand-950/30 to-gray-950" />
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-brand-600/8 rounded-full blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            Ready to secure your attack surface?
          </h2>
          <p className="mt-6 text-lg text-gray-400 leading-relaxed">
            Join thousands of security teams using SignalStack to monitor, detect, and respond to threats.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/25 hover:bg-brand-500 transition-all hover:shadow-brand-500/30 hover:shadow-xl"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-lg border border-gray-600 bg-white/5 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/10 hover:border-gray-500 transition-all"
            >
              Contact Sales
            </Link>
          </div>
          <p className="mt-6 text-sm text-gray-500">
            Free for up to 10 assets &middot; No credit card required
          </p>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <Footer />
    </div>
  );
}
