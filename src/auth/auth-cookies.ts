import { ConfigService } from '@nestjs/config';
import { serialize, type SerializeOptions } from 'cookie';
import { Response } from 'express';

export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

const ACCESS_PATH = '/api';
const REFRESH_PATH = '/api/auth/refresh';

const ACCESS_MAX_AGE_SEC = 60 * 60;

function resolveSameSite(raw: string | undefined): SerializeOptions['sameSite'] {
  switch ((raw || 'lax').toLowerCase()) {
    case 'none':
      return 'none';
    case 'strict':
      return 'strict';
    default:
      return 'lax';
  }
}

function sharedFlags(
  configService: ConfigService
): Pick<SerializeOptions, 'httpOnly' | 'secure' | 'sameSite'> {
  const secure =
    configService.get<string>('COOKIE_SECURE') !== 'false' &&
    configService.get<string>('NODE_ENV') === 'production';
  return {
    httpOnly: true,
    secure,
    sameSite: resolveSameSite(configService.get<string>('COOKIE_SAME_SITE')),
  };
}

function appendSetCookie(res: Response, name: string, value: string, options: SerializeOptions) {
  res.append('Set-Cookie', serialize(name, value, options));
}

export function setAuthCookies(
  res: Response,
  tokens: { accessToken: string; refreshToken: string },
  configService: ConfigService
) {
  const flags = sharedFlags(configService);
  const refreshDays = parseInt(configService.get('JWT_REFRESH_EXPIRY') || '7', 10) || 7;
  const refreshMaxAgeSec = refreshDays * 24 * 60 * 60;

  appendSetCookie(res, ACCESS_TOKEN_COOKIE, tokens.accessToken, {
    ...flags,
    path: ACCESS_PATH,
    maxAge: ACCESS_MAX_AGE_SEC,
  });

  appendSetCookie(res, REFRESH_TOKEN_COOKIE, tokens.refreshToken, {
    ...flags,
    path: REFRESH_PATH,
    maxAge: refreshMaxAgeSec,
  });
}

export function clearAuthCookies(res: Response, configService: ConfigService) {
  const flags = sharedFlags(configService);
  const clear = (name: string, path: string) =>
    appendSetCookie(res, name, '', { ...flags, path, maxAge: 0 });

  clear(ACCESS_TOKEN_COOKIE, ACCESS_PATH);
  clear(REFRESH_TOKEN_COOKIE, REFRESH_PATH);
}
