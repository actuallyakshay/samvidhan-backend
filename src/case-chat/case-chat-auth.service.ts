import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { parse } from 'cookie';
import { Socket } from 'socket.io';
import { ACCESS_TOKEN_COOKIE } from 'src/auth/auth-cookies';
import { JwtUserContextService } from 'src/auth/jwt-user-context.service';
import { IJwtPayload, CaseChatSocketUser } from 'src/types';

@Injectable()
export class CaseChatAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly jwtUserContext: JwtUserContextService
  ) {}

  async verifySocket(client: Socket): Promise<CaseChatSocketUser> {
    const token = this.extractToken(client);
    if (!token) throw new UnauthorizedException('Missing access token');

    let payload: IJwtPayload;
    try {
      payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.getOrThrow('JWT_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const raw = client.handshake.auth?.activeRole;
    const activeRole =
      typeof raw === 'string' && raw.trim() ? raw.trim() : undefined;

    const ctx = await this.jwtUserContext.attachRolesToPayload(payload, activeRole);
    return {
      sub: ctx.sub,
      email: ctx.email,
      activeRole: ctx.activeRole,
      isAdmin: ctx.isAdmin,
    };
  }

  private extractToken(client: Socket): string | undefined {
    const fromAuth = client.handshake.auth?.token;
    if (typeof fromAuth === 'string' && fromAuth.trim()) return fromAuth.trim();

    const raw = client.handshake.headers.cookie;
    if (!raw || typeof raw !== 'string') return undefined;
    const cookies = parse(raw);
    const v = cookies[ACCESS_TOKEN_COOKIE];
    return typeof v === 'string' && v ? v : undefined;
  }
}
