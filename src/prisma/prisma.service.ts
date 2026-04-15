import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly pool: Pool;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is required');
    }
    const requireSsl = connectionString.includes('sslmode=require') ||
      (!connectionString.includes('sslmode=disable') && !connectionString.includes('localhost') && !connectionString.includes('127.0.0.1'));

    const pool = new Pool({
      connectionString,
      ssl: requireSsl ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
      keepAlive: true,
    });
    const adapter = new PrismaPg(pool);
    super({ adapter });
    this.pool = pool;
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    await this.pool.end();
  }
}
