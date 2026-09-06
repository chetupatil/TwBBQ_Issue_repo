import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Not, Repository } from 'typeorm';
import { Issue } from './entities/issue.entity';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { QueryIssueDto } from './dto/query-issue.dto';
import { ReassignIssueDto } from './dto/reassign-issue.dto';
import { JwtUser } from '../common/interfaces/jwt-user.interface';
import { MailService } from '../common/mail/mail.service';
import { UsersService } from '../users/users.service'; // ASSUMPTION: existing module

/**
 * Every read/write method here that isn't clearly HEAD_OFFICE-only takes an
 * explicit `venueScope: string | null` param — set by VenueScopeGuard from
 * the JWT, never by trusting a DTO field — rather than the raw JwtUser, so
 * it's obvious at every call site that scoping already happened upstream
 * and isn't something this service re-derives from user input.
 */
@Injectable()
export class IssueService {
  constructor(
    @InjectRepository(Issue)
    private readonly issueRepo: Repository<Issue>,
    private readonly mailService: MailService,
    private readonly usersService: UsersService,
  ) {}

  async findAll(
    venueScope: string | null,
    query: QueryIssueDto,
  ): Promise<Issue[]> {
    // venueScope === null means the caller is HEAD_OFFICE_ADMIN (verified by
    // the guard); only then is query.venueId honoured.
    const where = venueScope
      ? { venueId: venueScope, ...(query.status ? { status: query.status } : {}) }
      : {
          ...(query.venueId ? { venueId: query.venueId } : {}),
          ...(query.status ? { status: query.status } : {}),
        };

    return this.issueRepo.find({ where, order: { createdDate: 'DESC' } });
  }

  async findOne(issueId: string): Promise<Issue> {
    // By the time this runs, VenueScopeGuard has already confirmed (for a
    // VENUE caller) that this issue belongs to their venue, or thrown
    // NotFoundException. No venue check is repeated here — this method is
    // intentionally simple so that guarantee is visible in one place.
    const issue = await this.issueRepo.findOne({ where: { issueId } });
    if (!issue) throw new NotFoundException('Issue not found');
    return issue;
  }

  async create(
    dto: CreateIssueDto,
    photoUrl: string | null,
    user: JwtUser,
    venueScope: string | null,
  ): Promise<Issue> {
    // Authoritative venue_id: venueScope (from the JWT via the guard) wins
    // for VENUE callers. Only HEAD_OFFICE_ADMIN may supply venueId in the
    // body, since they aren't tied to one.
    const venueId = venueScope ?? dto.venueId;
    if (!venueId) {
      throw new NotFoundException('venueId is required for this role');
    }

    const issue = this.issueRepo.create({
      issueDesc: dto.issueDesc,
      issuePriority: dto.issuePriority,
      assignedUserId: dto.assignedUserId,
      dueDate: new Date(dto.dueDate),
      issueComments: dto.issueComments ?? null,
      venueId,
      issuePhotoLink: photoUrl,
      status: 'Open',
      createdUser: user.userId,
      updatedUser: user.userId,
    });

    const saved = await this.issueRepo.save(issue);

    const [creator, assignee] = await Promise.all([
      this.usersService.findEmailById(user.userId),
      this.usersService.findEmailById(dto.assignedUserId),
    ]);
    await this.mailService.sendIssueCreatedEmail(saved, {
      creatorEmail: creator,
      assigneeEmail: assignee,
    });

    return saved;
  }

  async update(
    issueId: string,
    dto: UpdateIssueDto,
    user: JwtUser,
  ): Promise<Issue> {
    // Existence + venue ownership already enforced by VenueScopeGuard.
    const issue = await this.findOne(issueId);
    Object.assign(issue, dto, {
      ...(dto.dueDate ? { dueDate: new Date(dto.dueDate) } : {}),
      updatedUser: user.userId,
    });
    return this.issueRepo.save(issue);
  }

  /** HEAD_OFFICE_ADMIN only — enforced by @Roles() at the controller, not here. */
  async reassign(
    issueId: string,
    dto: ReassignIssueDto,
    user: JwtUser,
  ): Promise<Issue> {
    const issue = await this.issueRepo.findOne({ where: { issueId } });
    if (!issue) throw new NotFoundException('Issue not found');

    issue.assignedUserId = dto.assignedUserId;
    issue.venueId = dto.venueId;
    issue.updatedUser = user.userId;
    return this.issueRepo.save(issue);
  }

  /** Used by the daily cron job — not venue-scoped, it's an internal sweep. */
  async findOverdueOpenIssues(): Promise<Issue[]> {
    return this.issueRepo.find({
      where: {
        dueDate: LessThan(new Date()),
        status: Not('Closed'),
      },
    });
  }
}
