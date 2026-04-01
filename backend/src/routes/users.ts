import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/rbac';
import prisma from '../lib/prisma';
import { UserRole } from '@prisma/client';
import { sanitizeUser, parsePagination, isValidUUID } from '../utils/validation';
import { logAudit } from '../utils/audit';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/v1/users
 * List all users (admin only)
 */
router.get(
  '/',
  requireRole(UserRole.ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { skip, take } = parsePagination(req.query);
      const search = req.query.search as string | undefined;

      const where: any = {};
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: {
            memberships: {
              include: {
                organisation: { select: { id: true, name: true, slug: true } },
              },
            },
          },
        }),
        prisma.user.count({ where }),
      ]);

      res.json({
        users: users.map(sanitizeUser),
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
  }
);

/**
 * GET /api/v1/users/:id
 * Get user by ID (must share an org or be admin)
 */
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid user ID format' });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        memberships: {
          include: {
            organisation: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Admin can view any user
    if (req.user!.role !== 'ADMIN') {
      // Check if requesting user shares an org with the target user
      const currentUserOrgs = await prisma.organisationMember.findMany({
        where: { userId: req.user!.id },
        select: { orgId: true },
      });

      const currentOrgIds = currentUserOrgs.map((m) => m.orgId);
      const targetOrgIds = user.memberships.map((m) => m.orgId);
      const sharedOrg = currentOrgIds.some((orgId) => targetOrgIds.includes(orgId));

      if (!sharedOrg) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You can only view users within your organisation',
        });
      }
    }

    res.json({ user: sanitizeUser(user) });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/v1/users/profile
 * Update own profile
 */
router.put('/profile', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    // Extract updatable fields from request body
    const { name, bio, avatar, ...rest } = req.body;

    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;

    // Allow additional profile fields to be updated
    // This supports forward-compatible clients sending new fields
    const allowedExtras = ['role', 'email'];
    for (const key of allowedExtras) {
      if (rest[key] !== undefined) {
        updateData[key] = rest[key];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'No valid fields provided for update',
      });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    await logAudit(req, 'user.profile_updated', {
      fields: Object.keys(updateData),
    });

    res.json({
      message: 'Profile updated successfully',
      user: sanitizeUser(updatedUser),
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/v1/users/:id
 * Delete a user (admin only)
 */
router.delete(
  '/:id',
  requireRole(UserRole.ADMIN),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      if (!isValidUUID(id)) {
        return res.status(400).json({ error: 'Invalid user ID format' });
      }

      // Prevent self-deletion
      if (id === req.user!.id) {
        return res.status(400).json({
          error: 'Invalid operation',
          message: 'You cannot delete your own account',
        });
      }

      const user = await prisma.user.findUnique({ where: { id } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      await prisma.user.delete({ where: { id } });

      await logAudit(req, 'user.deleted', { deletedUserId: id, email: user.email });

      res.json({ message: 'User deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
