import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';

export type JwtAccessPayload = { sub: string; typ?: string };

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException();
    }
    const token = header.slice(7);
    try {
      const payload = this.jwtService.verify<JwtAccessPayload>(token);
      if (payload.typ === 'refresh') {
        throw new UnauthorizedException();
      }
      req['user'] = payload;
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}
