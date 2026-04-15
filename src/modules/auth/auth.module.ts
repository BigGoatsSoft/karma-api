import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleOAuthService } from './google-oauth.service';
import { AppleOAuthService } from './apple-oauth.service';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [AuthService, GoogleOAuthService, AppleOAuthService],
})
export class AuthModule {}
