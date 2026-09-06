import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'venue' })
export class Venue {
  @PrimaryGeneratedColumn('uuid', { name: 'venue_id' })
  venueId: string;

  @Column({ name: 'name' })
  name: string;
}
