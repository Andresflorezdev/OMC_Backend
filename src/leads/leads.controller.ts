import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AiSummaryDto } from './dto/ai-summary.dto';
import { CreateLeadDto } from './dto/create-lead.dto';
import { ListLeadsQueryDto } from './dto/list-leads.query.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadsService } from './leads.service';

@ApiTags('leads')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @ApiCreatedResponse({ description: 'Lead creado' })
  create(@Body() createLeadDto: CreateLeadDto) {
    return this.leadsService.create(createLeadDto);
  }

  @Get()
  @ApiOkResponse({ description: 'Listado de leads' })
  findAll(@Query() query: ListLeadsQueryDto) {
    return this.leadsService.findAll(query);
  }

  @Get('stats')
  @ApiOkResponse({ description: 'Estadisticas de leads' })
  stats() {
    return this.leadsService.stats();
  }

  @Get(':id')
  @ApiOkResponse({ description: 'Lead encontrado' })
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  @Patch(':id')
  @ApiOkResponse({ description: 'Lead actualizado' })
  update(@Param('id') id: string, @Body() updateLeadDto: UpdateLeadDto) {
    return this.leadsService.update(id, updateLeadDto);
  }

  @Delete(':id')
  @ApiOkResponse({ description: 'Lead eliminado' })
  remove(@Param('id') id: string) {
    return this.leadsService.remove(id);
  }

  @Post('ai/summary')
  @ApiOkResponse({ description: 'Resumen ejecutivo generado por LLM' })
  aiSummary(@Body() body: AiSummaryDto) {
    return this.leadsService.generateAiSummary(body);
  }
}
