import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';
import { CustomRequest } from '../types/custom-request.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<Role[]>(
      ROLES_KEY,
      context.getHandler(),
    );
    if (!requiredRoles) {
      return true; // If no roles are required, allow access
    }

    const { user } = context.switchToHttp().getRequest<CustomRequest>();

    if (!user || !user.roles) {
      throw new ForbiddenException('User roles not found');
    }

    const hasRole = () =>
      user.roles.some((role) => requiredRoles.includes(role));

    if (!hasRole()) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
