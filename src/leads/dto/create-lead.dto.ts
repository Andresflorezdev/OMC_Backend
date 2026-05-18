import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsString,
  MinLength,
} from 'class-validator';
import { LeadSource } from '../lead-source.enum';

export class CreateLeadDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  @MinLength(2)
  nombre!: string;

  @ApiProperty({ example: 'juan@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '+57 300 123 4567' })
  @IsString()
  telefono!: string;

  @ApiProperty({ enum: LeadSource, example: LeadSource.Instagram })
  @IsEnum(LeadSource)
  fuente!: LeadSource;

  @ApiProperty({ example: 'Curso de ventas' })
  @IsString()
  productoInteres!: string;

  @ApiProperty({ example: 250 })
  @Type(() => Number)
  @IsNumber()
  presupuesto!: number;
}
