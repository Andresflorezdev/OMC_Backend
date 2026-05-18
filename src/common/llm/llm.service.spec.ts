import { LlmService } from './llm.service';

describe('LlmService', () => {
  let service: LlmService;

  beforeEach(() => {
    service = new LlmService();
  });

  it('returns a mock summary when leads are provided', async () => {
    const result = await service.summarizeLeads([
      {
        source: 'instagram',
        productInterest: 'Curso de ventas',
        budget: 200,
      },
      {
        source: 'facebook',
        productInterest: 'Curso de ventas',
        budget: 100,
      },
    ]);

    expect(result.isMock).toBe(true);
    expect(result.summary).toContain('Resumen (mock)');
    expect(result.summary).toContain('instagram: 1');
    expect(result.summary).toContain('facebook: 1');
    expect(result.summary).toContain('Presupuesto promedio: $150');
  });

  it('returns a no-data message when no leads are provided', async () => {
    const result = await service.summarizeLeads([]);

    expect(result).toEqual({
      summary: 'No hay leads para resumir.',
      isMock: true,
    });
  });
});
