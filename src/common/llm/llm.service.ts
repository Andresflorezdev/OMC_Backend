import { Injectable } from '@nestjs/common';

@Injectable()
export class LlmService {
  private buildPrompt(leads: Array<Record<string, unknown>>, notes?: string) {
    return {
      system:
        'Eres un asistente que resume listas de leads para un equipo comercial.',
      instructions:
        'Devuelve un resumen ejecutivo con hallazgos, fuentes efectivas, productos de mayor interes, presupuesto promedio y recomendaciones practicas.',
      notes: notes ?? 'sin notas adicionales',
      leads,
    };
  }

  private buildMockSummary(leads: Array<Record<string, unknown>>) {
    const total = leads.length;
    const bySource: Record<string, number> = {};
    const productCounts: Record<string, number> = {};
    let budgetSum = 0;
    let budgetCount = 0;

    for (const lead of leads) {
      const sourceValue = lead['source'] ?? 'otro';
      const source =
        typeof sourceValue === 'string'
          ? sourceValue
          : JSON.stringify(sourceValue);
      bySource[source] = (bySource[source] || 0) + 1;

      const productValue = lead['productInterest'] ?? 'sin producto';
      const product =
        typeof productValue === 'string'
          ? productValue
          : JSON.stringify(productValue);
      productCounts[product] = (productCounts[product] || 0) + 1;

      const budget = lead['budget'];
      if (typeof budget === 'number') {
        budgetSum += budget;
        budgetCount += 1;
      }
    }

    const topSource =
      Object.keys(bySource).sort((a, b) => bySource[b] - bySource[a])[0] ??
      'ninguna fuente';
    const topProducts = Object.entries(productCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([product]) => product);
    const avgBudget = budgetCount ? +(budgetSum / budgetCount).toFixed(2) : 0;

    return `Resumen (mock):\nTotal leads: ${total}.\nPrincipales fuentes: ${Object.entries(
      bySource,
    )
      .map(([source, count]) => `${source}: ${count}`)
      .join(
        ', ',
      )}.\nProductos mas demandados: ${topProducts.join(', ')}.\nPresupuesto promedio: $${avgBudget}.\nRecomendaciones: 1) Priorizar contactos de ${topSource}; 2) Segmentar por interes de producto; 3) Revisar leads con presupuesto mayor a la media.`;
  }

  async summarizeLeads(leads: Array<Record<string, unknown>>, notes?: string) {
    if (!Array.isArray(leads) || leads.length === 0) {
      return { summary: 'No hay leads para resumir.', isMock: true };
    }

    const prompt = this.buildPrompt(leads, notes);

    return {
      summary: this.buildMockSummary(prompt.leads),
      isMock: true,
      provider: 'mock',
      note: 'La arquitectura queda preparada para reemplazar este mock por un proveedor LLM real.',
    };
  }
}
