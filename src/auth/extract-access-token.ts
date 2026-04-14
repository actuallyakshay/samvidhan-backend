import { Request } from 'express';
import { ACCESS_TOKEN_COOKIE } from './auth-cookies';

export function extractAccessToken(request: Request): string | undefined {
  const authHeader = request.headers.authorization;
  if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
    const t = authHeader.slice(7).trim();
    if (t) return t;
  }
  const fromCookie = request.cookies?.[ACCESS_TOKEN_COOKIE];
  if (typeof fromCookie === 'string' && fromCookie) {
    return fromCookie;
  }
  return undefined;
}
