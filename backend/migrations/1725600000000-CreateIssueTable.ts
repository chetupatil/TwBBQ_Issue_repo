import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateIssueTable1725600000000 implements MigrationInterface {
  name = 'CreateIssueTable1725600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'issue',
        columns: [
          {
            name: 'issue_id',
            type: 'uuid',
            isPrimary: true,
            default: 'uuid_generate_v4()',
          },
          { name: 'issue_desc', type: 'text', isNullable: false },
          {
            name: 'issue_photo_link',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'issue_priority',
            type: 'varchar',
            isNullable: false,
          },
          { name: 'venue_id', type: 'uuid', isNullable: false },
          { name: 'assigned_user_id', type: 'uuid', isNullable: false },
          { name: 'due_date', type: 'timestamptz', isNullable: false },
          {
            name: 'status',
            type: 'varchar',
            isNullable: false,
            default: `'Open'`,
          },
          { name: 'issue_comments', type: 'text', isNullable: true },
          {
            name: 'created_date',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'updated_date',
            type: 'timestamptz',
            default: 'now()',
          },
          { name: 'created_user', type: 'uuid', isNullable: false },
          { name: 'updated_user', type: 'uuid', isNullable: false },
        ],
      }),
      true,
    );

    // Index for the guard's per-record venue-ownership lookup and for the
    // scoped list query — both filter/join on venue_id constantly.
    await queryRunner.query(
      `CREATE INDEX "idx_issue_venue_id" ON "issue" ("venue_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_issue_assigned_user_id" ON "issue" ("assigned_user_id")`,
    );
    // Supports the daily overdue-issue cron sweep (due_date < now, status != 'Closed').
    await queryRunner.query(
      `CREATE INDEX "idx_issue_due_date_status" ON "issue" ("due_date", "status")`,
    );

    await queryRunner.createForeignKey(
      'issue',
      new TableForeignKey({
        name: 'fk_issue_venue_id',
        columnNames: ['venue_id'],
        referencedTableName: 'venue', // ASSUMPTION: existing venue table/PK name
        referencedColumnNames: ['venue_id'],
        onDelete: 'RESTRICT',
      }),
    );

    await queryRunner.createForeignKey(
      'issue',
      new TableForeignKey({
        name: 'fk_issue_assigned_user_id',
        columnNames: ['assigned_user_id'],
        referencedTableName: 'user', // ASSUMPTION: existing user table/PK name
        referencedColumnNames: ['user_id'],
        onDelete: 'RESTRICT',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropForeignKey('issue', 'fk_issue_assigned_user_id');
    await queryRunner.dropForeignKey('issue', 'fk_issue_venue_id');
    await queryRunner.dropTable('issue');
  }
}
