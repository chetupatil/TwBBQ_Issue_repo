import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import { User } from '../src/users/user.entity';
import { Venue } from '../src/venue/venue.entity';
import { Issue } from '../src/issue/entities/issue.entity';

async function main() {
  const ds = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [User, Venue, Issue],
  });
  await ds.initialize();

  const venueRepo = ds.getRepository(Venue);
  const userRepo = ds.getRepository(User);

  const venueA = await venueRepo.save(venueRepo.create({ name: 'Venue A - Bondi' }));
  const venueB = await venueRepo.save(venueRepo.create({ name: 'Venue B - Manly' }));

  const venueAUser = await userRepo.save(
    userRepo.create({
      email: 'venue-a-user@twbbq.local',
      name: 'Venue A Staff',
      role: 'VENUE',
      venueId: venueA.venueId,
    }),
  );
  const venueBUser = await userRepo.save(
    userRepo.create({
      email: 'venue-b-user@twbbq.local',
      name: 'Venue B Staff',
      role: 'VENUE',
      venueId: venueB.venueId,
    }),
  );
  const adminUser = await userRepo.save(
    userRepo.create({
      email: 'admin@twbbq.local',
      name: 'Head Office Admin',
      role: 'HEAD_OFFICE_ADMIN',
      venueId: null,
    }),
  );

  const secret = process.env.JWT_SECRET as string;
  const sign = (payload: object) => jwt.sign(payload, secret, { expiresIn: '7d' });

  const venueAToken = sign({ userId: venueAUser.userId, role: 'VENUE', venueId: venueA.venueId });
  const venueBToken = sign({ userId: venueBUser.userId, role: 'VENUE', venueId: venueB.venueId });
  const adminToken = sign({ userId: adminUser.userId, role: 'HEAD_OFFICE_ADMIN', venueId: null });

  console.log('\n=== Seeded data ===');
  console.log('Venue A:', venueA.venueId);
  console.log('Venue B:', venueB.venueId);
  console.log('Venue A user:', venueAUser.userId, venueAUser.email);
  console.log('Venue B user:', venueBUser.userId, venueBUser.email);
  console.log('Admin user:', adminUser.userId, adminUser.email);

  console.log('\n=== JWTs for testing (paste into Authorization: Bearer <token>) ===');
  console.log('VENUE_A_TOKEN=' + venueAToken);
  console.log('VENUE_B_TOKEN=' + venueBToken);
  console.log('ADMIN_TOKEN=' + adminToken);

  await ds.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
