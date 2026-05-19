import { BadRequestException, ConflictException } from '@nestjs/common';
import { LlmService } from '../common/llm/llm.service';
import { LeadSource } from './lead-source.enum';
import { LeadsRepository } from './leads.repository';
import { LeadsService } from './leads.service';

describe('LeadsService', () => {
  let service: LeadsService;
  let repository: jest.Mocked<LeadsRepository>;
  let llmService: jest.Mocked<LlmService>;
  let createMock: jest.Mock;
  let findByIdMock: jest.Mock;
  let findManyMock: jest.Mock;
  let summarizeLeadsMock: jest.Mock;

  beforeEach(() => {
    createMock = jest.fn();
    findByIdMock = jest.fn();
    findManyMock = jest.fn();
    summarizeLeadsMock = jest.fn();

    repository = {
      create: createMock,
      findById: findByIdMock,
      findMany: findManyMock,
      update: jest.fn(),
      softDelete: jest.fn(),
      totalActive: jest.fn(),
      countBySource: jest.fn(),
      averageBudget: jest.fn(),
      countLast7Days: jest.fn(),
    } as unknown as jest.Mocked<LeadsRepository>;

    llmService = {
      summarizeLeads: summarizeLeadsMock,
    } as unknown as jest.Mocked<LlmService>;

    service = new LeadsService(repository, llmService);
  });

  it('maps create DTO fields into the repository payload', async () => {
    createMock.mockResolvedValue({
      id: 'lead-1',
      name: 'Juan Perez',
      email: 'juan@example.com',
      phone: '+57 300 123 4567',
      source: LeadSource.Instagram,
      productInterest: 'Curso de ventas',
      budget: 250,
      created_at: new Date('2026-05-18T00:00:00.000Z'),
      updated_at: new Date('2026-05-18T00:00:00.000Z'),
      deletedAt: null,
    });

    const result = await service.create({
      nombre: 'Juan Perez',
      email: 'juan@example.com',
      telefono: '+57 300 123 4567',
      fuente: LeadSource.Instagram,
      producto_interes: 'Curso de ventas',
      presupuesto: 250,
    });

    expect(createMock).toHaveBeenCalledWith({
      name: 'Juan Perez',
      email: 'juan@example.com',
      phone: '+57 300 123 4567',
      source: LeadSource.Instagram,
      productInterest: 'Curso de ventas',
      budget: 250,
    });
    expect(result).toMatchObject({
      id: 'lead-1',
      nombre: 'Juan Perez',
      producto_interes: 'Curso de ventas',
      created_at: new Date('2026-05-18T00:00:00.000Z'),
    });
  });

  it('throws a conflict exception when the email already exists', async () => {
    createMock.mockRejectedValue({ code: 11000 });

    await expect(
      service.create({
        nombre: 'Juan Perez',
        email: 'juan@example.com',
        fuente: LeadSource.Instagram,
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects invalid ids before querying the repository', async () => {
    await expect(service.findOne('111')).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(findByIdMock).not.toHaveBeenCalled();
  });

  it('returns only the summary text for the AI endpoint', async () => {
    findManyMock.mockResolvedValue([
      {
        source: LeadSource.Facebook,
        productInterest: 'Mentoria premium',
        budget: 500,
      },
    ] as never);
    summarizeLeadsMock.mockResolvedValue({
      summary: 'Resumen (mock): fuente principal facebook.',
      isMock: true,
      provider: 'mock',
      note: 'mock',
    });

    const result = await service.generateAiSummary({
      fuente: LeadSource.Facebook,
      limit: 10,
    });

    expect(summarizeLeadsMock).toHaveBeenCalled();
    expect(result).toBe('Resumen (mock): fuente principal facebook.');
  });
});
