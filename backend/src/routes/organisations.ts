import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import prisma from '../lib/prisma';
import { UserRole, OrgMemberRole } from '@prisma/client';
import { isValidUUID, isValidEmail, parsePagination } from '../utils/validation';
import { logAudit } from '../utils/audit';

const router = Router();

router.use(authenticate);

/**
 * GET /api/v1/organisations
 * List organisations the current user belongs to (admins see all)
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { skip, take } = parsePagination(req.query);

    let where: any = {};

    // Non-admin users only see orgs they belong to
    if (req.user!.role !== 'ADMIN') {
      const memberships = await prisma.organisationMember.findMany({
        where: { userId: req.user!.id },
        select: { orgId: true },
      });
      where.id = { in: memberships.map((m) => m.orgId) };
    }

    const [orgs, total] = await Promise.all([
      prisma.organisation.findMany({
        where,
        skip,
        take,
        orderBy: { name: 'asc' },
        include: {
          _count: { select: { members: true, assets: true, findings: true } },
        },
      }),
      prisma.organisation.count({ where }),
    ]);

    res.json({
      organisations: orgs,
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
 * GET /api/v1/organisations/:orgId
 * Get organisation details (must be a member)
 */
router.get('/:orgId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId } = req.params;

    if (!isValidUUID(orgId)) {
      return res.status(400).json({ error: 'Invalid organisation ID' });
    }

    // Check membership (admins bypass)
    if (req.user!.role !== 'ADMIN') {
      const membership = await prisma.organisationMember.findUnique({
        where: { userId_orgId: { userId: req.user!.id, orgId } },
      });
      if (!membership) {
        return res.status(403).json({ error: 'Access denied', message: 'Not a member of this organisation' });
      }
    }

    const org = await prisma.organisation.findUnique({
      where: { id: orgId },
      include: {
        _count: { select: { members: true, assets: true, findings: true, reports: true } },
      },
    });

    if (!org) {
      return res.status(404).json({ error: 'Organisation not found' });
    }

    res.json({ organisation: org });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/organisations
 * Create a new organisation
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, slug, plan } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Name and slug are required',
      });
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Slug must contain only lowercase letters, numbers, and hyphens',
      });
    }

    // Check slug uniqueness
    const existingOrg = await prisma.organisation.findUnique({ where: { slug } });
    if (existingOrg) {
      return res.status(409).json({ error: 'Conflict', message: 'An organisation with this slug already exists' });
    }

    // Create org and add the creator as owner
    const org = await prisma.organisation.create({
      data: {
        name,
        slug,
        plan: plan || 'free',
        members: {
          create: {
            userId: req.user!.id,
            role: OrgMemberRole.OWNER,
          },
        },
      },
      include: {
        members: true,
      },
    });

    await logAudit(req, 'organisation.created', { orgId: org.id, name }, org.id);

    res.status(201).json({ organisation: org });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/v1/organisations/:orgId
 * Update organisation (owner/admin only)
 */
router.put('/:orgId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId } = req.params;
    const { name, plan } = req.body;

    if (!isValidUUID(orgId)) {
      return res.status(400).json({ error: 'Invalid organisation ID' });
    }

    // Check membership and role
    if (req.user!.role !== 'ADMIN') {
      const membership = await prisma.organisationMember.findUnique({
        where: { userId_orgId: { userId: req.user!.id, orgId } },
      });

      if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
        return res.status(403).json({ error: 'Access denied', message: 'Insufficient permissions' });
      }
    }

    const updateData: any = {};
    if (name) updateData.name = name;
    if (plan) updateData.plan = plan;

    const org = await prisma.organisation.update({
      where: { id: orgId },
      data: updateData,
    });

    await logAudit(req, 'organisation.updated', { fields: Object.keys(updateData) }, orgId);

    res.json({ organisation: org });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/v1/organisations/:orgId
 * Delete organisation (owner only)
 */
router.delete('/:orgId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId } = req.params;

    if (!isValidUUID(orgId)) {
      return res.status(400).json({ error: 'Invalid organisation ID' });
    }

    // Only owners and platform admins can delete
    if (req.user!.role !== 'ADMIN') {
      const membership = await prisma.organisationMember.findUnique({
        where: { userId_orgId: { userId: req.user!.id, orgId } },
      });

      if (!membership || membership.role !== 'OWNER') {
        return res.status(403).json({ error: 'Access denied', message: 'Only organisation owners can delete' });
      }
    }

    await prisma.organisation.delete({ where: { id: orgId } });

    await logAudit(req, 'organisation.deleted', { orgId });

    res.json({ message: 'Organisation deleted successfully' });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/organisations/:orgId/members
 * List organisation members
 */
router.get('/:orgId/members', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId } = req.params;

    if (!isValidUUID(orgId)) {
      return res.status(400).json({ error: 'Invalid organisation ID' });
    }

    // Verify membership
    if (req.user!.role !== 'ADMIN') {
      const membership = await prisma.organisationMember.findUnique({
        where: { userId_orgId: { userId: req.user!.id, orgId } },
      });
      if (!membership) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const members = await prisma.organisationMember.findMany({
      where: { orgId },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true, avatar: true },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });

    res.json({ members });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/organisations/:orgId/invite
 * Invite a user to the organisation
 */
router.post('/:orgId/invite', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId } = req.params;
    const { email, role } = req.body;

    if (!isValidUUID(orgId)) {
      return res.status(400).json({ error: 'Invalid organisation ID' });
    }

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ error: 'Valid email address is required' });
    }

    // Check inviter has permission (admin/owner of org)
    if (req.user!.role !== 'ADMIN') {
      const membership = await prisma.organisationMember.findUnique({
        where: { userId_orgId: { userId: req.user!.id, orgId } },
      });
      if (!membership || !['OWNER', 'ADMIN'].includes(membership.role)) {
        return res.status(403).json({ error: 'Access denied', message: 'Only admins and owners can invite members' });
      }
    }

    // Find the user to invite
    const invitee = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!invitee) {
      return res.status(404).json({
        error: 'User not found',
        message: 'No user found with this email. They must register first.',
      });
    }

    // Check if already a member
    const existingMembership = await prisma.organisationMember.findUnique({
      where: { userId_orgId: { userId: invitee.id, orgId } },
    });

    if (existingMembership) {
      return res.status(409).json({ error: 'User is already a member of this organisation' });
    }

    // Validate role
    const memberRole = (role && ['ADMIN', 'MEMBER', 'VIEWER'].includes(role)) ? role : 'MEMBER';

    const membership = await prisma.organisationMember.create({
      data: {
        userId: invitee.id,
        orgId,
        role: memberRole as OrgMemberRole,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    await logAudit(req, 'organisation.member_invited', {
      inviteeId: invitee.id,
      email: invitee.email,
      role: memberRole,
    }, orgId);

    res.status(201).json({
      message: 'User invited successfully',
      member: membership,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
