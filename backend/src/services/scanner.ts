import prisma from '../lib/prisma';
import { AssetType, Severity, FindingStatus } from '@prisma/client';
import { deliverWebhookEvent } from './webhook';

/**
 * Simulated security scanner service.
 * In a real deployment, this would integrate with actual scanning tools
 * (Nmap, Nuclei, OWASP ZAP, etc.)
 */

interface ScanResult {
  title: string;
  description: string;
  severity: Severity;
  confidence: number;
  rawData: Record<string, any>;
}

/**
 * Generate realistic scan findings based on asset type
 */
function generateFindings(assetType: AssetType, assetValue: string): ScanResult[] {
  const findings: ScanResult[] = [];

  switch (assetType) {
    case 'DOMAIN': {
      const domainChecks: ScanResult[] = [
        {
          title: 'DNSSEC Not Configured',
          description: `The domain ${assetValue} does not have DNSSEC enabled. This makes it vulnerable to DNS spoofing and cache poisoning attacks.`,
          severity: 'MEDIUM',
          confidence: 1.0,
          rawData: { check: 'dnssec', domain: assetValue, result: 'not_configured', tool: 'dns-check' },
        },
        {
          title: 'SPF Record Too Permissive',
          description: `The SPF record for ${assetValue} uses ~all (softfail) instead of -all (hardfail). This may allow email spoofing.`,
          severity: 'LOW',
          confidence: 0.9,
          rawData: { check: 'spf', domain: assetValue, record: 'v=spf1 include:_spf.google.com ~all', tool: 'dns-check' },
        },
        {
          title: 'Subdomains Discovered via Certificate Transparency',
          description: `Certificate transparency logs reveal additional subdomains for ${assetValue} that may expand the attack surface.`,
          severity: 'INFO',
          confidence: 1.0,
          rawData: {
            check: 'ct_logs',
            domain: assetValue,
            subdomains: [`staging.${assetValue}`, `dev.${assetValue}`, `api-v2.${assetValue}`],
            tool: 'ct-scan',
          },
        },
      ];
      // Randomly include 1-3 findings
      const count = Math.floor(Math.random() * domainChecks.length) + 1;
      findings.push(...domainChecks.slice(0, count));
      break;
    }

    case 'IP': {
      const ipChecks: ScanResult[] = [
        {
          title: 'Unnecessary Open Ports Detected',
          description: `Port scan of ${assetValue} revealed services running on non-standard ports that may not be required.`,
          severity: 'MEDIUM',
          confidence: 0.85,
          rawData: {
            target: assetValue,
            open_ports: [22, 80, 443, 8080, 8443, 9090],
            tool: 'port-scan',
          },
        },
        {
          title: 'Server Banner Disclosure',
          description: `The web server on ${assetValue} discloses its version in response headers (Server: nginx/1.21.4). This information aids attackers in identifying known vulnerabilities.`,
          severity: 'LOW',
          confidence: 0.95,
          rawData: {
            target: assetValue,
            header: 'Server',
            value: 'nginx/1.21.4',
            tool: 'header-check',
          },
        },
      ];
      findings.push(...ipChecks.slice(0, Math.floor(Math.random() * 2) + 1));
      break;
    }

    case 'API': {
      const apiChecks: ScanResult[] = [
        {
          title: 'API Endpoint Allows Unauthenticated Access',
          description: `The API endpoint ${assetValue}/health returns detailed system information without authentication.`,
          severity: 'MEDIUM',
          confidence: 0.9,
          rawData: {
            endpoint: `${assetValue}/health`,
            method: 'GET',
            auth_required: false,
            response_includes: ['database_status', 'version', 'uptime'],
            tool: 'api-scanner',
          },
        },
        {
          title: 'Missing Rate Limiting on Authentication Endpoint',
          description: `The API at ${assetValue}/auth/login does not enforce rate limiting, making it susceptible to credential stuffing attacks.`,
          severity: 'HIGH',
          confidence: 0.92,
          rawData: {
            endpoint: `${assetValue}/auth/login`,
            method: 'POST',
            requests_sent: 500,
            requests_blocked: 0,
            tool: 'rate-limit-check',
          },
        },
      ];
      findings.push(...apiChecks);
      break;
    }

    case 'SERVICE': {
      const serviceChecks: ScanResult[] = [
        {
          title: 'Service Running Outdated Version',
          description: `The service ${assetValue} appears to be running an outdated version with known security patches available.`,
          severity: 'HIGH',
          confidence: 0.75,
          rawData: {
            service: assetValue,
            detected_version: '2.1.0',
            latest_version: '2.5.3',
            cves: ['CVE-2024-1234'],
            tool: 'version-check',
          },
        },
        {
          title: 'TLS Configuration Allows Downgrade',
          description: `The service ${assetValue} supports TLS 1.0 and 1.1 which are deprecated. Only TLS 1.2+ should be allowed.`,
          severity: 'MEDIUM',
          confidence: 0.95,
          rawData: {
            service: assetValue,
            supported_protocols: ['TLSv1.0', 'TLSv1.1', 'TLSv1.2', 'TLSv1.3'],
            tool: 'ssl-scan',
          },
        },
      ];
      findings.push(...serviceChecks.slice(0, Math.floor(Math.random() * 2) + 1));
      break;
    }
  }

  return findings;
}

