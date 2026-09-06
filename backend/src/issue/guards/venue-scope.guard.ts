import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Issue } from '../entities/issue.entity';
import { JwtUser } from '../../common/interfaces/jwt-user.interface';

/**
 * The single authorization boundary for venue scoping. Runs after
 * JwtAuthGuard (so req.user is already populated and trustworthy) and
 * before the controller method body / ValidationPipe-validated DTO is
 * touched by the service.
 *
 * - HEAD_OFFICE_ADMIN: passes through untouched. Cross-venue access is the
 *   whole point of that role.
 * - VENUE:
 *     1. Always sets `req.venueScope = user.venueId`, overwriting anything
 *        a client sent in the body or query string. The service/controller
 *        must read req.venueScope, never `req.body.venueId` or
 *        `req.query.venueId`, when the caller is VENUE.
 *     2. If the route has an `:id` param (get-by-id, update, delete,
 *        comment), does a lightweight DB lookup of that issue's venue_id
 *        BEFORE the handler runs, and throws NotFoundException (not
 *        Forbidden) if it belongs to a different venue — so a VENUE user
 *        can't distinguish "not yours" from "doesn't exist" and enumerate
 *        other venues' issue IDs.
 *
 * This means every route that touches a single issue by id MUST apply this
 * guard, not just the list route — that's the actual requirement here.
 */
@Injectable()
export class VenueScopeGuard implements CanActivate {
  constructor(
    @InjectRepository(Issue)
    private readonly issueRepo: Repository<Issue>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtUser | undefined;

    if (!user) {
      // JwtAuthGuard should already have rejected this; fail closed anyway.
      throw new ForbiddenException('Not authenticated');
    }

    if (user.role === 'HEAD_OFFICE_ADMIN') {
      return true;
    }

    if (user.role !== 'VENUE' || !user.venueId) {
      throw new ForbiddenException('No venue associated with this account');
    }

    // Server-side scope, always derived from the JWT — never from the
    // client-supplied body/query, and it overwrites anything already there.
    request.venueScope = user.venueId;

    const issueId: string | undefined = request.params?.id;
    if (issueId) {
      const issue = await this.issueRepo.findOne({
        where: { issueId },
        select: ['issueId', 'venueId'],
      });

      // Same response whether the issue doesn't exist or belongs to another
      // venue — do not leak existence of other venues' records.
      if (!issue || issue.venueId !== user.venueId) {
        throw new NotFoundException('Issue not found');
      }
    }

    return true;
  }
}
