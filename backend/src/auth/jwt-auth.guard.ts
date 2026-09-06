import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// STUB standing in for the real app's existing guard — this is the file
// path the Issues controller imports (../auth/jwt-auth.guard). Replace the
// whole auth/ folder with the real app's when integrating for real.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
