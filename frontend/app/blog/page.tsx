'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const categoryColors: Record<string, string> = {
  Product: 'bg-brand-100 text-brand-700 dark:bg-brand-950/50 dark:text-brand-400',
  Research: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
  Engineering: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
  'Best Practices': 'bg-violet-100 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400',
  Technical: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-400',
  Company: 'bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400',
};

const posts = [
  {
    title: 'Introducing AI-Powered Threat Detection',
    date: 'Mar 15, 2024',
    excerpt:
      'How we\'re using machine learning to reduce false positives and surface the findings that matter most.',
    category: 'Product',
    slug: 'ai-powered-threat-detection',
  },
  {
    title: 'The State of External Attack Surface Management in 2024',
    date: 'Mar 1, 2024',
    excerpt:
      'Key trends and statistics from our analysis of over 2 million monitored assets.',
    category: 'Research',
    slug: 'state-of-easm-2024',
  },
  {
    title: '5 Security Headers Every Web Application Needs',
    date: 'Feb 20, 2024',
    excerpt:
      'A practical guide to implementing Content-Security-Policy, HSTS, and other critical security headers.',
    category: 'Engineering',
    slug: 'security-headers-guide',
  },
  {
    title: 'Building a Security-First Culture at Your Organization',
    date: 'Feb 10, 2024',
    excerpt:
      'Lessons learned from working with hundreds of security teams on improving their security posture.',
    category: 'Best Practices',
    slug: 'security-first-culture',
  },
  {
    title: 'How SignalStack Detects Subdomain Takeover Risks',
    date: 'Jan 28, 2024',
    excerpt:
      'A deep dive into our subdomain monitoring engine and how we identify dangling DNS records.',
    category: 'Technical',
    slug: 'subdomain-takeover-detection',
  },
  {
    title: 'SOC 2 Type II: Our Journey to Compliance',
    date: 'Jan 15, 2024',
    excerpt:
      'What we learned pursuing SOC 2 certification and how it made our product better.',
    category: 'Company',
    slug: 'soc2-type-ii-journey',
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
            Blog
          </h1>
          <p className="mt-6 text-lg sm:text-xl leading-relaxed text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Insights on security monitoring, threat intelligence, and building a modern security
            program.
          </p>
        </div>
      </section>

      {/* Posts Grid */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="group flex flex-col rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
              >
                {/* Colored top stripe */}
                <div className="h-1 w-full bg-gradient-to-r from-brand-500 to-brand-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex flex-1 flex-col p-6">
                  {/* Category badge */}
                  <div className="mb-4">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                        categoryColors[post.category] || categoryColors.Product
                      }`}
                    >
                      {post.category}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors leading-snug">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>

                  {/* Date */}
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">{post.date}</p>

                  {/* Excerpt */}
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {post.excerpt}
                  </p>

                  {/* Read more */}
                  <div className="mt-6">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline"
                    >
                      Read more
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
