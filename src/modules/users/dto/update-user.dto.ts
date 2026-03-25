import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import type { UpdateUserRequest } from '../../../types';

const personalities = ['neutral', 'encouraging', 'strict'] as const;

export class UpdateUserDto implements UpdateUserRequest {
  @ApiPropertyOptional({ example: 'US' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    enum: personalities,
    example: 'encouraging',
  })
  @IsOptional()
  @IsIn(personalities)
  botPersonality?: 'neutral' | 'encouraging' | 'strict';

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  karmaDailyGoal?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  isNotificationReminder?: boolean;
}
