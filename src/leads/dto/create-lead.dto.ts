import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { LeadSource } from '../lead-source.enum';

export class CreateLeadDto {
  @ApiProperty({ example: 'Juan Perez' })
  @IsString()
  @MinLength(2)
  nombre!: string;

  @ApiProperty({ example: 'juan@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '+57 300 123 4567', required: false })
  @IsOptional()
  @IsString()
  telefono?: string;

  @ApiProperty({ enum: LeadSource, example: LeadSource.Instagram })
  @IsEnum(LeadSource)
  fuente!: LeadSource;

  @ApiProperty({
    example: 'Curso de ventas',
    required: false,
    name: 'producto_interes',
  })
  @IsOptional()
  @IsString()
  producto_interes?: string;

  @ApiProperty({ example: 250, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  presupuesto?: number;
}
