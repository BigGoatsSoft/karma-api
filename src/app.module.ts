import { Module } from '@nestjs/common';
import { JwtCoreModule } from './jwt-core.module';
import { AuthModule } from './modules/auth/auth.module';
import { KarmaModule } from './modules/karma/karma.module';
import { UsersModule } from './modules/users/users.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, JwtCoreModule, AuthModule, UsersModule, KarmaModule],
})
export class AppModule {}