/**
 * Trigger a scan for a specific asset
 */
export async function triggerAssetScan(assetId: string): Promise<void> {
  console.log(`[Scanner] Starting scan for asset: ${assetId}`);

  const asset = await prisma.asset.findUnique({ where: { id: assetId } });
  if (!asset) {
    console.error(`[Scanner] Asset not found: ${assetId}`);
    return;
  }

  try {
    // Simulate scan delay (1-3 seconds)
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000));

    const scanResults = generateFindings(asset.type, asset.value);

    // Create findings from scan results
    for (const result of scanResults) {
      // Check for duplicate findings
      const existing = await prisma.finding.findFirst({
        where: {
          assetId: asset.id,
          title: result.title,
          status: { not: 'RESOLVED' },
        },
      });

      if (existing) {
        console.log(`[Scanner] Skipping duplicate finding: ${result.title}`);
        continue;
      }

      const finding = await prisma.finding.create({
        data: {
          assetId: asset.id,
          orgId: asset.orgId,
          title: result.title,
          description: result.description,
          severity: result.severity,
          confidence: result.confidence,
          status: FindingStatus.OPEN,
          rawData: result.rawData,
        },
      });

      // Deliver webhook notification
      deliverWebhookEvent(asset.orgId, 'finding.created', {
        finding: {
          id: finding.id,
          title: finding.title,
          severity: finding.severity,
          asset: { type: asset.type, value: asset.value },
        },
      }).catch((err) => console.error('[Scanner] Webhook delivery failed:', err));
    }

    // Update asset scan timestamp
    await prisma.asset.update({
      where: { id: assetId },
      data: { lastScanned: new Date() },
    });

    // Deliver scan completed webhook
    deliverWebhookEvent(asset.orgId, 'scan.completed', {
      assetId: asset.id,
      assetValue: asset.value,
      findingsCount: scanResults.length,
      completedAt: new Date().toISOString(),
    }).catch((err) => console.error('[Scanner] Webhook delivery failed:', err));

    console.log(`[Scanner] Scan completed for ${asset.value}. Found ${scanResults.length} issues.`);
  } catch (err) {
    console.error(`[Scanner] Scan failed for asset ${assetId}:`, err);
  }
}

/**
 * Scan all assets that are due for scanning
 * (called by the background cron job)
 */
export async function scanDueAssets(): Promise<void> {
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

  const assetsToScan = await prisma.asset.findMany({
    where: {
      status: { in: ['ACTIVE', 'MONITORING'] },
      OR: [
        { lastScanned: null },
        { lastScanned: { lt: sixHoursAgo } },
      ],
    },
    take: 10, // Process max 10 assets per cycle
    orderBy: { lastScanned: 'asc' },
  });

  console.log(`[Scanner] Found ${assetsToScan.length} assets due for scanning`);

  for (const asset of assetsToScan) {
    await triggerAssetScan(asset.id);
  }
}
