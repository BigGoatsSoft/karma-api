import { Injectable, UnauthorizedException } from '@nestjs/common';

type GoogleUserInfoResponse = {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
};

export type GoogleUserProfile = {
  sub: string;
  email: string;
  name: string;
};

@Injectable()
export class GoogleOAuthService {
  async getProfileFromAccessToken(
    accessToken: string,
  ): Promise<GoogleUserProfile> {
    const trimmed = accessToken?.trim();
    if (!trimmed) {
      throw new UnauthorizedException('Missing Google access token');
    }
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${trimmed}` },
    });
    if (!res.ok) {
      throw new UnauthorizedException('Invalid or expired Google token');
    }
    const data = (await res.json()) as GoogleUserInfoResponse;
    if (!data.sub || !data.email) {
      throw new UnauthorizedException(
        'Google account missing subject or email',
      );
    }
    if (data.email_verified === false) {
      throw new UnauthorizedException('Google email must be verified');
    }
    const name = data.name?.trim() || data.email.split('@')[0] || 'User';
    return {
      sub: data.sub,
      email: data.email.trim().toLowerCase(),
      name,
    };
  }
}
