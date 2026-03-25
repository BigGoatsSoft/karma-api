import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { JwtAccessPayload } from '../guards/jwt-auth.guard';

export const CurrentUserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const req = ctx.switchToHttp().getRequest<Request>();
    const user = req['user'] as JwtAccessPayload | undefined;
    if (!user?.sub) {
      throw new Error('JwtAuthGuard must run before CurrentUserId');
    }
    return user.sub;
  },
);
