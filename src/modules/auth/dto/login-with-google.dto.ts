import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginWithGoogleDto {
  @ApiProperty({
    description: 'Google OAuth access token used with Google userinfo API',
  })
  @IsString()
  @MinLength(1)
  accessTokenGoogle: string;
}
