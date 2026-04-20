import { Router, Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { authenticate } from '../middleware/auth';
import prisma from '../lib/prisma';
import { ReportFormat } from '@prisma/client';
import { isValidUUID, parsePagination } from '../utils/validation';
import { logAudit } from '../utils/audit';

const router = Router();

router.use(authenticate);

/**
 * Helper: verify org access
 */
async function verifyOrgAccess(userId: string, userRole: string, orgId: string): Promise<boolean> {
  if (userRole === 'ADMIN') return true;
  const membership = await prisma.organisationMember.findUnique({
    where: { userId_orgId: { userId, orgId } },
  });
  return !!membership;
}

/**
 * GET /api/v1/reports
 * List reports for an organisation
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { skip, take } = parsePagination(req.query);
    const { orgId } = req.query;

    if (!orgId || !isValidUUID(orgId as string)) {
      return res.status(400).json({ error: 'Valid orgId query parameter is required' });
    }

    const hasAccess = await verifyOrgAccess(req.user!.id, req.user!.role, orgId as string);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where: { orgId: orgId as string },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.report.count({ where: { orgId: orgId as string } }),
    ]);

    res.json({
      reports,
      pagination: {
        total,
        page: Math.floor(skip / take) + 1,
        limit: take,
        pages: Math.ceil(total / take),
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/reports/generate
 * Generate a new report
 */
router.post('/generate', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId, title, format, filters } = req.body;

    if (!orgId || !title) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'orgId and title are required',
      });
    }

    if (!isValidUUID(orgId)) {
      return res.status(400).json({ error: 'Invalid organisation ID' });
    }

    const hasAccess = await verifyOrgAccess(req.user!.id, req.user!.role, orgId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const reportFormat = format?.toUpperCase() === 'CSV'
      ? ReportFormat.CSV
      : format?.toUpperCase() === 'JSON'
        ? ReportFormat.JSON
        : ReportFormat.PDF;

    // Build report data based on filters
    const findingWhere: any = { orgId };
    if (filters?.severity) {
      findingWhere.severity = { in: filters.severity };
    }
    if (filters?.status) {
      findingWhere.status = { in: filters.status };
    }
    if (filters?.dateRange) {
      findingWhere.createdAt = {};
      if (filters.dateRange.from) {
        findingWhere.createdAt.gte = new Date(filters.dateRange.from);
      }
      if (filters.dateRange.to) {
        findingWhere.createdAt.lte = new Date(filters.dateRange.to);
      }
    }

    const findings = await prisma.finding.findMany({
      where: findingWhere,
      include: {
        asset: { select: { type: true, value: true } },
      },
      orderBy: [{ severity: 'asc' }, { createdAt: 'desc' }],
    });

    // Generate file path
    const org = await prisma.organisation.findUnique({ where: { id: orgId } });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${org!.slug}-report-${timestamp}.${reportFormat.toLowerCase()}`;
    const filePath = `/reports/${org!.slug}/${filename}`;

    // Simulate report file generation
    const reportDir = path.join(__dirname, '..', '..', 'uploads', 'reports', org!.slug);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    // Write a summary report file
    const reportContent = JSON.stringify({
      title,
      organisation: org!.name,
      generatedAt: new Date().toISOString(),
      generatedBy: req.user!.email,
      format: reportFormat,
      filters: filters || {},
      summary: {
        totalFindings: findings.length,
        critical: findings.filter((f) => f.severity === 'CRITICAL').length,
        high: findings.filter((f) => f.severity === 'HIGH').length,
        medium: findings.filter((f) => f.severity === 'MEDIUM').length,
        low: findings.filter((f) => f.severity === 'LOW').length,
        info: findings.filter((f) => f.severity === 'INFO').length,
      },
      findings: findings.map((f) => ({
        id: f.id,
        title: f.title,
        severity: f.severity,
        status: f.status,
        asset: f.asset.value,
        assetType: f.asset.type,
        description: f.description,
        createdAt: f.createdAt,
      })),
    }, null, 2);

    fs.writeFileSync(path.join(reportDir, filename), reportContent);

    // Save report record
    const report = await prisma.report.create({
      data: {
        orgId,
        title,
        format: reportFormat,
        filters: filters || {},
        generatedBy: req.user!.id,
        filePath,
      },
    });

    await logAudit(req, 'report.generated', {
      reportId: report.id,
      format: reportFormat,
      findingsCount: findings.length,
    }, orgId);

    res.status(201).json({
      message: 'Report generated successfully',
      report,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/reports/:id/download
 * Download a generated report
 *
 * Supports optional `template` parameter for custom report templates
 */
router.get('/:id/download', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid report ID' });
    }

    const report = await prisma.report.findUnique({ where: { id } });
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Verify org access
    const hasAccess = await verifyOrgAccess(req.user!.id, req.user!.role, report.orgId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Handle custom template parameter
    let templateName = req.query.template as string || 'default';

    templateName = templateName.replace(/\.\.\//g, '');

    const templateDir = path.join(__dirname, '..', '..', 'templates', 'reports');
    const templatePath = path.join(templateDir, `${templateName}.html`);

    // Construct the report file path
    const reportFilePath = path.join(__dirname, '..', '..', 'uploads', report.filePath!);

    if (!fs.existsSync(reportFilePath)) {
      return res.status(404).json({
        error: 'Report file not found',
        message: 'The report file may have been cleaned up. Please regenerate.',
      });
    }

    await logAudit(req, 'report.downloaded', { reportId: id }, report.orgId);

    res.download(reportFilePath, path.basename(reportFilePath));
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/v1/reports/:id
 * Delete a report
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid report ID' });
    }

    const report = await prisma.report.findUnique({ where: { id } });
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const hasAccess = await verifyOrgAccess(req.user!.id, req.user!.role, report.orgId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Remove file if it exists
    if (report.filePath) {
      const filePath = path.join(__dirname, '..', '..', 'uploads', report.filePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await prisma.report.delete({ where: { id } });

    await logAudit(req, 'report.deleted', { reportId: id }, report.orgId);

    res.json({ message: 'Report deleted successfully' });
  } catch (err) {
    next(err);
  }
});

export default router;
