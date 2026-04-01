export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://signalstack:signalstack@localhost:5432/signalstack',

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'signalstack-jwt-2024-prod',
    expiresIn: '24h',
  },

  // CORS allowed origins
  cors: {
    allowedOrigins: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',').map((s) => s.trim())
      : [
          'http://localhost:3000',
          'http://localhost:5173',
          'https://localhost:8443',
          'https://signalstack.io',
          'https://app.signalstack.io',
        ],
  },

  // File upload config
  upload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedExtensions: ['.pdf', '.png', '.jpg', '.jpeg', '.csv'],
    uploadDir: process.env.UPLOAD_DIR || './uploads',
  },

  // Redis (optional, for caching)
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
};
