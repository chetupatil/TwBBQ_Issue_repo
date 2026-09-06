import { MigrationInterface, QueryRunner, Table } from 'typeorm';

// STAND-IN ONLY. In the real app, `venue` and `user` already exist —
// this migration exists purely so the Issues feature is runnable/testable
// standalone. Do not run this against the real database; the real
// `CreateIssueTable` migration's FKs point at whatever the real tables are.
export class CreateStubVenueAndUserTables1725500000000
  implements MigrationInterface
{
  name = 'CreateStubVenueAndUserTables1725500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.createTable(
      new Table({
        name: 'venue',
        columns: [
          { name: 'venue_id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'name', type: 'varchar' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'user',
        columns: [
          { name: 'user_id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'email', type: 'varchar' },
          { name: 'name', type: 'varchar' },
          { name: 'role', type: 'varchar' },
          { name: 'venue_id', type: 'uuid', isNullable: true },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('user');
    await queryRunner.dropTable('venue');
  }
}
