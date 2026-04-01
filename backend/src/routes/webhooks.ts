import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { authenticate } from '../middleware/auth';
import prisma from '../lib/prisma';
import { isValidUUID, isValidUrl, parsePagination } from '../utils/validation';
import { logAudit } from '../utils/audit';
import { deliverWebhookPayload } from '../services/webhook';

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

// Supported webhook event types
const SUPPORTED_EVENTS = [
  'finding.created',
  'finding.status_changed',
  'asset.created',
  'asset.deleted',
  'scan.completed',
  'report.generated',
];

/**
 * GET /api/v1/webhooks
 * List webhooks for an organisation
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId } = req.query;

    if (!orgId || !isValidUUID(orgId as string)) {
      return res.status(400).json({ error: 'Valid orgId query parameter is required' });
    }

    const hasAccess = await verifyOrgAccess(req.user!.id, req.user!.role, orgId as string);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const webhooks = await prisma.webhook.findMany({
      where: { orgId: orgId as string },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { webhookEvents: true } },
      },
    });

    // Mask secrets in response
    const maskedWebhooks = webhooks.map((wh) => ({
      ...wh,
      secret: wh.secret.substring(0, 8) + '****',
    }));

    res.json({ webhooks: maskedWebhooks });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/webhooks
 * Create a new webhook
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orgId, url, events } = req.body;

    if (!orgId || !url) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'orgId and url are required',
      });
    }

    if (!isValidUUID(orgId)) {
      return res.status(400).json({ error: 'Invalid organisation ID' });
    }

    // Validate URL format
    if (!isValidUrl(url)) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'URL must start with http:// or https://',
      });
    }

    const hasAccess = await verifyOrgAccess(req.user!.id, req.user!.role, orgId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Validate event types
    const webhookEvents = Array.isArray(events)
      ? events.filter((e: string) => SUPPORTED_EVENTS.includes(e))
      : SUPPORTED_EVENTS;

    if (webhookEvents.length === 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: `At least one valid event type is required. Supported: ${SUPPORTED_EVENTS.join(', ')}`,
      });
    }

    // Generate signing secret
    const secret = `whsec_${crypto.randomBytes(24).toString('hex')}`;

    const webhook = await prisma.webhook.create({
      data: {
        orgId,
        url,
        secret,
        events: webhookEvents,
        active: true,
      },
    });

    await logAudit(req, 'webhook.created', {
      webhookId: webhook.id,
      url,
      events: webhookEvents,
    }, orgId);

    res.status(201).json({
      message: 'Webhook created successfully',
      webhook: {
        ...webhook,
        // Show secret only on creation
        secret: webhook.secret,
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * PUT /api/v1/webhooks/:id
 * Update a webhook
 */
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { url, events, active } = req.body;

    if (!isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid webhook ID' });
    }

    const webhook = await prisma.webhook.findUnique({ where: { id } });
    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }

    const hasAccess = await verifyOrgAccess(req.user!.id, req.user!.role, webhook.orgId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updateData: any = {};
    if (url !== undefined) {
      if (!isValidUrl(url)) {
        return res.status(400).json({ error: 'Invalid URL format' });
      }
      updateData.url = url;
    }
    if (events !== undefined) {
      updateData.events = Array.isArray(events)
        ? events.filter((e: string) => SUPPORTED_EVENTS.includes(e))
        : webhook.events;
    }
    if (active !== undefined) {
      updateData.active = Boolean(active);
    }

    const updatedWebhook = await prisma.webhook.update({
      where: { id },
      data: updateData,
    });

    await logAudit(req, 'webhook.updated', { webhookId: id }, webhook.orgId);

    res.json({
      webhook: {
        ...updatedWebhook,
        secret: updatedWebhook.secret.substring(0, 8) + '****',
      },
    });
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/v1/webhooks/:id
 * Delete a webhook
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid webhook ID' });
    }

    const webhook = await prisma.webhook.findUnique({ where: { id } });
    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }

    const hasAccess = await verifyOrgAccess(req.user!.id, req.user!.role, webhook.orgId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.webhook.delete({ where: { id } });

    await logAudit(req, 'webhook.deleted', { webhookId: id, url: webhook.url }, webhook.orgId);

    res.json({ message: 'Webhook deleted successfully' });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/webhooks/:id/test
 * Send a test webhook payload
 */
router.post('/:id/test', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid webhook ID' });
    }

    const webhook = await prisma.webhook.findUnique({ where: { id } });
    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }

    const hasAccess = await verifyOrgAccess(req.user!.id, req.user!.role, webhook.orgId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const testPayload = {
      event: 'webhook.test',
      timestamp: new Date().toISOString(),
      data: {
        message: 'This is a test webhook delivery from SignalStack',
        webhookId: webhook.id,
        organisationId: webhook.orgId,
      },
    };

    const result = await deliverWebhookPayload(webhook, testPayload);

    // Log event
    await prisma.webhookEvent.create({
      data: {
        webhookId: webhook.id,
        event: 'webhook.test',
        payload: testPayload,
        statusCode: result.statusCode,
        response: result.response,
        deliveredAt: result.success ? new Date() : null,
      },
    });

    res.json({
      message: result.success ? 'Test webhook delivered successfully' : 'Test webhook delivery failed',
      statusCode: result.statusCode,
      response: result.response,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/webhooks/:id/events
 * List webhook delivery events
 */
router.get('/:id/events', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { skip, take } = parsePagination(req.query);

    if (!isValidUUID(id)) {
      return res.status(400).json({ error: 'Invalid webhook ID' });
    }

    const webhook = await prisma.webhook.findUnique({ where: { id } });
    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }

    const hasAccess = await verifyOrgAccess(req.user!.id, req.user!.role, webhook.orgId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const [events, total] = await Promise.all([
      prisma.webhookEvent.findMany({
        where: { webhookId: id },
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.webhookEvent.count({ where: { webhookId: id } }),
    ]);

    res.json({
      events,
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

export default router;
