import { RoleCode } from 'src/enums';

export interface IJwtPayload {
  sub: string;
  email: string;
  roles: string[];
  iat?: number;
  exp?: number;
  activeRole?: RoleCode;
  isAdmin?: boolean;
}

/** `request.user` after `JwtAuthGuard` (header role is a string; DB uses `RoleCode`). */
export type AuthenticatedUser = Omit<IJwtPayload, 'activeRole'> & {
  activeRole?: RoleCode | string;
};

/** Socket handshake auth: same identity fields case-chat needs. */
export type CaseChatSocketUser = Pick<
  AuthenticatedUser,
  'sub' | 'email' | 'activeRole' | 'isAdmin'
>;

export enum LoginProvider {
  GOOGLE = 'google',
  EMAIL = 'email',
}

export enum AssetAuthor {
  USER = 'user',
  LAWYER = 'lawyer',
  ADMIN = 'admin',
}
