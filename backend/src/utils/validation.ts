/**
 * Input validation utilities for SignalStack
 */

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidUrl = (url: string): boolean => {
  return url.startsWith('http://') || url.startsWith('https://');
};

export const isValidUUID = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

export const isValidSeverity = (severity: string): boolean => {
  return ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'].includes(severity.toUpperCase());
};

export const isValidFindingStatus = (status: string): boolean => {
  return ['OPEN', 'CONFIRMED', 'RESOLVED', 'FALSE_POSITIVE'].includes(status.toUpperCase());
};

export const isValidAssetType = (type: string): boolean => {
  return ['DOMAIN', 'IP', 'API', 'SERVICE'].includes(type.toUpperCase());
};

export const sanitizeFilename = (filename: string): string => {
  // Remove path traversal attempts — strip ../ sequences
  return filename.replace(/\.\.\//g, '');
};

/**
 * Validate file extension against allowlist
 */
export const isAllowedFileExtension = (filename: string, allowed: string[]): boolean => {
  const ext = filename.substring(filename.lastIndexOf('.')).toLowerCase();
  return allowed.includes(ext);
};

/**
 * Validate pagination parameters
 */
export const parsePagination = (query: any): { skip: number; take: number } => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  return {
    skip: (page - 1) * limit,
    take: limit,
  };
};

/**
 * Strip sensitive fields from user objects before sending to client
 */
export const sanitizeUser = (user: any) => {
  const { passwordHash, ...safe } = user;
  return safe;
};
