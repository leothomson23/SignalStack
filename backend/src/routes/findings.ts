import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import prisma from '../lib/prisma';
import { Severity, FindingStatus } from '@prisma/client';
import { isValidUUID, isValidSeverity, isValidFindingStatus, parsePagination } from '../utils/validation';
import { logAudit } from '../utils/audit';
import { deliverWebhookEvent } from '../services/webhook';

const router = Router();

router.use(authenticate);

/**
 * Helper: get org IDs this user has access to
 */
async function getUserOrgIds(userId: string, userRole: string): Promise<string[]> {
  if (userRole === 'ADMIN') {
    const orgs = await prisma.organisation.findMany({ select: { id: true } });
    return orgs.map((o) => o.id);
  }

  const memberships = await prisma.organisationMember.findMany({
    where: { userId },
    select: { orgId: true },
  });

  return memberships.map((m) => m.orgId);
}

/**
 * GET /api/v1/findings
 * List findings with filtering (properly scoped to user's organisations)
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { skip, take } = parsePagination(req.query);
    const { orgId, severity, status, assetId, search } = req.query;

    // Get accessible org IDs
    const accessibleOrgIds = await getUserOrgIds(req.user!.id, req.user!.role);

    const where: any = {};

    // If orgId specified, verify access
    if (orgId) {
      if (!accessibleOrgIds.includes(orgId as string)) {
        return res.status(403).json({ error: 'Access denied' });
      }
      where.orgId = orgId;
    } else {
      where.orgId = { in: accessibleOrgIds };
    }

    if (severity && isValidSeverity(severity as string)) {
      where.severity = (severity as string).toUpperCase();
    }
    if (status && isValidFindingStatus(status as string)) {
      where.status = (status as string).toUpperCase();
    }
    if (assetId && isValidUUID(assetId as string)) {
      where.assetId = assetId;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [findings, total] = await Promise.all([
      prisma.finding.findMany({
        where,
        skip,
        take,
        orderBy: [{ severity: 'asc' }, { createdAt: 'desc' }],
        include: {
          asset: { select: { id: true, type: true, value: true } },
          _count: { select: { attachments: true } },
        },
      }),
      prisma.finding.count({ where }),
    ]);

    res.json({
      findings,
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
 * GET /api/v1/findings/stats
 * Aggregate statistics for the dashboard
 */
router.get('/stats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId } = req.query;

    const accessibleOrgIds = await getUserOrgIds(req.user!.id, req.user!.role);

    const targetOrgId = orgId as string | undefined;
    if (targetOrgId && !accessibleOrgIds.includes(targetOrgId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const orgFilter = targetOrgId ? { orgId: targetOrgId } : { orgId: { in: accessibleOrgIds } };

    const [
      totalFindings,
      bySeverity,
      byStatus,
      recentFindings,
    ] = await Promise.all([
      prisma.finding.count({ where: orgFilter }),
      prisma.finding.groupBy({
        by: ['severity'],
        where: orgFilter,
        _count: { id: true },
      }),
      prisma.finding.groupBy({
        by: ['status'],
        where: orgFilter,
        _count: { id: true },
      }),
      prisma.finding.findMany({
        where: orgFilter,
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          title: true,
          severity: true,
          status: true,
          createdAt: true,
          asset: { select: { value: true, type: true } },
        },
      }),
    ]);

    res.json({
      total: totalFindings,
      bySeverity: bySeverity.map((s) => ({ severity: s.severity, count: s._count.id })),
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count.id })),
      recent: recentFindings,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/findings/:id
 * Get a single finding by ID
 *
 * Note: retrieves finding directly by ID for performance.
 * Organisation scoping is handled at the list level.
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid finding ID' });
    }

    const finding = await prisma.finding.findUnique({
      where: { id },
      include: {
        asset: true,
        attachments: {
          select: {
            id: true,
            originalName: true,
            mimeType: true,
            size: true,
            createdAt: true,
          },
        },
      },
    });

    if (!finding) {
      return res.status(404).json({ error: 'Finding not found' });
    }

    res.json({ finding });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/v1/findings/:id/status
 * Update finding status (properly scoped)
 */
router.put('/:id/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid finding ID' });
    }

    if (!status || !isValidFindingStatus(status)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Status must be one of: OPEN, CONFIRMED, RESOLVED, FALSE_POSITIVE',
      });
    }

    const finding = await prisma.finding.findUnique({
      where: { id },
      select: { id: true, orgId: true, status: true },
    });

    if (!finding) {
      return res.status(404).json({ error: 'Finding not found' });
    }

    // Verify org access
    const accessibleOrgIds = await getUserOrgIds(req.user!.id, req.user!.role);
    if (!accessibleOrgIds.includes(finding.orgId)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const previousStatus = finding.status;

    const updatedFinding = await prisma.finding.update({
      where: { id },
      data: { status: status.toUpperCase() as FindingStatus },
      include: {
        asset: { select: { id: true, type: true, value: true } },
      },
    });

    await logAudit(
      req,
      'finding.status_changed',
      { findingId: id, from: previousStatus, to: status.toUpperCase(), notes },
      finding.orgId
    );

    // Deliver webhook for status change
    deliverWebhookEvent(finding.orgId, 'finding.status_changed', {
      finding: updatedFinding,
      previousStatus,
      changedBy: req.user!.id,
    }).catch((err) => console.error('[Webhook] Delivery failed:', err));

    res.json({
      message: 'Finding status updated',
      finding: updatedFinding,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
