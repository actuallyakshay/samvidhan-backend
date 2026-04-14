import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersRepository } from 'src/data/repositories/users.repository';
import { IJwtPayload } from 'src/types';
import { extractAccessToken } from '../extract-access-token';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersRepository: UsersRepository
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const token = extractAccessToken(request);
      if (!token) throw new UnauthorizedException('Missing access token');
      const adminEmails = this.configService.get('ADMIN_EMAILS').split(',');

      let payload: IJwtPayload;
      try {
        payload = await this.jwtService.verifyAsync(token, {
          secret: this.configService.getOrThrow('JWT_SECRET'),
        });
      } catch {
        throw new UnauthorizedException('Invalid or expired token');
      }

      if (!adminEmails.includes(payload.email)) {
        throw new UnauthorizedException('You are not authorized to access this resource');
      }

      const foundAdmin = await this.usersRepository.findOne({
        where: { email: payload.email, isAdmin: true },
      });

      if (!foundAdmin) {
        throw new UnauthorizedException('Admin not found');
      }

      request.user = { ...payload, isAdmin: true };
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
