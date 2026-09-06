import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export type IssuePriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IssueStatus = 'Open' | 'In Progress' | 'Closed';

@Entity({ name: 'issue' })
export class Issue {
  @PrimaryGeneratedColumn('uuid', { name: 'issue_id' })
  issueId: string;

  @Column({ name: 'issue_desc', type: 'text' })
  issueDesc: string;

  // Only ever set server-side after a successful, validated S3 upload.
  // Never accepted as free-form client input — see IssueController.create().
  @Column({ name: 'issue_photo_link', type: 'varchar', nullable: true })
  issuePhotoLink: string | null;

  @Column({ name: 'issue_priority', type: 'varchar' })
  issuePriority: IssuePriority;

  @Column({ name: 'venue_id', type: 'uuid' })
  venueId: string;

  @Column({ name: 'assigned_user_id', type: 'uuid' })
  assignedUserId: string;

  @Column({ name: 'due_date', type: 'timestamptz' })
  dueDate: Date;

  @Column({ name: 'status', type: 'varchar', default: 'Open' })
  status: IssueStatus;

  @Column({ name: 'issue_comments', type: 'text', nullable: true })
  issueComments: string | null;

  @CreateDateColumn({ name: 'created_date', type: 'timestamptz' })
  createdDate: Date;

  @UpdateDateColumn({ name: 'updated_date', type: 'timestamptz' })
  updatedDate: Date;

  @Column({ name: 'created_user', type: 'uuid' })
  createdUser: string;

  @Column({ name: 'updated_user', type: 'uuid' })
  updatedUser: string;
}
