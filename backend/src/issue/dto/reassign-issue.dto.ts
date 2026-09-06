import { IsUUID } from 'class-validator';

// HEAD_OFFICE_ADMIN only — see @Roles('HEAD_OFFICE_ADMIN') on the controller
// route. Reassignment can move an issue to a different venue/user; a VENUE
// caller must never reach this handler (RolesGuard blocks it before
// VenueScopeGuard or the service run).
export class ReassignIssueDto {
  @IsUUID()
  assignedUserId: string;

  @IsUUID()
  venueId: string;
}
