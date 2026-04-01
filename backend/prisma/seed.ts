import { PrismaClient, UserRole, OrgMemberRole, AssetType, AssetStatus, Severity, FindingStatus, ReportFormat } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding SignalStack database...');

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.webhookEvent.deleteMany();
  await prisma.webhook.deleteMany();
  await prisma.fileAttachment.deleteMany();
  await prisma.apiToken.deleteMany();
  await prisma.report.deleteMany();
  await prisma.finding.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.organisationMember.deleteMany();
  await prisma.organisation.deleteMany();
  await prisma.user.deleteMany();

  // Create organisations
  const acme = await prisma.organisation.create({
    data: {
      id: uuidv4(),
      name: 'Acme Corp',
      slug: 'acme-corp',
      plan: 'enterprise',
    },
  });

  const techstart = await prisma.organisation.create({
    data: {
      id: uuidv4(),
      name: 'TechStart Inc',
      slug: 'techstart-inc',
      plan: 'pro',
    },
  });

  const globalsec = await prisma.organisation.create({
    data: {
      id: uuidv4(),
      name: 'GlobalSec Ltd',
      slug: 'globalsec-ltd',
      plan: 'enterprise',
    },
  });

  console.log('Created organisations');

  // Create users
  const hashPassword = async (pw: string) => bcrypt.hash(pw, 12);

  const admin = await prisma.user.create({
    data: {
      id: uuidv4(),
      email: 'admin@signalstack.io',
      name: 'Platform Admin',
      passwordHash: await hashPassword('admin123'),
      role: UserRole.ADMIN,
      bio: 'Platform administrator',
    },
  });

  const analyst = await prisma.user.create({
    data: {
      id: uuidv4(),
      email: 'analyst@acme.com',
      name: 'James Chen',
      passwordHash: await hashPassword('analyst123'),
      role: UserRole.ANALYST,
      bio: 'Senior security analyst at Acme Corp',
    },
  });

  const user = await prisma.user.create({
    data: {
      id: uuidv4(),
      email: 'user@acme.com',
      name: 'Emily Davis',
      passwordHash: await hashPassword('user123'),
      role: UserRole.USER,
      bio: 'DevOps engineer',
    },
  });

  const viewer = await prisma.user.create({
    data: {
      id: uuidv4(),
      email: 'viewer@techstart.com',
      name: 'Mike Johnson',
      passwordHash: await hashPassword('viewer123'),
      role: UserRole.USER,
      bio: 'CTO at TechStart',
    },
  });

  const sarah = await prisma.user.create({
    data: {
      id: uuidv4(),
      email: 'sarah@globalsec.com',
      name: 'Sarah Mitchell',
      passwordHash: await hashPassword('sarah123'),
      role: UserRole.ANALYST,
      bio: 'Penetration tester and security researcher',
    },
  });

  console.log('Created users');

  // Create organisation memberships
  await prisma.organisationMember.createMany({
    data: [
      { id: uuidv4(), userId: admin.id, orgId: acme.id, role: OrgMemberRole.OWNER },
      { id: uuidv4(), userId: analyst.id, orgId: acme.id, role: OrgMemberRole.ADMIN },
      { id: uuidv4(), userId: user.id, orgId: acme.id, role: OrgMemberRole.MEMBER },
      { id: uuidv4(), userId: admin.id, orgId: techstart.id, role: OrgMemberRole.OWNER },
      { id: uuidv4(), userId: viewer.id, orgId: techstart.id, role: OrgMemberRole.VIEWER },
      { id: uuidv4(), userId: sarah.id, orgId: globalsec.id, role: OrgMemberRole.OWNER },
    ],
  });

  console.log('Created memberships');

  // Create assets for Acme Corp
  const acmeAssets = await Promise.all([
    prisma.asset.create({
      data: {
        id: uuidv4(),
        orgId: acme.id,
        type: AssetType.DOMAIN,
        value: 'acme-corp.com',
        metadata: { registrar: 'Cloudflare', nameservers: ['ns1.cloudflare.com', 'ns2.cloudflare.com'] },
        status: AssetStatus.MONITORING,
        lastScanned: new Date('2024-01-15T10:30:00Z'),
      },
    }),
    prisma.asset.create({
      data: {
        id: uuidv4(),
        orgId: acme.id,
        type: AssetType.DOMAIN,
        value: 'api.acme-corp.com',
        metadata: { registrar: 'Cloudflare', ssl_expiry: '2025-03-15' },
        status: AssetStatus.MONITORING,
        lastScanned: new Date('2024-01-15T10:35:00Z'),
      },
    }),
    prisma.asset.create({
      data: {
        id: uuidv4(),
        orgId: acme.id,
        type: AssetType.IP,
        value: '203.0.113.50',
        metadata: { provider: 'AWS', region: 'us-east-1', type: 'EC2' },
        status: AssetStatus.ACTIVE,
        lastScanned: new Date('2024-01-14T08:00:00Z'),
      },
    }),
    prisma.asset.create({
      data: {
        id: uuidv4(),
        orgId: acme.id,
        type: AssetType.API,
        value: 'https://api.acme-corp.com/v2',
        metadata: { spec: 'OpenAPI 3.0', auth: 'OAuth2' },
        status: AssetStatus.ACTIVE,
      },
    }),
    prisma.asset.create({
      data: {
        id: uuidv4(),
        orgId: acme.id,
        type: AssetType.SERVICE,
        value: 'acme-payments-service',
        metadata: { port: 8443, protocol: 'gRPC', version: '2.1.0' },
        status: AssetStatus.MONITORING,
        lastScanned: new Date('2024-01-15T12:00:00Z'),
      },
    }),
  ]);

  // Create assets for TechStart
  const techstartAssets = await Promise.all([
    prisma.asset.create({
      data: {
        id: uuidv4(),
        orgId: techstart.id,
        type: AssetType.DOMAIN,
        value: 'techstart.io',
        metadata: { registrar: 'GoDaddy', cdn: 'Fastly' },
        status: AssetStatus.MONITORING,
        lastScanned: new Date('2024-01-14T15:00:00Z'),
      },
    }),
    prisma.asset.create({
      data: {
        id: uuidv4(),
        orgId: techstart.id,
        type: AssetType.IP,
        value: '198.51.100.22',
        metadata: { provider: 'GCP', region: 'us-central1' },
        status: AssetStatus.ACTIVE,
      },
    }),
  ]);

  // Create assets for GlobalSec
  const globalsecAssets = await Promise.all([
    prisma.asset.create({
      data: {
        id: uuidv4(),
        orgId: globalsec.id,
        type: AssetType.DOMAIN,
        value: 'globalsec.com',
        metadata: { registrar: 'Namecheap', waf: 'Cloudflare' },
        status: AssetStatus.MONITORING,
        lastScanned: new Date('2024-01-15T09:00:00Z'),
      },
    }),
    prisma.asset.create({
      data: {
        id: uuidv4(),
        orgId: globalsec.id,
        type: AssetType.API,
        value: 'https://api.globalsec.com/v1',
        metadata: { spec: 'REST', auth: 'API Key' },
        status: AssetStatus.ACTIVE,
      },
    }),
  ]);

  console.log('Created assets');

  // Create findings for Acme Corp
  const acmeFindings = await Promise.all([
    prisma.finding.create({
      data: {
        id: uuidv4(),
        assetId: acmeAssets[0].id,
        orgId: acme.id,
        title: 'SSL Certificate Weak Cipher Suite',
        description: 'The server supports TLS_RSA_WITH_AES_128_CBC_SHA which is considered weak. This cipher suite does not provide forward secrecy and is vulnerable to BEAST attacks.',
        severity: Severity.MEDIUM,
        confidence: 0.95,
        status: FindingStatus.OPEN,
        rawData: {
          cipher: 'TLS_RSA_WITH_AES_128_CBC_SHA',
          protocol: 'TLSv1.2',
          port: 443,
          tool: 'ssl-scan',
        },
      },
    }),
    prisma.finding.create({
      data: {
        id: uuidv4(),
        assetId: acmeAssets[0].id,
        orgId: acme.id,
        title: 'Missing HTTP Security Headers',
        description: 'The application is missing several recommended security headers including Content-Security-Policy, X-Content-Type-Options, and Permissions-Policy.',
        severity: Severity.LOW,
        confidence: 1.0,
        status: FindingStatus.CONFIRMED,
        rawData: {
          missing_headers: ['Content-Security-Policy', 'Permissions-Policy', 'Referrer-Policy'],
          url: 'https://acme-corp.com',
          tool: 'header-check',
        },
      },
    }),
    prisma.finding.create({
      data: {
        id: uuidv4(),
        assetId: acmeAssets[1].id,
        orgId: acme.id,
        title: 'API Rate Limiting Not Enforced',
        description: 'The API endpoint /v2/users does not enforce rate limiting. An attacker could perform brute-force or enumeration attacks without being throttled.',
        severity: Severity.HIGH,
        confidence: 0.9,
        status: FindingStatus.OPEN,
        rawData: {
          endpoint: '/v2/users',
          method: 'GET',
          requests_sent: 1000,
          requests_blocked: 0,
          tool: 'rate-limit-check',
        },
      },
    }),
    prisma.finding.create({
      data: {
        id: uuidv4(),
        assetId: acmeAssets[2].id,
        orgId: acme.id,
        title: 'Open SSH Port with Password Authentication',
        description: 'SSH service on port 22 allows password authentication. Key-based authentication should be enforced to prevent brute-force attacks.',
        severity: Severity.HIGH,
        confidence: 0.85,
        status: FindingStatus.OPEN,
        rawData: {
          port: 22,
          service: 'OpenSSH 8.9p1',
          auth_methods: ['publickey', 'password'],
          tool: 'port-scan',
        },
      },
    }),
    prisma.finding.create({
      data: {
        id: uuidv4(),
        assetId: acmeAssets[3].id,
        orgId: acme.id,
        title: 'GraphQL Introspection Enabled in Production',
        description: 'The GraphQL endpoint allows introspection queries, potentially exposing the entire API schema to attackers for reconnaissance.',
        severity: Severity.MEDIUM,
        confidence: 1.0,
        status: FindingStatus.OPEN,
        rawData: {
          endpoint: '/v2/graphql',
          introspection_enabled: true,
          schema_types_count: 47,
          tool: 'graphql-scanner',
        },
      },
    }),
    prisma.finding.create({
      data: {
        id: uuidv4(),
        assetId: acmeAssets[4].id,
        orgId: acme.id,
        title: 'Outdated gRPC Library with Known CVE',
        description: 'The payment service is running grpc-go v1.53.0 which is affected by CVE-2023-44487 (HTTP/2 Rapid Reset). Update to v1.58.3 or later.',
        severity: Severity.CRITICAL,
        confidence: 0.92,
        status: FindingStatus.CONFIRMED,
        rawData: {
          library: 'grpc-go',
          version: '1.53.0',
          cve: 'CVE-2023-44487',
          cvss: 7.5,
          tool: 'dependency-scan',
        },
      },
    }),
  ]);

  // Create findings for TechStart
  await Promise.all([
    prisma.finding.create({
      data: {
        id: uuidv4(),
        assetId: techstartAssets[0].id,
        orgId: techstart.id,
        title: 'Subdomain Takeover Risk - Dangling CNAME',
        description: 'The subdomain staging.techstart.io has a CNAME pointing to an unclaimed Heroku app. An attacker could claim this hostname.',
        severity: Severity.HIGH,
        confidence: 0.88,
        status: FindingStatus.OPEN,
        rawData: {
          subdomain: 'staging.techstart.io',
          cname: 'ancient-river-1234.herokuapp.com',
          status: 'NXDOMAIN',
          tool: 'subdomain-enum',
        },
      },
    }),
    prisma.finding.create({
      data: {
        id: uuidv4(),
        assetId: techstartAssets[1].id,
        orgId: techstart.id,
        title: 'Exposed Kubernetes Dashboard',
        description: 'Kubernetes dashboard is accessible on port 30000 without authentication. This could allow full cluster access.',
        severity: Severity.CRITICAL,
        confidence: 0.95,
        status: FindingStatus.OPEN,
        rawData: {
          port: 30000,
          path: '/dashboard',
          auth_required: false,
          k8s_version: '1.27.3',
          tool: 'port-scan',
        },
      },
    }),
  ]);

  // Create findings for GlobalSec
  await Promise.all([
    prisma.finding.create({
      data: {
        id: uuidv4(),
        assetId: globalsecAssets[0].id,
        orgId: globalsec.id,
        title: 'DMARC Policy Set to None',
        description: 'The DMARC record for globalsec.com is set to p=none, which does not prevent email spoofing. Consider upgrading to p=quarantine or p=reject.',
        severity: Severity.MEDIUM,
        confidence: 1.0,
        status: FindingStatus.OPEN,
        rawData: {
          record: 'v=DMARC1; p=none; rua=mailto:dmarc@globalsec.com',
          tool: 'dns-check',
        },
      },
    }),
  ]);

  console.log('Created findings');

  // Create webhooks
  await prisma.webhook.create({
    data: {
      id: uuidv4(),
      orgId: acme.id,
      url: 'https://hooks.slack.com/services/T0FAKE/B0FAKE/xxxxxxxxxxxx',
      secret: 'whsec_acme_2024_prod_key',
      events: ['finding.created', 'finding.status_changed', 'scan.completed'],
      active: true,
    },
  });

  await prisma.webhook.create({
    data: {
      id: uuidv4(),
      orgId: techstart.id,
      url: 'https://api.pagerduty.com/webhooks/v3/fake-endpoint',
      secret: 'whsec_techstart_pd_integration',
      events: ['finding.created'],
      active: true,
    },
  });

  console.log('Created webhooks');

  // Create reports
  await prisma.report.create({
    data: {
      id: uuidv4(),
      orgId: acme.id,
      title: 'Acme Corp - Monthly Security Assessment (January 2024)',
      format: ReportFormat.PDF,
      filters: { severity: ['CRITICAL', 'HIGH'], dateRange: { from: '2024-01-01', to: '2024-01-31' } },
      generatedBy: analyst.id,
      filePath: '/reports/acme/monthly-jan-2024.pdf',
    },
  });

  await prisma.report.create({
    data: {
      id: uuidv4(),
      orgId: acme.id,
      title: 'Acme Corp - Asset Inventory Export',
      format: ReportFormat.CSV,
      filters: { type: ['DOMAIN', 'IP'] },
      generatedBy: analyst.id,
      filePath: '/reports/acme/asset-inventory.csv',
    },
  });

  console.log('Created reports');

  // Create audit logs
  await prisma.auditLog.createMany({
    data: [
      {
        id: uuidv4(),
        userId: admin.id,
        orgId: acme.id,
        action: 'user.login',
        details: { method: 'password' },
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      },
      {
        id: uuidv4(),
        userId: analyst.id,
        orgId: acme.id,
        action: 'finding.status_changed',
        details: { findingId: acmeFindings[1].id, from: 'OPEN', to: 'CONFIRMED' },
        ipAddress: '10.0.0.55',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      {
        id: uuidv4(),
        userId: analyst.id,
        orgId: acme.id,
        action: 'report.generated',
        details: { format: 'PDF', title: 'Monthly Security Assessment' },
        ipAddress: '10.0.0.55',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
    ],
  });

  console.log('Created audit logs');
  console.log('Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
