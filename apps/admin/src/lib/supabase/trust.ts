/** Cookie die onthoudt dat een beheerder dit apparaat vertrouwt. */
export const TRUST_COOKIE = 'gs_vertrouwd';
export const TRUST_SECONDS = 30 * 24 * 60 * 60;

type CookieOptions = { maxAge?: number; expires?: Date; [key: string]: unknown };

/**
 * Inlogcookies: op een vertrouwd apparaat 30 dagen geldig, anders alleen tot de browser sluit.
 * Een cookie die wordt gewist (uitloggen) blijft gewist.
 */
export function sessionCookieOptions<T extends CookieOptions>(options: T | undefined, value: string, trusted: boolean): T {
  const base = (options ?? {}) as T;
  if (!value || base.maxAge === 0) return base;
  const { maxAge: _maxAge, expires: _expires, ...rest } = base;
  return (trusted ? { ...rest, maxAge: TRUST_SECONDS } : rest) as T;
}
