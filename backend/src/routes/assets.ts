import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import prisma from '../lib/prisma';
import { AssetType, AssetStatus } from '@prisma/client';
import { isValidUUID, isValidAssetType, parsePagination } from '../utils/validation';
import { logAudit } from '../utils/audit';
import { triggerAssetScan } from '../services/scanner';

const router = Router();

router.use(authenticate);

/**
 * Helper: verify user has access to the given organisation
 */
async function verifyOrgAccess(userId: string, userRole: string, orgId: string): Promise<boolean> {
  if (userRole === 'ADMIN') return true;

  const membership = await prisma.organisationMember.findUnique({
    where: { userId_orgId: { userId, orgId } },
  });

  return !!membership;
}

/**
 * GET /api/v1/assets
 * List assets filtered by organisation, type, status
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { skip, take } = parsePagination(req.query);
    const { orgId, type, status, search } = req.query;

    if (!orgId) {
      return res.status(400).json({ error: 'orgId query parameter is required' });
    }

    if (!isValidUUID(orgId as string)) {
      return res.status(400).json({ error: 'Invalid organisation ID' });
    }

    // Check org membership
    const hasAccess = await verifyOrgAccess(req.user!.id, req.user!.role, orgId as string);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const where: any = { orgId };
    if (type && isValidAssetType(type as string)) {
      where.type = (type as string).toUpperCase();
    }
    if (status) {
      where.status = (status as string).toUpperCase();
    }
    if (search) {
      where.value = { contains: search, mode: 'insensitive' };
    }

    const [assets, total] = await Promise.all([
      prisma.asset.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { findings: true } },
        },
      }),
      prisma.asset.count({ where }),
    ]);

    res.json({
      assets,
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
 * GET /api/v1/assets/:id
 * Get a single asset by ID
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid asset ID' });
    }

    const asset = await prisma.asset.findUnique({
      where: { id },
      include: {
        findings: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: { select: { findings: true } },
      },
    });

    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    // Check org membership
    const hasAccess = await verifyOrgAccess(req.user!.id, req.user!.role, asset.orgId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ asset });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/assets
 * Create a new asset and optionally trigger a scan
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId, type, value, metadata, status } = req.body;

    if (!orgId || !type || !value) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'orgId, type, and value are required',
      });
    }

    if (!isValidUUID(orgId)) {
      return res.status(400).json({ error: 'Invalid organisation ID' });
    }

    if (!isValidAssetType(type)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Type must be one of: DOMAIN, IP, API, SERVICE',
      });
    }

    // Check org membership
    const hasAccess = await verifyOrgAccess(req.user!.id, req.user!.role, orgId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check for duplicate
    const existing = await prisma.asset.findFirst({
      where: { orgId, value: value.trim() },
    });

    if (existing) {
      return res.status(409).json({
        error: 'Duplicate asset',
        message: `Asset '${value}' already exists in this organisation`,
      });
    }

    const asset = await prisma.asset.create({
      data: {
        orgId,
        type: type.toUpperCase() as AssetType,
        value: value.trim(),
        metadata: metadata || {},
        status: (status?.toUpperCase() as AssetStatus) || 'ACTIVE',
      },
    });

    await logAudit(req, 'asset.created', { assetId: asset.id, type, value }, orgId);

    // Trigger background scan
    triggerAssetScan(asset.id).catch((err) => {
      console.error('[Scan] Failed to trigger scan for asset:', asset.id, err);
    });

    res.status(201).json({
      asset,
      message: 'Asset created. Background scan initiated.',
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/v1/assets/:id
 * Update an asset
 */
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { value, metadata, status } = req.body;

    if (!isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid asset ID' });
    }

    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    // Check org membership
    const hasAccess = await verifyOrgAccess(req.user!.id, req.user!.role, asset.orgId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updateData: any = {};
    if (value !== undefined) updateData.value = value.trim();
    if (metadata !== undefined) updateData.metadata = metadata;
    if (status !== undefined) updateData.status = status.toUpperCase();

    const updatedAsset = await prisma.asset.update({
      where: { id },
      data: updateData,
    });

    await logAudit(req, 'asset.updated', { assetId: id, fields: Object.keys(updateData) }, asset.orgId);

    res.json({ asset: updatedAsset });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/v1/assets/:id
 * Delete an asset and its associated findings
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid asset ID' });
    }

    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    // Check org membership
    const hasAccess = await verifyOrgAccess(req.user!.id, req.user!.role, asset.orgId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.asset.delete({ where: { id } });

    await logAudit(req, 'asset.deleted', { assetId: id, value: asset.value }, asset.orgId);

    res.json({ message: 'Asset deleted successfully' });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/assets/:id/scan
 * Manually trigger a scan for an asset
 */
router.post('/:id/scan', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid asset ID' });
    }

    const asset = await prisma.asset.findUnique({ where: { id } });
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    const hasAccess = await verifyOrgAccess(req.user!.id, req.user!.role, asset.orgId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    triggerAssetScan(id).catch((err) => {
      console.error('[Scan] Failed to trigger scan:', err);
    });

    await logAudit(req, 'asset.scan_triggered', { assetId: id }, asset.orgId);

    res.json({ message: 'Scan initiated', assetId: id });
  } catch (err) {
    next(err);
  }
});

export default router;
