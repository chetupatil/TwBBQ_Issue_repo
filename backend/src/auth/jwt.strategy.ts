import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtUser } from '../common/interfaces/jwt-user.interface';

// STUB — stands in for the real app's existing JwtStrategy. Local-only:
// verifies a token signed with JWT_SECRET and returns it as req.user in
// exactly the shape the Issues feature assumes. Swap for the real strategy
// when wiring into the actual app; nothing in the Issues feature imports
// this directly, it just relies on req.user having this shape.
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  validate(payload: JwtUser): JwtUser {
    return payload;
  }
}
