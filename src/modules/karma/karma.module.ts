import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { KarmaController } from './karma.controller';
import { KarmaService } from './karma.service';

@Module({
  imports: [UsersModule],
  controllers: [KarmaController],
  providers: [KarmaService],
})
export class KarmaModule {}
