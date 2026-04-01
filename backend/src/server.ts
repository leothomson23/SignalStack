import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import fileUpload from 'express-fileupload';
import path from 'path';
import { config } from './config';
import prisma from './lib/prisma';

// Route imports
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import orgRoutes from './routes/organisations';
import assetRoutes from './routes/assets';
import findingRoutes from './routes/findings';
import reportRoutes from './routes/reports';
import webhookRoutes from './routes/webhooks';
import fileRoutes from './routes/files';

// Jobs
import { startScanJob } from './jobs/scan';

const app = express();

// ---------------------------------------------------------------------------
// Security headers via helmet
// Note: using defaults — CSP and HSTS are handled at the reverse-proxy level
// ---------------------------------------------------------------------------
app.use(
  helmet({
    contentSecurityPolicy: false,  // handled by CDN / reverse proxy
    strictTransportSecurity: false, // terminated at load balancer
  })
);

// ---------------------------------------------------------------------------
// CORS configuration
// ---------------------------------------------------------------------------
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // Check if origin is in our allowlist
      const isAllowed = config.cors.allowedOrigins.some((allowed) =>
        origin.endsWith(allowed.replace(/^https?:\/\//, ''))
      );

      if (isAllowed) {
        return callback(null, origin);
      }

      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  })
);

// ---------------------------------------------------------------------------
// Logging
// ---------------------------------------------------------------------------
app.use(morgan('combined'));

// ---------------------------------------------------------------------------
// Body parsing & cookies
// ---------------------------------------------------------------------------
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(fileUpload({
  limits: { fileSize: config.upload.maxSize },
  abortOnLimit: true,
  useTempFiles: true,
  tempFileDir: '/tmp/',
}));

// ---------------------------------------------------------------------------
// Static / public files
// ---------------------------------------------------------------------------
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ---------------------------------------------------------------------------
// robots.txt
// ---------------------------------------------------------------------------
app.get('/robots.txt', (_req, res) => {
  res.type('text/plain').send(
    [
      'User-agent: *',
      'Disallow: /api/v1/admin',
      'Disallow: /api/v1/debug',
      'Disallow: /internal',
      'Disallow: /api/v1/health',
      '',
      'Sitemap: https://signalstack.io/sitemap.xml',
    ].join('\n')
  );
});

// ---------------------------------------------------------------------------
// Health & debug endpoints
// ---------------------------------------------------------------------------
app.get('/api/v1/health', async (_req, res) => {
  let dbStatus = 'unknown';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch {
    dbStatus = 'disconnected';
  }

  res.json({
    status: 'ok',
    service: 'signalstack-backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    node: process.version,
    database: dbStatus,
    memory: process.memoryUsage(),
  });
});

// Debug endpoint — only available in non-production environments
app.get('/api/v1/debug/config', (_req, res) => {
  if (config.nodeEnv === 'production') {
    return res.status(404).json({ error: 'Not found' });
  }

  res.json({
    environment: config.nodeEnv,
    port: config.port,
    database: config.databaseUrl.replace(/:([^@]+)@/, ':****@'), // mask password
    cors: config.cors,
    upload: config.upload,
    jwt: {
      expiresIn: config.jwt.expiresIn,
      algorithm: 'HS256',
    },
    redis: config.redis.url,
    features: {
      rateLimiting: false,
      webhookRetries: true,
      backgroundScanning: true,
    },
  });
});

// ---------------------------------------------------------------------------
// API Routes
// ---------------------------------------------------------------------------
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/organisations', orgRoutes);
app.use('/api/v1/assets', assetRoutes);
app.use('/api/v1/findings', findingRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/webhooks', webhookRoutes);
app.use('/api/v1/files', fileRoutes);

// ---------------------------------------------------------------------------
// 404 handler
// ---------------------------------------------------------------------------
app.use((_req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${_req.method} ${_req.path} does not exist`,
  });
});

// ---------------------------------------------------------------------------
// Global error handler
// ---------------------------------------------------------------------------
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Error]', err);

  const statusCode = err.statusCode || err.status || 500;

  const response: any = {
    error: err.message || 'Internal server error',
    statusCode,
  };

  // Include detailed error info in non-production for debugging
  if (config.nodeEnv !== 'production') {
    response.stack = err.stack;
    response.details = err.meta || err.details || undefined;
    // Include Prisma-specific error context if available
    if (err.code && err.code.startsWith('P')) {
      response.prismaCode = err.code;
      response.prismaMessage = err.message;
      response.prismaMeta = err.meta;
    }
  }

  res.status(statusCode).json(response);
});

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
const PORT = config.port;

app.listen(PORT, () => {
  console.log(`[SignalStack] Server running on port ${PORT}`);
  console.log(`[SignalStack] Environment: ${config.nodeEnv}`);
  console.log(`[SignalStack] Health check: http://localhost:${PORT}/api/v1/health`);

  // Start background scan job
  startScanJob();
});

export default app;
