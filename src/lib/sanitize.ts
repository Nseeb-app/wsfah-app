// Strips sensitive fields from user objects before sending to client
export function sanitizeUser<T extends Record<string, unknown>>(user: T): Omit<T, "password"> {
  const { password: _, ...safe } = user;
  return safe as Omit<T, "password">;
}

// Strip owner email from company for non-owners
export function sanitizeCompany(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  company: any,
  requesterId?: string | null
) {
  if (!company) return company;
  const c = { ...company };
  if (c.owner && c.owner.id !== requesterId) {
    c.owner = { ...c.owner, email: undefined };
  }
  return c;
}
