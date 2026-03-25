import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;
}

export class LogoutResponseDto {
  @ApiProperty({ example: true })
  ok: true;
}

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  country: string;

  @ApiProperty({ enum: ['neutral', 'encouraging', 'strict'] })
  botPersonality: 'neutral' | 'encouraging' | 'strict';

  @ApiProperty()
  karmaDailyGoal: number;

  @ApiProperty()
  karma: number;

  @ApiProperty()
  isNotificationReminder: boolean;
}

export class KarmaResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  karma: number;

  @ApiProperty()
  text: string;

  @ApiProperty({ format: 'date-time' })
  createdAt: string;
}
