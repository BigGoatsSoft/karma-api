import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class KarmaTextDto {
  @ApiProperty({ example: 'I helped a teammate today.' })
  @IsString()
  @MinLength(1)
  text: string;
}
