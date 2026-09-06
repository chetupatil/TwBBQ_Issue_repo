import {
  IsDateString,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { IssuePriority } from '../entities/issue.entity';

// NOTE: no `issuePhotoLink` field here on purpose — the photo is a multipart
// file on this same request, validated and uploaded to S3 inside the
// controller, and the resulting URL is attached server-side before the DTO
// reaches the service. The client cannot set issue_photo_link directly.
//
// NOTE: no `venueId` field for a VENUE-role caller either. If present in the
// raw request body it is ignored — IssueController pulls the authoritative
// value from req.venueScope (set by VenueScopeGuard from the JWT), never
// from this DTO, for VENUE users. HEAD_OFFICE_ADMIN must supply venueId
// explicitly since they aren't scoped to one.
export class CreateIssueDto {
  @IsString()
  @IsNotEmpty()
  issueDesc: string;

  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  issuePriority: IssuePriority;

  @IsUUID()
  assignedUserId: string;

  @IsDateString()
  dueDate: string;

  @IsOptional()
  @IsString()
  issueComments?: string;

  // Only read for HEAD_OFFICE_ADMIN; ignored for VENUE (see controller).
  @IsOptional()
  @IsUUID()
  venueId?: string;
}
