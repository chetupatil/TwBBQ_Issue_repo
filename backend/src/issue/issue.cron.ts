import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { IssueService } from './issue.service';
import { MailService } from '../common/mail/mail.service';
import { UsersService } from '../users/users.service'; // ASSUMPTION: existing module

@Injectable()
export class IssueCronService {
  private readonly logger = new Logger(IssueCronService.name);

  constructor(
    private readonly issueService: IssueService,
    private readonly mailService: MailService,
    private readonly usersService: UsersService,
  ) {}

  // Runs once daily. Every overdue, non-Closed issue gets an email every
  // run — i.e. it repeats daily until someone closes it. No "last reminded"
  // column exists in the schema, so this intentionally re-sends every day
  // rather than trying to dedupe.
  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async sendOverdueReminders(): Promise<void> {
    const overdue = await this.issueService.findOverdueOpenIssues();
    this.logger.log(`Found ${overdue.length} overdue issue(s) to remind`);

    for (const issue of overdue) {
      try {
        const assigneeEmail = await this.usersService.findEmailById(
          issue.assignedUserId,
        );
        await this.mailService.sendOverdueReminderEmail(issue, assigneeEmail);
      } catch (err) {
        // One bad record must not stop the rest of the sweep.
        this.logger.error(
          `Failed to send overdue reminder for issue ${issue.issueId}`,
          err as Error,
        );
      }
    }
  }
}
