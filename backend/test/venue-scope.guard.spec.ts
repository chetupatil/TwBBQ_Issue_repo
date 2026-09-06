import { ExecutionContext, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { VenueScopeGuard } from '../src/issue/guards/venue-scope.guard';
import { Issue } from '../src/issue/entities/issue.entity';

/**
 * Proves the requirement: a VENUE user cannot fetch another venue's issue
 * by ID, and cannot see it in the list either by omitting a filter or by
 * trying to override the filter with someone else's venueId.
 */
describe('VenueScopeGuard', () => {
  let guard: VenueScopeGuard;
  const findOne = jest.fn();

  const VENUE_A = 'venue-aaa';
  const VENUE_B = 'venue-bbb';
  const ISSUE_OWNED_BY_B = 'issue-belongs-to-venue-b';

  function makeContext(opts: {
    user: { userId: string; role: 'VENUE' | 'HEAD_OFFICE_ADMIN'; venueId: string | null };
    params?: Record<string, string>;
    query?: Record<string, string>;
  }): { context: ExecutionContext; request: any } {
    const request: any = {
      user: opts.user,
      params: opts.params ?? {},
      query: opts.query ?? {},
    };
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
    return { context, request };
  }

  beforeEach(async () => {
    findOne.mockReset();

    const moduleRef = await Test.createTestingModule({
      providers: [
        VenueScopeGuard,
        { provide: getRepositoryToken(Issue), useValue: { findOne } },
      ],
    }).compile();

    guard = moduleRef.get(VenueScopeGuard);
  });

  it('blocks a VENUE user fetching another venue\'s issue by id (404, not 403)', async () => {
    // The issue exists, but belongs to venue B — caller is venue A.
    findOne.mockResolvedValue({ issueId: ISSUE_OWNED_BY_B, venueId: VENUE_B });

    const { context } = makeContext({
      user: { userId: 'u1', role: 'VENUE', venueId: VENUE_A },
      params: { id: ISSUE_OWNED_BY_B },
    });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(NotFoundException);
    expect(findOne).toHaveBeenCalledWith(
      expect.objectContaining({ where: { issueId: ISSUE_OWNED_BY_B } }),
    );
  });

  it('allows a VENUE user fetching their own venue\'s issue by id', async () => {
    findOne.mockResolvedValue({ issueId: 'issue-owned-by-a', venueId: VENUE_A });

    const { context } = makeContext({
      user: { userId: 'u1', role: 'VENUE', venueId: VENUE_A },
      params: { id: 'issue-owned-by-a' },
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
  });

  it('returns 404 for a non-existent issue id, same as a cross-venue one (no enumeration signal)', async () => {
    findOne.mockResolvedValue(null);

    const { context } = makeContext({
      user: { userId: 'u1', role: 'VENUE', venueId: VENUE_A },
      params: { id: 'does-not-exist' },
    });

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('forces venueScope to the JWT\'s venueId on list requests, ignoring a client-supplied venueId query param', async () => {
    const { context, request } = makeContext({
      user: { userId: 'u1', role: 'VENUE', venueId: VENUE_A },
      // Caller tries to override the filter to read venue B's issues.
      query: { venueId: VENUE_B },
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    // The guard's own scope wins regardless of what's in the query string;
    // IssueService.findAll() reads req.venueScope, never req.query.venueId,
    // when the caller is VENUE (see issue.service.ts findAll()).
    expect(request.venueScope).toBe(VENUE_A);
    expect(request.venueScope).not.toBe(VENUE_B);
  });

  it('forces venueScope even when the client omits any venue filter at all', async () => {
    const { context, request } = makeContext({
      user: { userId: 'u1', role: 'VENUE', venueId: VENUE_A },
      query: {},
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.venueScope).toBe(VENUE_A);
  });

  it('lets HEAD_OFFICE_ADMIN through untouched, including across venues', async () => {
    const { context, request } = makeContext({
      user: { userId: 'admin1', role: 'HEAD_OFFICE_ADMIN', venueId: null },
      params: { id: ISSUE_OWNED_BY_B },
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(findOne).not.toHaveBeenCalled();
    expect(request.venueScope).toBeUndefined();
  });
});
