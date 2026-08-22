/**
 * The frontend (types.ts) expects plain camelCase JSON with ISO date strings.
 * Drizzle already returns camelCase keys (matching the schema definitions),
 * so these helpers mainly convert Date objects to ISO strings and strip
 * internal-only fields (like password hashes) before a row leaves the API.
 */

export function serializeUser(row: any) {
  if (!row) return row;
  const { password, ...rest } = row;
  return {
    ...rest,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

export function serializeDoctor(row: any) {
  if (!row) return row;
  return {
    ...row,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

export function serializeSlot(row: any) {
  if (!row) return row;
  return {
    ...row,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

export function serializeAppointment(row: any) {
  if (!row) return row;
  return {
    ...row,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  };
}

export function serializeChatMessage(row: any) {
  if (!row) return row;
  return {
    ...row,
    timestamp: toIso(row.timestamp),
  };
}

export function serializeNotification(row: any) {
  if (!row) return row;
  return {
    ...row,
    createdAt: toIso(row.createdAt),
  };
}

function toIso(value: any): string {
  if (!value) return new Date().toISOString();
  if (value instanceof Date) return value.toISOString();
  return String(value);
}
