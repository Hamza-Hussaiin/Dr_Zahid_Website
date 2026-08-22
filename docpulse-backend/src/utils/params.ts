import { Request } from 'express';

/**
 * Express 5 types req.params values as `string | string[]`. Every route in
 * this API uses simple single-value params (e.g. /api/doctors/:id), so this
 * helper safely narrows to a plain string and throws early if that
 * assumption is ever violated.
 */
export function paramStr(req: Request, name: string): string {
  const value = req.params[name];
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }
  return value ?? '';
}
