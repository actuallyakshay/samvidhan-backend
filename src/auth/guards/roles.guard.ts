import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleCode } from 'src/enums';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { IJwtPayload } from 'src/types';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    try {
      const requiredRoles = this.reflector.getAllAndOverride<RoleCode[]>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);

      if (!requiredRoles?.length) return true;

      const { user } = context.switchToHttp().getRequest();
      const payload = user as IJwtPayload;

      if (!payload?.roles?.length) throw new ForbiddenException('No roles assigned');

      const hasRole = requiredRoles.some((role) => payload.roles.includes(role));
      if (!hasRole) throw new ForbiddenException('Insufficient permissions');

      return true;
    } catch (error) {
      throw new ForbiddenException('Insufficient permissions');
    }
  }
}
