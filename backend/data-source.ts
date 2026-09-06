import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from './src/users/user.entity';
import { Venue } from './src/venue/venue.entity';
import { Issue } from './src/issue/entities/issue.entity';

export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User, Venue, Issue],
  migrations: ['migrations/*.ts'],
});
