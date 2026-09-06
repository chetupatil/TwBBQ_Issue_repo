// ASSUMPTION: this is the decoded JWT payload shape attached to req.user
// by the existing JwtStrategy. Confirm against the real strategy's
// validate() return value before relying on this.
export type UserRole = 'VENUE' | 'HEAD_OFFICE_ADMIN';

export interface JwtUser {
  userId: string;
  role: UserRole;
  venueId: string | null; // null for HEAD_OFFICE_ADMIN
}
