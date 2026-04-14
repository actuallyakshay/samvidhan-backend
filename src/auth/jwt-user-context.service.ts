import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRolesRepository, UsersRepository } from 'src/data/repositories';
import { AccountStatus, RoleCode, UserRoleStatus } from 'src/enums';
import { AuthenticatedUser, IJwtPayload } from 'src/types';

/**
 * Shared admin allowlist + active-role row checks after JWT verification.
 * Used by HTTP (`JwtAuthGuard`) and Socket.IO (`CaseChatAuthService`).
 */
@Injectable()
export class JwtUserContextService {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersRepository: UsersRepository,
    private readonly userRolesRepository: UserRolesRepository
  ) {}

  async attachRolesToPayload(
    payload: IJwtPayload,
    activeRole: string | undefined
  ): Promise<AuthenticatedUser> {
    const adminEmails = (this.configService.get<string>('ADMIN_EMAILS') ?? '')
      .split(',')
      .map((e) => e.trim())
      .filter(Boolean);

    if (adminEmails.includes(payload.email) && payload?.isAdmin) {
      const foundAdmin = await this.usersRepository.findOne({
        where: {
          id: payload.sub,
          email: payload.email,
          isAdmin: true,
          accountStatus: AccountStatus.ACTIVE,
        },
      });
      if (!foundAdmin) {
        throw new UnauthorizedException('You are not authorized to access this resource');
      }
      return { ...payload, activeRole: RoleCode.ADMIN, isAdmin: true };
    }

    if (activeRole) {
      const userRole = await this.userRolesRepository.findOne({
        where: { userId: payload.sub, roleCode: activeRole as RoleCode },
      });
      if (!userRole || userRole.status !== UserRoleStatus.ACTIVE) {
        throw new UnauthorizedException(`Your "${activeRole}" role is currently inactive`);
      }
    }

    return { ...payload, activeRole, isAdmin: payload.isAdmin };
  }
}
