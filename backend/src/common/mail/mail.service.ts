import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { Issue } from '../../issue/entities/issue.entity';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly headOfficeContact: string;

  constructor(
    private readonly mailer: MailerService,
    private readonly config: ConfigService,
  ) {
    this.headOfficeContact = this.config.getOrThrow<string>(
      'HEAD_OFFICE_CONTACT_EMAIL',
    );
  }

  async sendIssueCreatedEmail(
    issue: Issue,
    recipients: { creatorEmail: string; assigneeEmail: string },
  ): Promise<void> {
    const to = [
      recipients.creatorEmail,
      recipients.assigneeEmail,
      this.headOfficeContact,
    ];

    await this.trySend(to, `New Issue Reported: ${issue.issueId}`, {
      template: 'issue-created',
      context: {
        issueId: issue.issueId,
        issueDesc: issue.issueDesc,
        priority: issue.issuePriority,
        dueDate: issue.dueDate,
      },
    });
  }

  async sendOverdueReminderEmail(
    issue: Issue,
    assigneeEmail: string,
  ): Promise<void> {
    await this.trySend(
      [assigneeEmail],
      `Overdue Issue Reminder: ${issue.issueId}`,
      {
        template: 'issue-overdue',
        context: {
          issueId: issue.issueId,
          issueDesc: issue.issueDesc,
          dueDate: issue.dueDate,
          status: issue.status,
        },
      },
    );
  }

  private async trySend(
    to: string[],
    subject: string,
    opts: { template: string; context: Record<string, unknown> },
  ): Promise<void> {
    try {
      await this.mailer.sendMail({ to, subject, ...opts });
    } catch (err) {
      // Email failure must never roll back or block the issue create/cron
      // flow — log and move on.
      this.logger.error(`Failed to send "${subject}" to ${to.join(', ')}`, err as Error);
    }
  }
}
