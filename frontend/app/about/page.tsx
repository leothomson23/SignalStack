'use client';

import Link from 'next/link';
import { Shield, Eye, Code, Heart, ArrowRight, MapPin } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const stats = [
  { value: '500+', label: 'Organizations protected' },
  { value: '2M+', label: 'Assets monitored' },
  { value: '10M+', label: 'Findings detected' },
  { value: '99.9%', label: 'Uptime SLA' },
];

const values = [
  {
    icon: Shield,
    title: 'Security First',
    description:
      'We eat our own dog food. SignalStack undergoes regular penetration testing and bug bounty programs.',
  },
  {
    icon: Eye,
    title: 'Transparency',
    description:
      'Open about our security practices, incident response, and how we handle your data.',
  },
  {
    icon: Code,
    title: 'Developer Experience',
    description:
      'API-first design with comprehensive documentation. Build what you need.',
  },
  {
    icon: Heart,
    title: 'Customer Obsession',
    description:
      'Dedicated support with median response times under 2 hours.',
  },
];

const team = [
  { name: 'Alex Rivera', title: 'CEO & Co-Founder', prev: 'ex-Cloudflare', initials: 'AR', color: 'bg-brand-600', linkedin: 'https://linkedin.com/in/alexrivera-ss' },
  { name: 'Jordan Kim', title: 'CTO & Co-Founder', prev: 'ex-Google Project Zero', initials: 'JK', color: 'bg-emerald-600', linkedin: 'https://linkedin.com/in/jordankim-sec' },
  { name: 'Maya Patel', title: 'VP Engineering', prev: 'ex-Datadog', initials: 'MP', color: 'bg-amber-600', linkedin: 'https://linkedin.com/in/mayapatel-eng' },
  { name: 'Chris Okafor', title: 'Head of Security Research', prev: 'ex-CrowdStrike', initials: 'CO', color: 'bg-rose-600', linkedin: 'https://linkedin.com/in/chrisokafor' },
  { name: 'Lisa Zhang', title: 'Head of Product', prev: 'ex-Snyk', initials: 'LZ', color: 'bg-violet-600', linkedin: 'https://linkedin.com/in/lisazhang-pm' },
  { name: 'David Moreno', title: 'Head of Customer Success', prev: 'ex-Palo Alto Networks', initials: 'DM', color: 'bg-cyan-600', linkedin: 'https://linkedin.com/in/davidmoreno-cs' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white">
            Securing the modern{' '}
            <span className="text-brand-600 dark:text-brand-400">attack surface</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl leading-relaxed text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            SignalStack was founded with a mission: give every security team the tools to see,
            understand, and protect their external infrastructure.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Our Story</h2>
          <div className="mt-8 space-y-6 text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
            <p>
              Founded in 2022 by a team of security researchers and engineers who were frustrated by
              the fragmented tooling landscape. We saw security teams juggling dozens of point
              solutions, writing custom glue code, and still missing critical exposures.
            </p>
            <p>
              We believe continuous security monitoring shouldn&apos;t require stitching together
              dozens of point solutions. SignalStack brings reconnaissance, vulnerability detection,
              and threat intelligence into a single platform that works out of the box.
            </p>
            <p>
              Today, SignalStack is trusted by hundreds of organisations worldwide &mdash; from
              fast-moving startups to Fortune 500 enterprises &mdash; to continuously discover and
              monitor their external attack surface.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-center"
              >
                <div className="text-3xl sm:text-4xl font-bold text-brand-600 dark:text-brand-400">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center">
            Our Values
          </h2>
          <p className="mt-4 text-center text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            The principles that guide everything we build.
          </p>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 gap-8">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-950/50">
                  <value.icon className="h-6 w-6 text-brand-600 dark:text-brand-400" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                  {value.title}
                </h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center">
            Meet the team
          </h2>
          <p className="mt-4 text-center text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            World-class security and engineering talent, united by a shared mission.
          </p>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {team.map((member) => (
              <div
                key={member.name}
                className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 text-center"
              >
                <div
                  className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${member.color} text-white text-xl font-bold`}
                >
                  {member.initials}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                  {member.name}
                </h3>
                <p className="mt-1 text-sm font-medium text-brand-600 dark:text-brand-400">
                  {member.title}
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-500">{member.prev}</p>
                {member.linkedin && (
                  <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-xs text-gray-400 hover:text-brand-500 transition-colors">
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                    Connect
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Offices */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-950/50">
                <MapPin className="h-6 w-6 text-brand-600 dark:text-brand-400" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Our Offices</h2>
            <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">Remote-first with hubs across three continents.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 text-center">
              <h3 className="font-semibold text-gray-900 dark:text-white">San Francisco</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">548 Market St, Suite 35000<br />San Francisco, CA 94104</p>
              <p className="mt-2 text-xs text-gray-400">+1 (415) 555-0142</p>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 text-center">
              <h3 className="font-semibold text-gray-900 dark:text-white">London</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">71 Queen Victoria Street<br />London EC4V 4AY, UK</p>
              <p className="mt-2 text-xs text-gray-400">+44 20 7946 0958</p>
            </div>
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 text-center">
              <h3 className="font-semibold text-gray-900 dark:text-white">Singapore</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">1 Raffles Place, #20-61<br />Singapore 048616</p>
              <p className="mt-2 text-xs text-gray-400">+65 6521 8300</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent News / Blog */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center">From the blog</h2>
          <p className="mt-4 text-center text-gray-600 dark:text-gray-400">Thoughts on security, engineering, and building SignalStack.</p>
          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-8">
            <article className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
              <p className="text-xs text-gray-400">Mar 12, 2026</p>
              <h3 className="mt-2 font-semibold text-gray-900 dark:text-white">How we migrated 2M assets to our new Kubernetes cluster</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Our infrastructure team shares lessons learned moving from ECS to EKS across three AWS regions (us-west-2, eu-west-1, ap-southeast-1).</p>
              <p className="mt-3 text-xs text-gray-400">By Maya Patel, VP Engineering &middot; <a href="mailto:maya@signalstack.io" className="hover:text-brand-500">maya@signalstack.io</a></p>
            </article>
            <article className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
              <p className="text-xs text-gray-400">Feb 28, 2026</p>
              <h3 className="mt-2 font-semibold text-gray-900 dark:text-white">Announcing our partnership with Acme Corp and GlobalSec</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">We&apos;re excited to welcome Acme Corp and GlobalSec Ltd as design partners for our new threat intelligence module. Special thanks to Sarah Chen at GlobalSec for the invaluable feedback.</p>
              <p className="mt-3 text-xs text-gray-400">By Alex Rivera, CEO &middot; <a href="mailto:alex@signalstack.io" className="hover:text-brand-500">alex@signalstack.io</a></p>
            </article>
            <article className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
              <p className="text-xs text-gray-400">Jan 15, 2026</p>
              <h3 className="mt-2 font-semibold text-gray-900 dark:text-white">Inside our SOC 2 Type II audit: what we learned</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Jordan walks through how our security team prepared for and passed the SOC 2 audit, including our internal tooling built on top of Grafana and PagerDuty.</p>
              <p className="mt-3 text-xs text-gray-400">By Jordan Kim, CTO &middot; <a href="mailto:jordan@signalstack.io" className="hover:text-brand-500">jordan@signalstack.io</a></p>
            </article>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900/50">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Want to join us?
          </h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            We&apos;re hiring across engineering, security research, and go-to-market.
          </p>
          <div className="mt-8">
            <Link
              href="/careers"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-brand-700 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-950"
            >
              View Open Positions
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
