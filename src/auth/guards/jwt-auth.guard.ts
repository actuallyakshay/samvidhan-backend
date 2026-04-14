import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { IJwtPayload } from 'src/types';
import { JwtUserContextService } from '../jwt-user-context.service';
import { extractAccessToken } from '../extract-access-token';

const ACTIVE_ROLE_HEADER = 'x-active-role';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly jwtUserContext: JwtUserContextService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const token = extractAccessToken(request);

      if (!token) throw new UnauthorizedException('Missing access token');

      let payload: IJwtPayload;
      try {
        payload = await this.jwtService.verifyAsync(token, {
          secret: this.configService.getOrThrow('JWT_SECRET'),
        });
      } catch (error) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      const activeRole = request.headers[ACTIVE_ROLE_HEADER] as string | undefined;
      request.user = await this.jwtUserContext.attachRolesToPayload(payload, activeRole);
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
