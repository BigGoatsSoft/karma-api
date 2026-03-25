import { Injectable } from '@nestjs/common';
import type { KarmaResponse } from '../../types';
import { PrismaService } from '../../prisma/prisma.service';
import { UsersService } from '../users/users.service';

function scoreFromText(text: string): number {
  // TODO: Implement karma scoring logic
  return 0;
}

function toKarmaResponse(row: {
  id: number;
  karma: number;
  text: string;
  createdAt: Date;
}): KarmaResponse {
  return {
    id: row.id,
    karma: row.karma,
    text: row.text,
    createdAt: row.createdAt.toISOString(),
  };
}

@Injectable()
export class KarmaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
  ) {}

  async getUserKarma(userId: string): Promise<KarmaResponse[]> {
    await this.usersService.requireById(userId);
    const rows = await this.prisma.karmaEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(toKarmaResponse);
  }

  async addKarma(userId: string, text: string): Promise<KarmaResponse> {
    await this.usersService.requireById(userId);
    const karma = scoreFromText(text);
    const trimmed = text.trim();
    const row = await this.prisma.$transaction(async (tx) => {
      const created = await tx.karmaEntry.create({
        data: { userId, karma, text: trimmed },
      });
      await tx.user.update({
        where: { id: userId },
        data: { karma: { increment: karma } },
      });
      return created;
    });
    return toKarmaResponse(row);
  }
}
