import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Issue } from './entities/issue.entity';
import { IssueController } from './issue.controller';
import { IssueService } from './issue.service';
import { IssueCronService } from './issue.cron';
import { VenueScopeGuard } from './guards/venue-scope.guard';
import { S3Service } from '../common/s3/s3.service';
import { MailService } from '../common/mail/mail.service';
import { UsersModule } from '../users/users.module'; // ASSUMPTION: existing module

@Module({
  imports: [TypeOrmModule.forFeature([Issue]), UsersModule],
  controllers: [IssueController],
  providers: [
    IssueService,
    IssueCronService,
    VenueScopeGuard,
    S3Service,
    MailService,
  ],
  exports: [IssueService],
})
export class IssueModule {}
