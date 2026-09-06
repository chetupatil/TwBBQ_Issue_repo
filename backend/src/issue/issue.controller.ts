import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // ASSUMPTION: existing guard
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { VenueScopeGuard } from './guards/venue-scope.guard';
import { IssueService } from './issue.service';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { QueryIssueDto } from './dto/query-issue.dto';
import { ReassignIssueDto } from './dto/reassign-issue.dto';
import { JwtUser } from '../common/interfaces/jwt-user.interface';
import { S3Service } from '../common/s3/s3.service';

interface RequestWithVenueScope extends Request {
  venueScope?: string | null; // set by VenueScopeGuard, never by the client
}

// Order matters: JwtAuthGuard authenticates -> RolesGuard checks the coarse
// role -> VenueScopeGuard enforces the fine-grained per-record boundary.
// ValidationPipe (assumed global, per app convention) validates the DTO
// before any of this method body runs — so by the time IssueService is
// called, both auth and input shape are already guaranteed.
@Controller('issues')
@UseGuards(JwtAuthGuard, RolesGuard, VenueScopeGuard)
export class IssueController {
  constructor(
    private readonly issueService: IssueService,
    private readonly s3Service: S3Service,
  ) {}

  @Get()
  findAll(
    @Req() req: RequestWithVenueScope,
    @Query() query: QueryIssueDto,
  ) {
    // venueScope is undefined/null for HEAD_OFFICE_ADMIN (guard only sets it
    // for VENUE) — findAll() treats null as "not scoped, may use query.venueId".
    return this.issueService.findAll(req.venueScope ?? null, query);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    // VenueScopeGuard already threw NotFoundException above if a VENUE
    // caller doesn't own this issue — nothing further to check here.
    return this.issueService.findOne(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('photo'))
  async create(
    @Body() dto: CreateIssueDto,
    @UploadedFile() photo: Express.Multer.File | undefined,
    @CurrentUser() user: JwtUser,
    @Req() req: RequestWithVenueScope,
  ) {
    // Type/size validated inside S3Service — never trust file.mimetype from
    // the client alone for anything downstream, and never accept a raw path.
    const photoUrl = photo ? await this.s3Service.uploadIssuePhoto(photo) : null;
    return this.issueService.create(dto, photoUrl, user, req.venueScope ?? null);
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateIssueDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.issueService.update(id, dto, user);
  }

  @Patch(':id/reassign')
  @Roles('HEAD_OFFICE_ADMIN')
  reassign(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: ReassignIssueDto,
    @CurrentUser() user: JwtUser,
  ) {
    return this.issueService.reassign(id, dto, user);
  }
}
