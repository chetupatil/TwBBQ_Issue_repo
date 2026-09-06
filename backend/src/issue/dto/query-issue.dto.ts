import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { IssueStatus } from '../entities/issue.entity';

export class QueryIssueDto {
  // Only honoured for HEAD_OFFICE_ADMIN. For a VENUE caller this is ignored
  // outright — see IssueService.findAll(), which always scopes by
  // req.venueScope for that role regardless of what's in the query string.
  @IsOptional()
  @IsUUID()
  venueId?: string;

  @IsOptional()
  @IsIn(['Open', 'In Progress', 'Closed'])
  status?: IssueStatus;
}
