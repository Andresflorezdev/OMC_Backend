import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { LlmService } from '../common/llm/llm.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { ListLeadsQueryDto } from './dto/list-leads.query.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { LeadSource } from './lead-source.enum';
import { LeadsRepository } from './leads.repository';
import { Lead } from './schemas/lead.schema';

type LeadLike = Lead &
  Partial<{ _id: string | { toString(): string }; id?: string }>;
type MongoDuplicateKeyError = { code: string | number };

function isMongoDuplicateKeyError(
  error: unknown,
): error is MongoDuplicateKeyError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (typeof error.code === 'string' || typeof error.code === 'number')
  );
}

@Injectable()
export class LeadsService {
  constructor(
    private readonly leadsRepository: LeadsRepository,
    private readonly llmService: LlmService,
  ) {}

  async create(createLeadDto: CreateLeadDto) {
    try {
      const lead = await this.leadsRepository.create({
        name: createLeadDto.nombre,
        email: createLeadDto.email,
        phone: createLeadDto.telefono,
        source: createLeadDto.fuente,
        productInterest: createLeadDto.producto_interes,
        budget: createLeadDto.presupuesto,
      });

      return this.toResponse(lead);
    } catch (error) {
      if (isMongoDuplicateKeyError(error)) {
        const code = error.code;
        if (code === 11000 || code === '11000') {
          throw new ConflictException('El email ya esta registrado');
        }
      }

      throw error;
    }
  }

  async findAll(query: ListLeadsQueryDto) {
    const leads = await this.leadsRepository.findMany({
      page: query.page ?? 1,
      limit: query.limit ?? 10,
      fuente: query.fuente,
      fechaInicio: query.fechaInicio ? new Date(query.fechaInicio) : undefined,
      fechaFin: query.fechaFin ? new Date(query.fechaFin) : undefined,
    });

    return {
      data: leads.map((lead) => this.toResponse(lead)),
      page: query.page ?? 1,
      limit: query.limit ?? 10,
    };
  }

  async findOne(id: string) {
    const lead = await this.leadsRepository.findById(id);

    if (!lead) {
      throw new NotFoundException('Lead no encontrado');
    }

    return this.toResponse(lead);
  }

  async update(id: string, updateLeadDto: UpdateLeadDto) {
    await this.ensureExists(id);

    try {
      const lead = await this.leadsRepository.update(id, {
        ...(updateLeadDto.nombre ? { name: updateLeadDto.nombre } : {}),
        ...(updateLeadDto.email ? { email: updateLeadDto.email } : {}),
        ...(updateLeadDto.telefono !== undefined
          ? { phone: updateLeadDto.telefono }
          : {}),
        ...(updateLeadDto.fuente ? { source: updateLeadDto.fuente } : {}),
        ...(updateLeadDto.producto_interes !== undefined
          ? { productInterest: updateLeadDto.producto_interes }
          : {}),
        ...(updateLeadDto.presupuesto !== undefined
          ? { budget: updateLeadDto.presupuesto }
          : {}),
      });

      return this.toResponse(lead!);
    } catch (error) {
      if (isMongoDuplicateKeyError(error)) {
        const code = error.code;
        if (code === 11000 || code === '11000') {
          throw new ConflictException('El email ya esta registrado');
        }
      }

      throw error;
    }
  }

  async remove(id: string) {
    await this.ensureExists(id);

    const lead = await this.leadsRepository.softDelete(id);

    return this.toResponse(lead!);
  }

  async stats() {
    const [totalLeads, leadsBySource, averageBudget, leadsLast7Days] =
      await Promise.all([
        this.leadsRepository.totalActive(),
        this.leadsRepository.countBySource(),
        this.leadsRepository.averageBudget(),
        this.leadsRepository.countLast7Days(),
      ]);

    return {
      totalLeads,
      leadsBySource: leadsBySource.reduce(
        (accumulator, item) => ({
          ...accumulator,
          [item.source]: item._count.source,
        }),
        {
          instagram: 0,
          facebook: 0,
          landing_page: 0,
          referido: 0,
          otro: 0,
        },
      ),
      averageBudget: averageBudget._avg.budget ?? 0,
      leadsLast7Days,
    };
  }

  async generateAiSummary(filter: {
    fuente?: LeadSource;
    fechaInicio?: string;
    fechaFin?: string;
    limit?: number;
  }) {
    const leads = await this.leadsRepository.findMany({
      page: 1,
      limit: filter.limit ?? 100,
      fuente: filter.fuente,
      fechaInicio: filter.fechaInicio
        ? new Date(filter.fechaInicio)
        : undefined,
      fechaFin: filter.fechaFin ? new Date(filter.fechaFin) : undefined,
    });

    const result = await this.llmService.summarizeLeads(
      leads as unknown as Array<Record<string, unknown>>,
      'Resumen solicitado desde /leads/ai/summary',
    );

    return result.summary;
  }

  private async ensureExists(id: string) {
    const lead = await this.leadsRepository.findById(id);

    if (!lead) {
      throw new NotFoundException('Lead no encontrado');
    }
  }

  private toResponse(lead: LeadLike) {
    let id: string | undefined = lead.id;
    if (!id && lead._id) {
      id = typeof lead._id === 'string' ? lead._id : lead._id.toString();
    }
    const createdAt = lead.created_at ?? null;
    const updatedAt = lead.updated_at ?? null;
    return {
      id,
      nombre: lead.name,
      email: lead.email,
      telefono: lead.phone ?? null,
      fuente: lead.source,
      producto_interes: lead.productInterest ?? null,
      presupuesto: lead.budget ?? null,
      created_at: createdAt,
      updated_at: updatedAt,
      deletedAt: lead.deletedAt ?? null,
    };
  }
}
