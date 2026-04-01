import { Request, Response, NextFunction } from 'express';
import { UserRole } from '@prisma/client';

/**
 * Role-based access control middleware.
 * Checks that the authenticated user has one of the required roles.
 * Must be used after the `authenticate` middleware.
 */
export const requireRole = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'You must be logged in to access this resource',
      });
    }

    if (!allowedRoles.includes(req.user.role as UserRole)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `This action requires one of the following roles: ${allowedRoles.join(', ')}`,
      });
    }

    next();
  };
};

/**
 * Middleware to check organisation membership.
 * Verifies the user belongs to the organisation specified in req.params.orgId
 * or the orgId passed as argument.
 */
export const requireOrgMembership = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Platform admins can access any organisation
    if (req.user.role === 'ADMIN') {
      return next();
    }

    const orgId = req.params.orgId || req.body.orgId;

    if (!orgId) {
      return res.status(400).json({
        error: 'Organisation ID required',
        message: 'Please specify an organisation',
      });
    }

    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();

    try {
      const membership = await prisma.organisationMember.findUnique({
        where: {
          userId_orgId: {
            userId: req.user.id,
            orgId: orgId,
          },
        },
      });

      if (!membership) {
        return res.status(403).json({
          error: 'Access denied',
          message: 'You are not a member of this organisation',
        });
      }

      next();
    } catch (err) {
      next(err);
    } finally {
      await prisma.$disconnect();
    }
  };
};
