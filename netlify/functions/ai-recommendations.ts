import { json, requireWorkspaceMember } from './_shared/auth.js';

const recommendationSchema = {
  type: 'object', additionalProperties: false,
  properties: {
    recommendations: { type: 'array', items: { type: 'object', additionalProperties: false, properties: {
      title: { type: 'string' }, category: { type: 'string', enum: ['acquisition', 'conversion', 'monetization', 'retention', 'sales'] }, priority: { type: 'string', enum: ['low', 'medium', 'high'] }, confidence: { type: 'number', minimum: 0, maximum: 1 }, evidence: { type: 'array', items: { type: 'object', additionalProperties: false, properties: { metric: { type: 'string' }, value: { type: 'string' }, comparison: { type: 'string' } }, required: ['metric', 'value', 'comparison'] } }, suggested_action: { type: 'string' }, expected_impact: { type: 'string' }, risks: { type: 'array', items: { type: 'string' } }, requires_approval: { type: 'boolean', const: true }
    }, required: ['title', 'category', 'priority', 'confidence', 'evidence', 'suggested_action', 'expected_impact', 'risks', 'requires_approval'] } }
  }, required: ['recommendations']
};

export default async function handler(request: Request) {
  if (request.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  try {
    const payload = await request.json() as { workspace_id?: string; product?: string; period?: string; metrics?: unknown };
    if (!payload.workspace_id || !payload.metrics) return json({ error: 'workspace_id and metrics are required' }, 400);
    await requireWorkspaceMember(request, payload.workspace_id);
    if (!process.env.OPENAI_API_KEY || !process.env.OPENAI_MODEL) return json({ error: 'AI is not configured' }, 503);
    const response = await fetch('https://api.openai.com/v1/responses', { method: 'POST', headers: { authorization: `Bearer ${process.env.OPENAI_API_KEY}`, 'content-type': 'application/json' }, body: JSON.stringify({ model: process.env.OPENAI_MODEL, store: false, instructions: 'You are a marketing analytics copilot. Use only supplied metrics. Never invent missing values. Make conservative, measurable recommendations. Every external action requires human approval.', input: JSON.stringify({ product: payload.product, period: payload.period, metrics: payload.metrics }), text: { format: { type: 'json_schema', name: 'marketing_recommendations', strict: true, schema: recommendationSchema } } }) });
    if (!response.ok) return json({ error: `OpenAI request failed (${response.status})` }, 502);
    const data = await response.json() as { output?: Array<{ content?: Array<{ type?: string; text?: string }> }> };
    const outputText = data.output?.flatMap(item => item.content || []).find(item => item.type === 'output_text')?.text;
    if (!outputText) return json({ error: 'AI returned no structured output' }, 502);
    return json({ workspace_id: payload.workspace_id, generated_at: new Date().toISOString(), ...JSON.parse(outputText) });
  } catch (error) { return error instanceof Response ? error : json({ error: error instanceof Error ? error.message : 'Recommendation generation failed' }, 500); }
}
