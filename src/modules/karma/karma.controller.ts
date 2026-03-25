import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { KarmaResponseDto } from '../../common/dto/api-response.dto';
import { CurrentUserId } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { KarmaResponse } from '../../types';
import { KarmaTextDto } from './dto/karma-text.dto';
import { KarmaService } from './karma.service';

@ApiTags('karma')
@ApiBearerAuth()
@Controller()
export class KarmaController {
  constructor(private readonly karmaService: KarmaService) {}

  @Get('getUserKarma')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current user karma history' })
  @ApiOkResponse({ type: KarmaResponseDto, isArray: true })
  @ApiUnauthorizedResponse()
  getUserKarma(@CurrentUserId() userId: string): Promise<KarmaResponse[]> {
    return this.karmaService.getUserKarma(userId);
  }

  @Post('getKarma')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create karma score entry for text' })
  @ApiBody({ type: KarmaTextDto })
  @ApiOkResponse({ type: KarmaResponseDto })
  @ApiUnauthorizedResponse()
  getKarma(
    @CurrentUserId() userId: string,
    @Body() body: KarmaTextDto,
  ): Promise<KarmaResponse> {
    return this.karmaService.addKarma(userId, body.text);
  }
}
