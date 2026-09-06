import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtUser } from '../interfaces/jwt-user.interface';

// ASSUMPTION: matches the app's existing @CurrentUser() decorator.
// If the real one already exists, delete this file and import theirs.
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as JwtUser;
  },
);
