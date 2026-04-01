'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Check,
  ChevronDown,
  Sparkles,
  ArrowRight,
  Zap,
  Building2,
  User,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Pricing Data                                                       */
/* ------------------------------------------------------------------ */

interface PlanFeature {
  text: string;
}

interface Plan {
  name: string;
  icon: React.ElementType;
  description: string;
  priceMonthly: string;
  priceAnnual: string;
  priceSuffix?: string;
  highlighted: boolean;
  badge?: string;
  features: PlanFeature[];
  cta: string;
  ctaHref: string;
  ctaStyle: 'filled' | 'outlined';
}

const plans: Plan[] = [
  {
    name: 'Free',
    icon: User,
    description: 'For individuals and small projects',
    priceMonthly: '$0',
    priceAnnual: '$0',
    priceSuffix: '/month',
    highlighted: false,
    features: [
      { text: 'Up to 10 assets' },
      { text: '100 findings' },
      { text: 'Basic scanning' },
      { text: 'Community support' },
      { text: '1 user' },
      { text: 'API access' },
    ],
    cta: 'Get Started',
    ctaHref: '/register',
    ctaStyle: 'outlined',
  },
  {
    name: 'Pro',
    icon: Zap,
    description: 'For growing teams',
    priceMonthly: '$49',
    priceAnnual: '$39',
    priceSuffix: '/month',
    highlighted: true,
    badge: 'Most Popular',
    features: [
      { text: 'Up to 100 assets' },
      { text: 'Unlimited findings' },
      { text: 'Advanced scanning' },
      { text: 'Priority email support' },
      { text: '10 users' },
      { text: 'Webhooks & integrations' },
      { text: 'Custom reports' },
      { text: 'API access' },
    ],
    cta: 'Start Free Trial',
    ctaHref: '/register?plan=pro',
    ctaStyle: 'filled',
  },
  {
    name: 'Enterprise',
    icon: Building2,
    description: 'For large organizations',
    priceMonthly: 'Custom',
    priceAnnual: 'Custom',
    highlighted: false,
    features: [
      { text: 'Unlimited assets' },
      { text: 'Unlimited findings' },
      { text: 'Custom scanning rules' },
      { text: 'Dedicated account manager' },
      { text: 'Unlimited users' },
      { text: 'SSO / SAML' },
      { text: 'SLA guarantee' },
      { text: 'On-premise option' },
      { text: 'Custom integrations' },
    ],
    cta: 'Contact Sales',
    ctaHref: '/contact',
    ctaStyle: 'outlined',
  },
];

/* ------------------------------------------------------------------ */
/*  FAQ Data                                                           */
/* ------------------------------------------------------------------ */

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'Can I try before I buy?',
    answer:
      'Absolutely. Every Pro plan comes with a 14-day free trial, no credit card required. You get full access to all Pro features so you can evaluate SignalStack with your real infrastructure before committing.',
  },
  {
    question: 'What happens when I exceed my asset limit?',
    answer:
      "We'll notify you when you're approaching your limit and again when you've reached it. We never silently cut off scanning or delete your data. You can upgrade at any time to increase your asset allowance.",
  },
  {
    question: 'Do you offer discounts for startups?',
    answer:
      'Yes! We offer 50% off the Pro plan for qualifying early-stage startups (under $5M in funding, less than 50 employees). Reach out to our sales team with your details and we\'ll get you set up.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards (Visa, Mastercard, American Express) processed securely through Stripe. For Enterprise plans, we also support invoicing with NET 30 terms.',
  },
  {
    question: 'Can I cancel anytime?',
    answer:
      "Yes. There are no long-term contracts or cancellation fees. You can cancel your subscription at any time from your account settings. You'll retain access until the end of your current billing period.",
  },
];

/* ------------------------------------------------------------------ */
/*  FAQ Accordion Item                                                 */
/* ------------------------------------------------------------------ */

function FAQAccordionItem({ item }: { item: FAQItem }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 dark:border-gray-800">
      <button
        type="button"
        className="flex w-full items-center justify-between py-5 text-left"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span className="text-sm font-semibold text-gray-900 dark:text-white pr-4">
          {item.question}
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-gray-400 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? 'max-h-96 pb-5' : 'max-h-0'
        }`}
      >
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed pr-8">
          {item.answer}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center rounded-full border border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-950/50 px-3 py-1 text-xs font-semibold text-brand-700 dark:text-brand-300 mb-6">
            Pricing
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white">
            Simple, transparent pricing
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-xl mx-auto leading-relaxed">
            Start free, scale as you grow. No hidden fees.
          </p>

          {/* Toggle */}
          <div className="mt-10 flex items-center justify-center gap-3">
            <span
              className={`text-sm font-medium ${
                !annual ? 'text-gray-900 dark:text-white' : 'text-gray-500'
              }`}
            >
              Monthly
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={annual}
              onClick={() => setAnnual(!annual)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-950 ${
                annual ? 'bg-brand-600' : 'bg-gray-300 dark:bg-gray-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition-transform duration-200 ${
                  annual ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span
              className={`text-sm font-medium ${
                annual ? 'text-gray-900 dark:text-white' : 'text-gray-500'
              }`}
            >
              Annual
            </span>
            {annual && (
              <span className="ml-1 inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/40 px-2.5 py-0.5 text-xs font-semibold text-green-700 dark:text-green-400">
                Save 20%
              </span>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-6 items-start">
          {plans.map((plan) => {
            const price = annual ? plan.priceAnnual : plan.priceMonthly;
            const isCustom = price === 'Custom';

            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-8 flex flex-col ${
                  plan.highlighted
                    ? 'border-brand-500 dark:border-brand-400 shadow-xl shadow-brand-500/10 dark:shadow-brand-400/5 ring-1 ring-brand-500 dark:ring-brand-400'
                    : 'border-gray-200 dark:border-gray-800 shadow-sm'
                } bg-white dark:bg-gray-900`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                    <Sparkles className="h-3 w-3" />
                    {plan.badge}
                  </span>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      plan.highlighted
                        ? 'bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    <plan.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">{plan.description}</p>

                <div className="mb-8">
                  {isCustom ? (
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">Custom</span>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">{price}</span>
                      {plan.priceSuffix && (
                        <span className="text-sm text-gray-500">{plan.priceSuffix}</span>
                      )}
                    </div>
                  )}
                  {annual && !isCustom && price !== '$0' && (
                    <p className="mt-1 text-xs text-gray-500">
                      Billed annually ({plan.priceAnnual === '$39' ? '$468' : '$0'}/year)
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f.text} className="flex items-start gap-3">
                      <Check
                        className={`h-4 w-4 mt-0.5 shrink-0 ${
                          plan.highlighted
                            ? 'text-brand-600 dark:text-brand-400'
                            : 'text-gray-400 dark:text-gray-500'
                        }`}
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{f.text}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.ctaHref}
                  className={`inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-gray-950 ${
                    plan.ctaStyle === 'filled'
                      ? 'bg-brand-600 text-white shadow-sm hover:bg-brand-700'
                      : 'border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Frequently asked questions
            </h2>
            <p className="mt-3 text-gray-600 dark:text-gray-400">
              Can&apos;t find the answer you&apos;re looking for? Reach out to our{' '}
              <Link href="/contact" className="text-brand-600 dark:text-brand-400 hover:underline font-medium">
                support team
              </Link>
              .
            </p>
          </div>
          <div>
            {faqs.map((faq) => (
              <FAQAccordionItem key={faq.question} item={faq} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
