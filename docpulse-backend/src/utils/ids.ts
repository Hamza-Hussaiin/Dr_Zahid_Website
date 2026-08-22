import crypto from 'crypto';

/**
 * Generates a compact, URL-safe unique id.
 * Prefix helps with debugging (e.g. "usr_", "apt_", "slt_").
 */
export function generateId(prefix: string = ''): string {
  const random = crypto.randomBytes(12).toString('hex');
  return prefix ? `${prefix}_${random}` : random;
}
