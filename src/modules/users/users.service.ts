import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type { User as DbUser } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createHmac } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';
import type { UpdateUserRequest, User } from '../../types';

const SALT_ROUNDS = 10;

function hashGoogleSubject(googleSub: string): string {
  const secret = process.env.GOOGLE_SUB_SECRET;
  if (!secret) {
    throw new Error('GOOGLE_SUB_SECRET is not set');
  }
  return createHmac('sha256', secret).update(googleSub).digest('hex');
}

function toPublicUser(u: DbUser): User {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    country: u.country,
    botPersonality: u.botPersonality,
    karmaDailyGoal: u.karmaDailyGoal,
    karma: u.karma,
    isNotificationReminder: u.isNotificationReminder,
  };
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Email/password sign-up. If the email already exists from Google-only login,
   * sets the password on that same row (link email auth to the Google account).
   */
  async createLocalUser(
    email: string,
    name: string,
    password: string,
  ): Promise<DbUser> {
    const normalized = email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({
      where: { email: normalized },
    });
    if (existing?.passwordHash) {
      throw new ConflictException('Email already registered');
    }
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    if (existing) {
      return this.prisma.user.update({
        where: { id: existing.id },
        data: { passwordHash, name: name.trim() },
      });
    }
    return this.prisma.user.create({
      data: {
        email: normalized,
        name: name.trim(),
        passwordHash,
      },
    });
  }

  /**
   * Google OAuth: match by hashed sub, or link / create by verified email.
   */
  async upsertGoogleUser(profile: {
    sub: string;
    email: string;
    name: string;
  }): Promise<DbUser> {
    const normalizedEmail = profile.email.trim().toLowerCase();
    const hashedSub = hashGoogleSubject(profile.sub);
    const bySub = await this.prisma.user.findUnique({
      where: { hashedSub },
    });
    if (bySub) {
      return this.prisma.user.update({
        where: { id: bySub.id },
        data: {
          email: normalizedEmail,
          name: profile.name.trim(),
        },
      });
    }
    const byEmail = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });
    if (byEmail) {
      if (byEmail.hashedSub && byEmail.hashedSub !== hashedSub) {
        throw new ConflictException(
          'This email is already linked to another Google account',
        );
      }
      return this.prisma.user.update({
        where: { id: byEmail.id },
        data: {
          hashedSub,
          name: profile.name.trim(),
        },
      });
    }
    return this.prisma.user.create({
      data: {
        email: normalizedEmail,
        name: profile.name.trim(),
        hashedSub,
        passwordHash: null,
      },
    });
  }

  async requireById(id: string): Promise<DbUser> {
    const u = await this.prisma.user.findUnique({ where: { id } });
    if (!u) {
      throw new NotFoundException('User not found');
    }
    return u;
  }

  async validateLocalUser(email: string, password: string): Promise<DbUser> {
    const normalized = email.trim().toLowerCase();
    const u = await this.prisma.user.findUnique({
      where: { email: normalized },
    });
    if (!u) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!u.passwordHash) {
      throw new UnauthorizedException(
        'Use Google sign-in or complete email sign-up for this account',
      );
    }
    const ok = await bcrypt.compare(password, u.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return u;
  }

  async getPublicUser(id: string): Promise<User> {
    const u = await this.requireById(id);
    return toPublicUser(u);
  }

  async updateUser(id: string, body: UpdateUserRequest): Promise<User> {
    await this.requireById(id);
    const u = await this.prisma.user.update({
      where: { id },
      data: {
        ...(body.country !== undefined && { country: body.country }),
        ...(body.botPersonality !== undefined && {
          botPersonality: body.botPersonality,
        }),
        ...(body.karmaDailyGoal !== undefined && {
          karmaDailyGoal: body.karmaDailyGoal,
        }),
        ...(body.isNotificationReminder !== undefined && {
          isNotificationReminder: body.isNotificationReminder,
        }),
      },
    });
    return toPublicUser(u);
  }
}
