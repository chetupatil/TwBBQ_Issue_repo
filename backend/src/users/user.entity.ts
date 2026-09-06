import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

// Minimal stand-in for the real app's user table — only what IssueService
// and the mailer need (email lookup by id).
@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn('uuid', { name: 'user_id' })
  userId: string;

  @Column({ name: 'email' })
  email: string;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'role' })
  role: 'VENUE' | 'HEAD_OFFICE_ADMIN';

  @Column({ name: 'venue_id', type: 'uuid', nullable: true })
  venueId: string | null;
}
