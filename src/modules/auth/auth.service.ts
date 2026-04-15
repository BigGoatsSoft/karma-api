import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { AuthResponse } from '../../types';
import { GoogleOAuthService } from './google-oauth.service';
import { AppleOAuthService } from './apple-oauth.service';
import { UsersService } from '../users/users.service';

const REFRESH_TOKEN_TYP = 'refresh';

@Injectable()
export class AuthService {
  private readonly refreshSecret = process.env.JWT_REFRESH_SECRET;

  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly googleOAuth: GoogleOAuthService,
    private readonly appleOAuth: AppleOAuthService,
  ) {}

  async signUp(
    email: string,
    name: string,
    password: string,
  ): Promise<{ auth: AuthResponse; refreshToken: string }> {
    const entity = await this.usersService.createLocalUser(
      email,
      name,
      password,
    );
    return this.buildTokens(entity.id);
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ auth: AuthResponse; refreshToken: string }> {
    const entity = await this.usersService.validateLocalUser(email, password);
    return this.buildTokens(entity.id);
  }

  async loginWithGoogle(accessTokenGoogle: string): Promise<{
    auth: AuthResponse;
    refreshToken: string;
  }> {
    const profile =
      await this.googleOAuth.getProfileFromAccessToken(accessTokenGoogle);
    const entity = await this.usersService.upsertGoogleUser(profile);
    return this.buildTokens(entity.id);
  }

  async loginWithApple(
    identityToken: string,
    fullName?: string | null,
  ): Promise<{ auth: AuthResponse; refreshToken: string }> {
    const profile = await this.appleOAuth.getProfileFromIdentityToken(
      identityToken,
      fullName,
    );
    const entity = await this.usersService.upsertAppleUser(profile);
    return this.buildTokens(entity.id);
  }

  async refresh(refreshToken: string | undefined): Promise<{
    auth: AuthResponse;
    refreshToken: string;
  }> {
    if (!refreshToken?.length) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        typ?: string;
      }>(refreshToken, { secret: this.refreshSecret });
      if (payload.typ !== REFRESH_TOKEN_TYP) {
        throw new UnauthorizedException();
      }
      await this.usersService.requireById(payload.sub);
      return this.buildTokens(payload.sub);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  private async buildTokens(userId: string): Promise<{
    auth: AuthResponse;
    refreshToken: string;
  }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync({ sub: userId }),
      this.jwtService.signAsync(
        { sub: userId, typ: REFRESH_TOKEN_TYP },
        { secret: this.refreshSecret, expiresIn: '7d' },
      ),
    ]);
    return { auth: { accessToken }, refreshToken };
  }
}
