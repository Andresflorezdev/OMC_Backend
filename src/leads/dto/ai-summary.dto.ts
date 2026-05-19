import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { LeadSource } from '../lead-source.enum';

export class AiSummaryDto {
  @ApiPropertyOptional({ enum: LeadSource })
  @IsOptional()
  @IsEnum(LeadSource)
  fuente?: LeadSource;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 100;
}
