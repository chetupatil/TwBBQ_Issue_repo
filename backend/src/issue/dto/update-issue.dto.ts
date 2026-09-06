import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { IssuePriority, IssueStatus } from '../entities/issue.entity';

export class UpdateIssueDto {
  @IsOptional()
  @IsString()
  issueDesc?: string;

  @IsOptional()
  @IsIn(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  issuePriority?: IssuePriority;

  @IsOptional()
  @IsUUID()
  assignedUserId?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsIn(['Open', 'In Progress', 'Closed'])
  status?: IssueStatus;

  @IsOptional()
  @IsString()
  issueComments?: string;
}
