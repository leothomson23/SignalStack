'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Twitter, Linkedin, LinkIcon, Check } from 'lucide-react';
import { useState } from 'react';
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

interface BlogPost {
  slug: string;
  title: string;
  author: string;
  role: string;
  initials: string;
  date: string;
  readTime: string;
  category: string;
  content: React.ReactNode;
}

const posts: BlogPost[] = [
  {
    slug: 'ai-powered-threat-detection',
    title: 'Introducing AI-Powered Threat Detection',
    author: 'Lisa Zhang',
    role: 'Head of Product',
    initials: 'LZ',
    date: 'Mar 15, 2024',
    readTime: '6 min read',
    category: 'Product',
    content: (
      <>
        <p>
          If you run a security operations center, you already know the problem: too many alerts, not
          enough analysts, and a gnawing suspicion that the finding that actually matters is buried
          somewhere in page seven of a report nobody has time to read. Industry data backs this up —
          a 2023 survey by the Ponemon Institute found that the average SOC team ignores or never
          investigates 30 percent of the alerts it receives each day. That is not a process problem.
          That is a structural one.
        </p>
        <p>
          Today we are announcing AI-Powered Threat Detection, a new capability inside SignalStack
          that applies machine learning to every finding our scanners produce. The goal is simple:
          tell security teams which findings deserve attention right now and which ones can wait.
        </p>

        <h2>The alert fatigue problem</h2>
        <p>
          External attack surface management tools are good at discovery. They enumerate subdomains,
          check TLS configurations, fingerprint services, and flag misconfigurations. The challenge
          is that a mature organization with hundreds of internet-facing assets can generate thousands
          of findings per scan cycle. Most of those findings are informational, duplicates, or low
          severity. But buried among them are the handful that represent real, exploitable risk.
        </p>
        <p>
          Traditional approaches rely on static severity ratings — a missing HSTS header is always
          &quot;Medium,&quot; an exposed admin panel is always &quot;High.&quot; These ratings ignore
          context. An exposed admin panel behind a VPN is very different from one on a forgotten
          staging subdomain with default credentials.
        </p>

        <h2>How our ML model works</h2>
        <p>
          SignalStack&apos;s threat detection model was trained on anonymized finding data from over
          400 organizations that opted into our research program. The training set includes roughly
          12 million labeled findings spanning 18 months of scan history. Each finding was enriched
          with contextual signals: asset ownership confidence, historical remediation velocity,
          exposure duration, related CVEs, and whether the asset sits behind a CDN or WAF.
        </p>
        <p>
          The model outputs a confidence score between 0 and 1 that represents the probability a
          finding represents genuine, exploitable risk in its current context. Findings above 0.85
          are flagged as Critical, those between 0.6 and 0.85 as Elevated, and everything below 0.6
          is classified as Routine.
        </p>

        <h2>Confidence scoring in the API</h2>
        <p>
          If you use the SignalStack API, the confidence score is now included in every finding
          object. Here is what a typical response looks like:
        </p>
        <pre><code>{`{
  "finding_id": "f-8a3b1c9d",
  "asset": "staging-api.example.com",
  "type": "exposed_admin_panel",
  "severity_static": "high",
  "ai_confidence": 0.92,
  "ai_classification": "critical",
  "context": {
    "behind_waf": false,
    "exposure_days": 34,
    "default_creds_detected": true,
    "related_cves": ["CVE-2023-44487"]
  }
}`}</code></pre>
        <p>
          The <code>ai_confidence</code> field is the raw model output, and{' '}
          <code>ai_classification</code> maps it to one of the three tiers. You can filter your
          dashboards and webhook integrations on either field.
        </p>

        <h2>Beta results</h2>
        <p>
          We ran a closed beta with 38 organizations over the past four months. The headline number:
          participants saw a <strong>73% reduction in false positives</strong> when using AI
          classification versus static severity alone. More importantly, mean time to remediate for
          Critical-tier findings dropped by 41%, because analysts were no longer spending cycles
          triaging noise.
        </p>
        <p>
          One beta participant, a mid-size fintech company with roughly 600 external assets, told us
          their security team went from reviewing 1,200 findings per week to focusing on roughly 80
          Critical and Elevated items — without missing a single confirmed vulnerability during the
          trial period.
        </p>

        <h2>What comes next</h2>
        <p>
          AI-Powered Threat Detection is available today for all Pro and Enterprise customers. Over
          the next two quarters, we are adding anomaly detection that will alert you when an
          asset&apos;s risk profile changes unexpectedly, as well as behavioral baselines that learn
          your organization&apos;s normal patterns and flag deviations. We are also exploring
          integration with threat intelligence feeds to correlate findings with active exploitation
          campaigns.
        </p>
        <p>
          If you are interested in early access to these features, reach out to your account manager
          or join our research program through the settings page in the SignalStack dashboard.
        </p>
      </>
    ),
  },
  {
    slug: 'state-of-easm-2024',
    title: 'The State of External Attack Surface Management in 2024',
    author: 'Chris Okafor',
    role: 'Head of Security Research',
    initials: 'CO',
    date: 'Mar 1, 2024',
    readTime: '8 min read',
    category: 'Research',
    content: (
      <>
        <p>
          Every year, the SignalStack research team analyzes aggregated and anonymized data from our
          customer base to identify trends in external attack surface management. This year&apos;s
          report draws on data from over 2 million monitored assets across 500+ organizations
          spanning financial services, healthcare, SaaS, retail, and government sectors. What we
          found confirms some assumptions, challenges others, and raises several new questions about
          how organizations manage their internet-facing footprint.
        </p>

        <h2>The shadow IT problem is bigger than you think</h2>
        <p>
          Our most striking finding is that the average organization has <strong>40% more
          external-facing assets</strong> than their internal asset inventories account for. This
          gap has grown from 32% in our 2023 report, driven largely by the proliferation of cloud
          services, SaaS integrations, and developer-provisioned infrastructure. For organizations
          with more than 1,000 employees, the gap widens to 57%.
        </p>
        <p>
          These undocumented assets are not evenly distributed. Marketing teams account for 28% of
          shadow assets (campaign microsites, landing pages, third-party tools), followed by
          engineering at 24% (staging environments, CI/CD infrastructure, internal tools exposed
          externally), and sales at 18% (demo environments, partner portals).
        </p>

        <h2>Most common vulnerabilities</h2>
        <p>
          Across the full data set, four categories of findings appeared with disproportionate
          frequency:
        </p>
        <ul>
          <li>
            <strong>Missing security headers (67%)</strong> — Two out of three assets are missing at
            least one recommended security header. Content-Security-Policy is the most frequently
            absent, found on only 22% of scanned assets.
          </li>
          <li>
            <strong>Expired or misconfigured SSL/TLS certificates (34%)</strong> — This includes
            expired certificates, certificates with hostname mismatches, and assets still supporting
            TLS 1.0 or 1.1.
          </li>
          <li>
            <strong>Exposed administrative panels (12%)</strong> — Login pages for CMS platforms,
            database consoles, infrastructure dashboards, and custom admin interfaces accessible
            from the public internet without additional access controls.
          </li>
          <li>
            <strong>Dangling DNS records (8%)</strong> — CNAME records pointing to deprovisioned
            services, creating subdomain takeover risk. This number has remained relatively stable
            year over year despite increased awareness.
          </li>
        </ul>

        <h2>Industry breakdown</h2>
        <p>
          Attack surface growth varied significantly by industry. SaaS companies saw the largest
          year-over-year increase in external assets at 23%, driven by microservices architectures
          and multi-region deployments. Financial services grew by 14%, primarily through
          acquisition-related asset absorption. Healthcare grew by 11%, with the majority of new
          assets linked to patient portal expansions and telehealth platforms.
        </p>
        <p>
          Government organizations had the smallest growth at 6% but also had the highest proportion
          of legacy assets — 31% of government-sector assets were running software versions more
          than two major releases behind current.
        </p>

        <h2>Remediation velocity</h2>
        <p>
          The median time to remediate a Critical finding across all industries was 12.4 days — an
          improvement from 16.1 days in 2023. However, this masks significant variance. The top
          quartile of organizations remediate Critical findings in under 3 days, while the bottom
          quartile takes more than 30 days. The strongest predictor of fast remediation was not team
          size or budget, but whether the organization had integrated their EASM tool with their
          ticketing system for automated issue creation.
        </p>

        <h2>Recommendations</h2>
        <p>
          Based on this year&apos;s data, we recommend security teams prioritize the following:
        </p>
        <ul>
          <li>
            Conduct a comprehensive asset discovery exercise at least quarterly, not just annually.
            The pace of asset creation demands more frequent visibility.
          </li>
          <li>
            Implement automated deprovisioning workflows that include DNS record cleanup. Dangling
            DNS is a solved problem from a detection standpoint — the gap is in operational process.
          </li>
          <li>
            Deploy security headers via centralized infrastructure (CDN, reverse proxy, or
            middleware) rather than relying on individual application teams.
          </li>
          <li>
            Integrate EASM findings with your existing vulnerability management workflow. Findings
            that create tickets get fixed; findings that sit in a dashboard do not.
          </li>
        </ul>
        <p>
          The full report, including detailed methodology and additional industry breakdowns, is
          available for download in the SignalStack dashboard under Reports.
        </p>
      </>
    ),
  },
  {
    slug: 'security-headers-guide',
    title: '5 Security Headers Every Web Application Needs',
    author: 'Maya Patel',
    role: 'VP Engineering',
    initials: 'MP',
    date: 'Feb 20, 2024',
    readTime: '7 min read',
    category: 'Engineering',
    content: (
      <>
        <p>
          Security headers are one of the most effective and least expensive defenses you can add to
          a web application. They are set in the HTTP response, cost nothing to implement, and
          protect against entire classes of attacks including cross-site scripting, clickjacking, and
          MIME-type confusion. Despite this, our research shows that 67% of internet-facing assets
          are missing at least one critical security header.
        </p>
        <p>
          This guide covers the five headers we consider essential, with practical configuration
          examples and notes on common pitfalls.
        </p>

        <h2>1. Content-Security-Policy (CSP)</h2>
        <p>
          Content-Security-Policy is the single most powerful security header available. It tells the
          browser which sources of content are allowed to load on your page, providing a strong
          defense against cross-site scripting (XSS) and data injection attacks. If an attacker
          manages to inject a script tag into your page, a properly configured CSP will prevent the
          browser from executing it.
        </p>
        <p>Here is a reasonable starting policy for a typical web application:</p>
        <pre><code>{`Content-Security-Policy: default-src 'self';
  script-src 'self' 'nonce-{random}';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  font-src 'self';
  connect-src 'self' https://api.example.com;
  frame-ancestors 'none';`}</code></pre>
        <p>
          Start with <code>Content-Security-Policy-Report-Only</code> to monitor violations without
          breaking functionality. Once you have tuned the policy, switch to enforcement mode. The
          most common mistake is starting with an overly permissive policy that includes{' '}
          <code>&apos;unsafe-eval&apos;</code> — avoid this unless your application absolutely
          requires it.
        </p>

        <h2>2. Strict-Transport-Security (HSTS)</h2>
        <p>
          HSTS tells browsers to only communicate with your site over HTTPS, even if the user types
          <code>http://</code> in the address bar. This prevents SSL stripping attacks where an
          attacker downgrades the connection to unencrypted HTTP.
        </p>
        <pre><code>{`Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`}</code></pre>
        <p>
          The <code>max-age</code> value is in seconds — 31536000 equals one year. The{' '}
          <code>includeSubDomains</code> directive extends the policy to all subdomains, which is
          important because an insecure subdomain can be used to set cookies that affect the parent
          domain. The <code>preload</code> directive makes your site eligible for inclusion in
          browser preload lists, ensuring HTTPS is enforced even on the first visit.
        </p>
        <p>
          <strong>Caution:</strong> Before enabling <code>includeSubDomains</code>, make sure every
          subdomain supports HTTPS. If you have legacy subdomains that only serve HTTP, this
          directive will make them inaccessible.
        </p>

        <h2>3. X-Content-Type-Options</h2>
        <p>
          This header prevents browsers from MIME-type sniffing — the practice of ignoring the
          declared <code>Content-Type</code> and trying to guess the type by examining the content.
          This can be exploited by uploading a file with a harmless extension that contains
          executable content.
        </p>
        <pre><code>{`X-Content-Type-Options: nosniff`}</code></pre>
        <p>
          There is only one valid value: <code>nosniff</code>. This header is trivial to implement
          and has no downsides. If you are not setting it today, add it immediately. Every major web
          server and framework supports it, and there is no legitimate reason to omit it.
        </p>

        <h2>4. X-Frame-Options</h2>
        <p>
          X-Frame-Options controls whether your page can be embedded in an iframe on another site.
          This is the primary defense against clickjacking attacks, where an attacker overlays a
          transparent iframe of your site over a malicious page to trick users into clicking buttons
          they did not intend to click.
        </p>
        <pre><code>{`X-Frame-Options: SAMEORIGIN`}</code></pre>
        <p>
          The <code>SAMEORIGIN</code> value allows framing only by pages on the same origin. You can
          also use <code>DENY</code> to prevent all framing. Note that CSP&apos;s{' '}
          <code>frame-ancestors</code> directive is the modern replacement for X-Frame-Options and
          offers more granular control. We recommend setting both for backward compatibility:
        </p>
        <pre><code>{`X-Frame-Options: SAMEORIGIN
Content-Security-Policy: frame-ancestors 'self';`}</code></pre>

        <h2>5. Permissions-Policy</h2>
        <p>
          Permissions-Policy (formerly Feature-Policy) allows you to control which browser features
          and APIs can be used on your page. This limits the damage an attacker can do even if they
          achieve code execution — for example, preventing access to the camera, microphone, or
          geolocation API.
        </p>
        <pre><code>{`Permissions-Policy: camera=(), microphone=(), geolocation=(),
  payment=(), usb=(), magnetometer=()`}</code></pre>
        <p>
          The empty parentheses <code>()</code> disable the feature entirely. You can also allow
          specific origins with <code>camera=(self &quot;https://meet.example.com&quot;)</code>.
          Audit which APIs your application actually uses and deny everything else.
        </p>

        <h2>Testing with SignalStack</h2>
        <p>
          SignalStack&apos;s header scanning checks all five of these headers (and more) across
          every asset in your attack surface. Findings include the specific header that is missing or
          misconfigured, a recommended value, and links to relevant documentation. You can also set
          up policies that alert you if a previously configured header is removed — a common
          occurrence during deployments.
        </p>
        <p>
          To run a one-time scan, navigate to <strong>Assets → Select Asset → Run Scan →
          Headers</strong> in the dashboard. For continuous monitoring, header checks are included
          in every scheduled scan cycle.
        </p>
      </>
    ),
  },
  {
    slug: 'security-first-culture',
    title: 'Building a Security-First Culture at Your Organization',
    author: 'Alex Rivera',
    role: 'CEO & Co-Founder',
    initials: 'AR',
    date: 'Feb 10, 2024',
    readTime: '5 min read',
    category: 'Best Practices',
    content: (
      <>
        <p>
          After working with hundreds of security teams over the past three years, I have noticed a
          pattern: the organizations that improve their security posture fastest are not the ones
          with the biggest budgets or the most tools. They are the ones where security is treated as
          a shared responsibility across the entire company, not a function siloed inside one team.
          That is what I mean by a security-first culture.
        </p>
        <p>
          This is not about making everyone a security expert. It is about creating an environment
          where security considerations are a natural part of decision-making, the same way cost or
          customer experience are.
        </p>

        <h2>Security as an enabler, not a blocker</h2>
        <p>
          The biggest cultural shift is reframing security from a department that says &quot;no&quot;
          to one that says &quot;here is how to do it safely.&quot; When developers see security as
          an obstacle, they find ways around it. When they see it as a resource, they engage early.
          One of our customers, a Series B SaaS company, moved their security review from the end of
          the development cycle to the design phase. The result was a 60% reduction in
          security-related deployment delays because issues were caught before code was written, not
          after.
        </p>

        <h2>Five principles that work</h2>
        <p>
          Based on what we have seen work across our customer base, here are five principles that
          consistently drive improvement:
        </p>
        <ul>
          <li>
            <strong>Shift left.</strong> Integrate security checks into CI/CD pipelines, conduct
            threat modeling during design, and give developers access to security scanning tools.
            The earlier a vulnerability is found, the cheaper it is to fix. A bug caught in code
            review costs 10x less than one found in production.
          </li>
          <li>
            <strong>Automate ruthlessly.</strong> Manual processes do not scale. Automate dependency
            scanning, secret detection, infrastructure compliance checks, and certificate renewal.
            Every manual security process is a process that will eventually be skipped under
            deadline pressure.
          </li>
          <li>
            <strong>Educate continuously.</strong> Annual security training is compliance theater.
            Instead, run monthly lunch-and-learn sessions, share anonymized incident post-mortems,
            and create internal channels where people can ask security questions without judgment.
            Make the learning contextual and relevant to what people actually do.
          </li>
          <li>
            <strong>Measure what matters.</strong> Track metrics that reflect actual risk reduction:
            mean time to remediate, percentage of assets with up-to-date scanning, coverage of
            critical systems. Avoid vanity metrics like &quot;number of scans run&quot; or
            &quot;total findings&quot; — they encourage volume over value.
          </li>
          <li>
            <strong>Iterate openly.</strong> Security programs should evolve. Run quarterly
            retrospectives on your security posture, share results with leadership, and adjust
            priorities based on what the data tells you. Transparency builds trust and buy-in.
          </li>
        </ul>

        <h2>Tooling versus culture</h2>
        <p>
          I run a security tooling company, so it might seem self-serving to say this, but tools are
          not enough. The best EASM platform in the world will not help if nobody looks at the
          findings, if there is no process for triaging and remediating, or if the team that owns
          the vulnerable asset does not feel accountable for fixing it. Tools provide visibility.
          Culture provides action.
        </p>
        <p>
          That said, good tooling lowers the barrier to a security-first culture. When you give
          developers a dashboard where they can see their team&apos;s external assets and current
          findings, security stops being abstract. It becomes concrete and personal.
        </p>

        <h2>Starting small: quick wins</h2>
        <p>
          If you are just starting to build a security culture, here are a few things you can do
          this week:
        </p>
        <ul>
          <li>
            Set up automated alerts for new external assets. Just knowing when something new appears
            in your attack surface is a huge step forward.
          </li>
          <li>
            Create a shared Slack or Teams channel for security discussions. Make it low-pressure
            and encourage questions.
          </li>
          <li>
            Pick one metric — mean time to remediate for Critical findings is a good starting point
            — and start tracking it publicly within the team.
          </li>
          <li>
            Schedule a 30-minute meeting with one non-security team to understand their workflow
            and where security friction exists.
          </li>
        </ul>
        <p>
          Culture change is slow, but it compounds. The organizations that start building these
          habits today will be measurably more secure in six months. And unlike a tool purchase, the
          benefits do not disappear when the contract ends.
        </p>
      </>
    ),
  },
  {
    slug: 'subdomain-takeover-detection',
    title: 'How SignalStack Detects Subdomain Takeover Risks',
    author: 'Jordan Kim',
    role: 'CTO & Co-Founder',
    initials: 'JK',
    date: 'Jan 28, 2024',
    readTime: '9 min read',
    category: 'Technical',
    content: (
      <>
        <p>
          Subdomain takeover is one of those vulnerabilities that sounds obscure until it happens to
          you. In September 2023, a major e-commerce platform had a forgotten subdomain —{' '}
          <code>promo.example.com</code> — taken over by an attacker who used it to host a phishing
          page. Because the subdomain was on a legitimate parent domain with valid TLS, the phishing
          page bypassed most email filters and user suspicion. The company discovered the takeover
          37 days later, after a customer complaint.
        </p>
        <p>
          This type of vulnerability is entirely preventable, but it requires continuous monitoring.
          Here is how SignalStack approaches detection.
        </p>

        <h2>What is subdomain takeover?</h2>
        <p>
          A subdomain takeover occurs when a DNS record (usually a CNAME) points to an external
          service that has been deprovisioned. For example, suppose you created{' '}
          <code>blog.example.com</code> as a CNAME pointing to <code>example.ghost.io</code>. If
          you later cancel your Ghost account but forget to remove the DNS record, anyone can create
          a new Ghost account, claim that hostname, and serve arbitrary content on your subdomain.
        </p>
        <p>
          The risk extends beyond phishing. An attacker controlling a subdomain on your domain can
          set cookies scoped to the parent domain, potentially hijacking user sessions. They can
          also pass domain-reputation checks for email sending, host malware with the legitimacy of
          your brand, and abuse any domain-based authorization your application relies on.
        </p>

        <h2>How dangling records create risk</h2>
        <p>
          The root cause is always the same: a DNS record outlives the resource it points to. This
          happens more often than most teams realize because DNS records are typically managed by a
          different team (infrastructure or IT) than the one that provisions and deprovisions the
          underlying services (product, marketing, engineering). Without a feedback loop between
          these teams, orphaned records accumulate.
        </p>
        <p>
          Our data shows that the average organization with 500+ DNS records has 8.3 dangling
          records at any given time. Most are CNAME records, but A records pointing to released
          IP addresses (common with elastic cloud IPs) are an increasingly common vector.
        </p>

        <h2>SignalStack&apos;s detection approach</h2>
        <p>
          Our detection pipeline runs in three stages:
        </p>
        <ul>
          <li>
            <strong>DNS enumeration.</strong> We continuously enumerate subdomains using a
            combination of certificate transparency log monitoring, passive DNS databases, DNS
            brute-forcing with a curated wordlist, and zone transfer attempts. This gives us the
            most complete picture of an organization&apos;s DNS footprint.
          </li>
          <li>
            <strong>CNAME and A record resolution.</strong> For every discovered subdomain, we
            resolve the full CNAME chain and check the terminal target. If the target returns an
            NXDOMAIN, a service-specific error page, or an HTTP response indicating the resource is
            unclaimed, we flag it for further analysis.
          </li>
          <li>
            <strong>Service fingerprinting.</strong> We maintain a fingerprint database of 80+
            services that are vulnerable to subdomain takeover. Each fingerprint includes the
            expected CNAME pattern, the error response that indicates an unclaimed resource, and
            the difficulty of exploitation (some services require specific verification steps that
            make takeover harder).
          </li>
        </ul>

        <h2>Commonly vulnerable services</h2>
        <p>
          Not all services are equally susceptible. Here are the ones we see most frequently in our
          data:
        </p>
        <ul>
          <li>
            <strong>Heroku</strong> — CNAMEs to <code>*.herokuapp.com</code> or{' '}
            <code>*.herokudns.com</code>. Takeover is straightforward: create a new Heroku app and
            add the custom domain.
          </li>
          <li>
            <strong>GitHub Pages</strong> — CNAMEs to <code>*.github.io</code>. An attacker creates
            a repository with a matching CNAME file.
          </li>
          <li>
            <strong>AWS S3</strong> — CNAMEs to <code>*.s3.amazonaws.com</code>. If the bucket is
            deleted, anyone can create a bucket with the same name in certain regions.
          </li>
          <li>
            <strong>Azure</strong> — CNAMEs to <code>*.azurewebsites.net</code>,{' '}
            <code>*.cloudapp.azure.com</code>, or <code>*.trafficmanager.net</code>. Azure&apos;s
            resource naming is globally unique, making deleted resources claimable.
          </li>
        </ul>

        <h2>How a CNAME check works</h2>
        <p>
          At a simplified level, this is the logic our scanner runs for each CNAME record:
        </p>
        <pre><code>{`async function checkCNAMETakeover(subdomain: string) {
  const cnameChain = await resolveCNAMEChain(subdomain);
  const terminal = cnameChain[cnameChain.length - 1];

  const service = fingerprints.find(fp =>
    fp.cnamePatterns.some(pattern => terminal.matches(pattern))
  );

  if (!service) return { vulnerable: false };

  // Check if the target resource exists
  const response = await httpProbe(subdomain);

  if (service.deadResponseSignatures.some(sig =>
    response.body.includes(sig) || response.status === sig
  )) {
    return {
      vulnerable: true,
      service: service.name,
      confidence: service.exploitDifficulty === 'low' ? 0.95 : 0.75,
      cname_target: terminal,
    };
  }

  return { vulnerable: false };
}`}</code></pre>

        <h2>A real-world example</h2>
        <p>
          During onboarding, one of our customers — a mid-size financial services firm — ran their
          first full scan and discovered 14 dangling CNAME records. Three were pointed at
          deprovisioned Heroku apps, two at deleted S3 buckets, and the rest at various retired
          marketing and event platforms. None of these records appeared in their internal asset
          inventory. The Heroku CNAMEs were the highest risk, as they could have been claimed in
          under five minutes by anyone with a free Heroku account.
        </p>
        <p>
          The customer remediated all 14 records within 48 hours and implemented a quarterly DNS
          audit process triggered by SignalStack alerts.
        </p>

        <h2>Prevention strategies</h2>
        <p>
          Detection is important, but prevention is better. Here are the practices we recommend:
        </p>
        <ul>
          <li>
            Include DNS record cleanup in your service decommissioning checklist. The record should
            be removed before or simultaneously with the service teardown, not after.
          </li>
          <li>
            Use CNAME flattening or ALIAS records where possible — they resolve at the DNS level
            and fail closed if the target disappears.
          </li>
          <li>
            Implement Infrastructure as Code for DNS management. When DNS records are defined in
            Terraform or CloudFormation alongside the services they reference, deprovisioning the
            service naturally removes the record.
          </li>
          <li>
            Set up continuous monitoring with SignalStack to catch any records that slip through
            your process. No process is perfect — monitoring is the safety net.
          </li>
        </ul>
      </>
    ),
  },
  {
    slug: 'soc2-type-ii-journey',
    title: 'SOC 2 Type II: Our Journey to Compliance',
    author: 'Alex Rivera',
    role: 'CEO & Co-Founder',
    initials: 'AR',
    date: 'Jan 15, 2024',
    readTime: '6 min read',
    category: 'Company',
    content: (
      <>
        <p>
          In November 2023, SignalStack received our SOC 2 Type II certification. It was the
          culmination of eight months of focused effort, and it changed how we operate as a company
          in ways that went far beyond checking a compliance box. This post is a transparent look at
          what the process involved, what we learned, and what advice we would give to other
          startups on the same path.
        </p>

        <h2>Why SOC 2 matters for a security vendor</h2>
        <p>
          If you sell security software, you are asking customers to trust you with information about
          their vulnerabilities, their infrastructure, and their risk posture. That is some of the
          most sensitive data an organization has. SOC 2 Type II certification provides
          independently audited evidence that you handle that data responsibly. For us, it was not
          optional — it was table stakes.
        </p>
        <p>
          From a business standpoint, the impact was immediate. Three enterprise deals that had been
          stalled in procurement moved forward within weeks of receiving our certification. Several
          prospects told us directly that SOC 2 was a hard requirement on their vendor checklist. The
          certification paid for itself within the first quarter.
        </p>

        <h2>Timeline: from kickoff to certification</h2>
        <p>
          Our journey broke down into roughly four phases:
        </p>
        <ul>
          <li>
            <strong>Months 1-2: Gap analysis and scoping.</strong> We selected the Trust Service
            Criteria relevant to our business — Security, Availability, and Confidentiality — and
            conducted a gap analysis against our existing controls. We had decent security practices
            in place, but almost nothing was formally documented.
          </li>
          <li>
            <strong>Months 3-4: Control implementation.</strong> We built or formalized 47 controls
            spanning access management, change management, incident response, data encryption,
            vendor management, and employee security. This was the most labor-intensive phase.
          </li>
          <li>
            <strong>Months 5-7: Observation period.</strong> Type II certification requires
            demonstrating that your controls operate effectively over a period of time (our
            observation window was 90 days). During this period, we collected evidence continuously
            and resolved three minor control gaps the auditor identified during interim testing.
          </li>
          <li>
            <strong>Month 8: Audit and certification.</strong> Our auditor reviewed the evidence,
            conducted interviews with key personnel, and issued the report. We received an
            unqualified opinion — no exceptions noted.
          </li>
        </ul>

        <h2>Key controls we implemented</h2>
        <p>
          Some of the most impactful controls we put in place:
        </p>
        <ul>
          <li>
            <strong>Access control:</strong> Role-based access with quarterly access reviews. Every
            employee&apos;s access is scoped to what they need for their role, and we audit this
            every 90 days.
          </li>
          <li>
            <strong>Encryption:</strong> AES-256 at rest for all customer data, TLS 1.3 in transit,
            and customer-managed encryption keys for Enterprise customers. We also encrypt our
            database backups and audit logs.
          </li>
          <li>
            <strong>Monitoring:</strong> Centralized logging with 12-month retention, real-time
            alerting on security events, and automated anomaly detection on authentication patterns.
          </li>
          <li>
            <strong>Incident response:</strong> A documented IR plan with defined severity levels,
            escalation paths, communication templates, and a 24-hour notification SLA for
            security incidents affecting customer data.
          </li>
        </ul>

        <h2>Tools that made it manageable</h2>
        <p>
          We are a 40-person startup. We did not have a dedicated compliance team. Here is the stack
          that made SOC 2 achievable without one:
        </p>
        <ul>
          <li>
            <strong>Vanta</strong> for compliance automation — it continuously monitors your
            infrastructure against SOC 2 controls and auto-collects most of the evidence you need.
            This was the single most impactful tool in the process.
          </li>
          <li>
            <strong>AWS</strong> with CloudTrail, GuardDuty, and Config for infrastructure
            monitoring and audit trails.
          </li>
          <li>
            <strong>SignalStack</strong> — yes, we eat our own dogfood. We use our own platform to
            monitor our external attack surface and demonstrate continuous vulnerability management
            to our auditor.
          </li>
        </ul>

        <h2>Lessons learned</h2>
        <p>
          If you are starting your SOC 2 journey, here is what I wish someone had told us:
        </p>
        <ul>
          <li>
            <strong>Start early, even if you are not ready.</strong> Begin documenting your security
            practices now, even if they are informal. The gap between &quot;we do this&quot; and
            &quot;we can prove we do this&quot; is where most of the SOC 2 effort lives.
          </li>
          <li>
            <strong>Document everything.</strong> If it is not documented, it did not happen. Create
            policies, write runbooks, and log decisions. Your future self (and your auditor) will
            thank you.
          </li>
          <li>
            <strong>Automate evidence collection.</strong> Manual evidence gathering does not scale
            and introduces the risk of gaps. Use tools that pull evidence automatically from your
            infrastructure.
          </li>
          <li>
            <strong>Treat it as a security investment, not a compliance cost.</strong> Every control
            we implemented made us genuinely more secure. The policies we wrote clarified ambiguous
            practices. The access reviews found stale accounts. The incident response plan gave us
            confidence we were not previously entitled to.
          </li>
        </ul>
        <p>
          SOC 2 is not the end of the road — it is a foundation. We are already working toward ISO
          27001 certification and exploring FedRAMP readiness for government customers. But getting
          SOC 2 Type II right taught us how to think about compliance as continuous practice rather
          than a one-time project, and that mindset will serve us well for every framework that
          follows.
        </p>
      </>
    ),
  },
];

function ShareButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [copied, setCopied] = useState(false);

  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <Navbar />
        <div className="flex flex-col items-center justify-center px-4 py-40">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Post not found</h1>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            The blog post you are looking for does not exist.
          </p>
          <Link
            href="/blog"
            className="mt-8 inline-flex items-center gap-2 text-brand-600 dark:text-brand-400 font-medium hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const relatedPosts = posts.filter((p) => p.slug !== slug).slice(0, 3);

  const handleShareTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`,
      '_blank'
    );
  };

  const handleShareLinkedIn = () => {
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`,
      '_blank'
    );
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />

      <article className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          {/* Back link */}
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>

          {/* Category badge */}
          <div className="mt-8">
            <span
              className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
                categoryColors[post.category] || categoryColors.Product
              }`}
            >
              {post.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
            {post.title}
          </h1>

          {/* Author info */}
          <div className="mt-8 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-400 font-semibold text-sm">
              {post.initials}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{post.author}</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {post.role} &middot; {post.date} &middot; {post.readTime}
              </p>
            </div>
          </div>

          {/* Divider */}
          <hr className="mt-8 border-gray-200 dark:border-gray-800" />

          {/* Article content */}
          <div className="mt-10 prose-article">
            {post.content}
          </div>

          {/* Share section */}
          <div className="mt-16 border-t border-gray-200 dark:border-gray-800 pt-8">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider">
              Share this article
            </h3>
            <div className="mt-4 flex flex-wrap gap-3">
              <ShareButton icon={Twitter} label="Twitter" onClick={handleShareTwitter} />
              <ShareButton icon={Linkedin} label="LinkedIn" onClick={handleShareLinkedIn} />
              <ShareButton
                icon={copied ? Check : LinkIcon}
                label={copied ? 'Copied!' : 'Copy Link'}
                onClick={handleCopyLink}
              />
            </div>
          </div>
        </div>
      </article>

      {/* Related posts */}
      <section className="border-t border-gray-200 dark:border-gray-800 py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Related Articles</h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedPosts.map((rp) => (
              <Link
                key={rp.slug}
                href={`/blog/${rp.slug}`}
                className="group rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 hover:border-gray-300 dark:hover:border-gray-700 transition-colors"
              >
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    categoryColors[rp.category] || categoryColors.Product
                  }`}
                >
                  {rp.category}
                </span>
                <h3 className="mt-3 text-sm font-semibold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors leading-snug">
                  {rp.title}
                </h3>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
                  {rp.date} &middot; {rp.readTime}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      {/* Article typography styles */}
      <style jsx global>{`
        .prose-article p {
          margin-bottom: 1.25rem;
          line-height: 1.75;
          color: rgb(75 85 99);
        }

        :is(.dark) .prose-article p {
          color: rgb(156 163 175);
        }

        .prose-article h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: rgb(17 24 39);
          margin-top: 2rem;
          margin-bottom: 1rem;
          line-height: 1.3;
        }

        :is(.dark) .prose-article h2 {
          color: rgb(255 255 255);
        }

        .prose-article ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 1.25rem;
        }

        .prose-article li {
          margin-bottom: 0.75rem;
          line-height: 1.75;
          color: rgb(75 85 99);
        }

        :is(.dark) .prose-article li {
          color: rgb(156 163 175);
        }

        .prose-article strong {
          color: rgb(17 24 39);
          font-weight: 600;
        }

        :is(.dark) .prose-article strong {
          color: rgb(243 244 246);
        }

        .prose-article code {
          font-family: ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace;
          font-size: 0.875rem;
          background-color: rgb(243 244 246);
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          color: rgb(31 41 55);
        }

        :is(.dark) .prose-article code {
          background-color: rgb(31 41 55);
          color: rgb(209 213 219);
        }

        .prose-article pre {
          background-color: rgb(17 24 39);
          border-radius: 0.75rem;
          padding: 1.25rem;
          overflow-x: auto;
          margin-bottom: 1.25rem;
        }

        :is(.dark) .prose-article pre {
          background-color: rgb(3 7 18);
        }

        .prose-article pre code {
          background-color: transparent;
          padding: 0;
          border-radius: 0;
          color: rgb(229 231 235);
          font-size: 0.8125rem;
          line-height: 1.7;
        }

        :is(.dark) .prose-article pre code {
          background-color: transparent;
          color: rgb(229 231 235);
        }
      `}</style>
    </div>
  );
}
