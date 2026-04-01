import { Request } from 'express';
import prisma from '../lib/prisma';

/**
 * Log an audit event for compliance and monitoring
 */
export const logAudit = async (
  req: Request,
  action: string,
  details?: Record<string, any>,
  orgId?: string
) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId: req.user?.id || null,
        orgId: orgId || null,
        action,
        details: details || {},
        ipAddress: (req.headers['x-forwarded-for'] as string) || req.ip || null,
        userAgent: req.headers['user-agent'] || null,
      },
    });
  } catch (err) {
    // Don't let audit logging failures break the request
    console.error('[Audit] Failed to log event:', action, err);
  }
};
