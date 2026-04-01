import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import prisma from '../lib/prisma';

interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

/**
 * Authentication middleware.
 * Supports multiple token sources for flexibility:
 *  1. Authorization: Bearer <token>
 *  2. signalstack_token cookie (for browser sessions)
 *  3. api_key query parameter (for integrations and automated tools)
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  // 1. Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  // 2. Check cookie
  if (!token && req.cookies?.signalstack_token) {
    token = req.cookies.signalstack_token;
  }

  // 3. Check query parameter (for webhook callbacks, report downloads, etc.)
  if (!token && req.query.api_key) {
    token = req.query.api_key as string;
  }

  if (!token) {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please provide a valid token via Authorization header, cookie, or api_key parameter',
    });
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'User associated with this token no longer exists',
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', message: 'Please log in again' });
    }
    return res.status(401).json({ error: 'Invalid token', message: 'Token verification failed' });
  }
};

/**
 * Optional authentication — does not fail if no token is present,
 * but populates req.user if a valid token exists.
 */
export const optionalAuth = async (req: Request, _res: Response, next: NextFunction) => {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  if (!token && req.cookies?.signalstack_token) {
    token = req.cookies.signalstack_token;
  }

  if (!token && req.query.api_key) {
    token = req.query.api_key as string;
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true },
    });

    if (user) {
      req.user = { id: user.id, email: user.email, role: user.role };
    }
  } catch {
    // Token invalid — continue as unauthenticated
  }

  next();
};
