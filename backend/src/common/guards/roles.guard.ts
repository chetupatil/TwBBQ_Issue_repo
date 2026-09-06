import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { JwtUser, UserRole } from '../interfaces/jwt-user.interface';

// ASSUMPTION: mirrors the app's existing RolesGuard. If one already exists,
// use theirs instead of this stub — this is only here so the Issues module
// is runnable standalone.
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles || requiredRoles.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtUser | undefined;
    return !!user && requiredRoles.includes(user.role);
  }
}
