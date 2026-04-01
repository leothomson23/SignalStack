import crypto from 'crypto';
import https from 'https';
import http from 'http';
import { URL } from 'url';
import prisma from '../lib/prisma';

interface WebhookPayload {
  event: string;
  timestamp: string;
  data: any;
}

interface DeliveryResult {
  success: boolean;
  statusCode: number | null;
  response: string;
}

/**
 * Sign a webhook payload using HMAC-SHA256
 */
function signPayload(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

/**
 * Deliver a payload to a specific webhook endpoint
 */
export async function deliverWebhookPayload(
  webhook: { id: string; url: string; secret: string },
  payload: WebhookPayload
): Promise<DeliveryResult> {
  const body = JSON.stringify(payload);
  const signature = signPayload(body, webhook.secret);

  const parsedUrl = new URL(webhook.url);
  const transport = parsedUrl.protocol === 'https:' ? https : http;

  return new Promise((resolve) => {
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'User-Agent': 'SignalStack-Webhook/1.0',
        'X-SignalStack-Signature': `sha256=${signature}`,
        'X-SignalStack-Event': payload.event,
        'X-SignalStack-Delivery': webhook.id,
      },
      timeout: 10000, // 10 second timeout
    };

    const req = transport.request(options, (res) => {
      let responseBody = '';
      res.on('data', (chunk) => {
        responseBody += chunk;
      });
      res.on('end', () => {
        resolve({
          success: res.statusCode !== undefined && res.statusCode >= 200 && res.statusCode < 300,
          statusCode: res.statusCode || null,
          response: responseBody.substring(0, 500), // Truncate long responses
        });
      });
    });

    req.on('error', (err) => {
      resolve({
        success: false,
        statusCode: null,
        response: `Connection error: ${err.message}`,
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        statusCode: null,
        response: 'Request timed out after 10 seconds',
      });
    });

    req.write(body);
    req.end();
  });
}

/**
 * Deliver a webhook event to all matching webhooks for an organisation
 */
export async function deliverWebhookEvent(
  orgId: string,
  event: string,
  data: any
): Promise<void> {
  const webhooks = await prisma.webhook.findMany({
    where: {
      orgId,
      active: true,
      events: { has: event },
    },
  });

  if (webhooks.length === 0) {
    return;
  }

  const payload: WebhookPayload = {
    event,
    timestamp: new Date().toISOString(),
    data,
  };

  for (const webhook of webhooks) {
    try {
      console.log(`[Webhook] Delivering ${event} to ${webhook.url}`);

      const result = await deliverWebhookPayload(webhook, payload);

      // Log the delivery attempt
      await prisma.webhookEvent.create({
        data: {
          webhookId: webhook.id,
          event,
          payload: payload as any,
          statusCode: result.statusCode,
          response: result.response,
          deliveredAt: result.success ? new Date() : null,
        },
      });

      if (!result.success) {
        console.error(
          `[Webhook] Delivery failed for ${webhook.url}: ${result.statusCode} - ${result.response}`
        );
      }
    } catch (err) {
      console.error(`[Webhook] Error delivering to ${webhook.url}:`, err);

      // Log failed attempt
      await prisma.webhookEvent.create({
        data: {
          webhookId: webhook.id,
          event,
          payload: payload as any,
          statusCode: null,
          response: `Internal error: ${(err as Error).message}`,
          deliveredAt: null,
        },
      });
    }
  }
}
