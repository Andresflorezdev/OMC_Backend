import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { fetch } from 'undici';

interface GeminiGenerateResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

const DEFAULT_GEMINI_MODEL = 'models/gemini-1.5-flash';

@Injectable()
export class LlmService {
  private apiKey?: string;
  private model = DEFAULT_GEMINI_MODEL;

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.get<string>('GOOGLE_API_KEY');
  }

  private buildPrompt(leads: Array<Record<string, unknown>>, notes?: string) {
    return (
      `Eres un asistente que resume listas de leads para un equipo comercial en español. ` +
      `Recibe los leads en formato JSON y devuelve un resumen ejecutivo en español con: 1) principales hallazgos, 2) fuentes más efectivas, 3) productos de mayor interés, 4) presupuesto promedio, 5) 3 recomendaciones prácticas para el equipo.\n\n` +
      `Contexto adicional: ${notes ?? 'sin notas adicionales'}\n\n` +
      `Leads (JSON):\n${JSON.stringify(leads, null, 2)}\n\n` +
      `Por favor responde en español, máximo 400 palabras.`
    );
  }

  private async callGoogleGenerate(prompt: string): Promise<string> {
    if (!this.apiKey) throw new Error('NO_API_KEY');

    const url = `https://generativelanguage.googleapis.com/v1beta/${this.model}:generateContent?key=${encodeURIComponent(
      this.apiKey,
    )}`;

    const body = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 800,
      },
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Google Generative API error: ${res.status} ${text}`);
    }

    const data = (await res.json()) as GeminiGenerateResponse;
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  }

  private buildMockSummary(leads: Array<Record<string, unknown>>) {
    const total = leads.length;
    const bySource: Record<string, number> = {};
    const productCounts: Record<string, number> = {};
    let budgetSum = 0;
    let budgetCount = 0;

    for (const l of leads) {
      const srcVal = l['source'] ?? 'otro';
      const s = typeof srcVal === 'string' ? srcVal : JSON.stringify(srcVal);
      bySource[s] = (bySource[s] || 0) + 1;

      const prodVal = l['productInterest'] ?? 'sin producto';
      const p = typeof prodVal === 'string' ? prodVal : JSON.stringify(prodVal);
      productCounts[p] = (productCounts[p] || 0) + 1;

      const maybeBudget = l['budget'];
      if (typeof maybeBudget === 'number') {
        budgetSum += maybeBudget;
        budgetCount += 1;
      }
    }

    const sortedProducts = Object.entries(productCounts).sort(
      (a, b) => b[1] - a[1],
    );
    const topProducts = sortedProducts.slice(0, 3).map((p) => p[0]);
    const avgBudget = budgetCount ? +(budgetSum / budgetCount).toFixed(2) : 0;

    return `Resumen (mock):\nTotal leads: ${total}.\nPrincipales fuentes: ${Object.entries(
      bySource,
    )
      .map(([k, v]) => `${k}: ${v}`)
      .join(
        ', ',
      )}.\nProductos más demandados: ${topProducts.join(', ')}.\nPresupuesto promedio: $${avgBudget}.\nRecomendaciones: 1) Priorizar contactos de ${Object.keys(bySource).sort((a, b) => bySource[b] - bySource[a])[0] || 'ninguna fuente'}; 2) Segmentar por interés de producto; 3) Revisar leads con presupuesto mayor a la media.`;
  }

  async summarizeLeads(leads: Array<Record<string, unknown>>, notes?: string) {
    if (!Array.isArray(leads) || leads.length === 0) {
      return { summary: 'No hay leads para resumir.', isMock: false };
    }

    if (!this.apiKey) {
      return { summary: this.buildMockSummary(leads), isMock: true };
    }

    try {
      const prompt = this.buildPrompt(leads, notes);
      const summary = await this.callGoogleGenerate(prompt);
      return { summary, isMock: false };
    } catch (error) {
      return {
        summary: this.buildMockSummary(leads),
        isMock: true,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
