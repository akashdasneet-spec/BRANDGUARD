/**
 * AI-Powered Brand Analysis Engine for BrandGuard
 * Uses Vercel AI SDK with Google Gemini (gemini-2.0-flash with gemini-1.5-flash fallback).
 */

import { generateObject } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { z } from 'zod';

export const AIFindingSchema = z.object({
  id: z.string(),
  layer: z.literal('ai'),
  category: z.enum([
    'tone',
    'unsupported_claim',
    'guideline_violation',
    'style',
    'visual',
    'accessibility',
  ]),
  severity: z.enum(['critical', 'high', 'medium', 'low', 'info']),
  confidence: z.number().min(0).max(1),
  affectedText: z.string(),
  explanation: z.string(),
  findingType: z.enum([
    'confirmed_contradiction',
    'unsupported_claim',
    'unverified_claim',
    'guideline_violation',
    'stylistic_inconsistency',
  ]),
  suggestedCorrection: z.string().optional(),
  sourceGuidelineRef: z.string().optional(), // Reference to provided guideline text, NOT invented
});

export const AIAnalysisResultSchema = z.object({
  findings: z.array(AIFindingSchema),
  overallTone: z.string(),
  toneScore: z.number().min(0).max(1), // How well it matches brand tone
  summary: z.string(),
});

export type AIFinding = z.infer<typeof AIFindingSchema>;
export type AIAnalysisResult = z.infer<typeof AIAnalysisResultSchema>;

export interface AIEngineOptions {
  content: string;
  guidelines: Array<{ id: string; title: string; content: string }>;
  approvedFacts: Array<{
    id: string;
    category: string;
    claim: string;
    value?: string | null;
    unit?: string | null;
  }>;
  organizationName: string;
  organizationDescription?: string;
}

/**
 * Creates and returns the Google AI provider instance using environment variables or explicit API key.
 */
export function getGoogleProvider(apiKey?: string) {
  const key =
    apiKey ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GEMINI_API_KEY;

  if (!key) {
    throw new Error(
      'Google Generative AI API key is not configured. Set GOOGLE_GENERATIVE_AI_API_KEY or GEMINI_API_KEY.'
    );
  }

  return createGoogleGenerativeAI({
    apiKey: key,
  });
}

/**
 * Builds the comprehensive system prompt instructing the AI model
 * on brand governance rules, approved facts, and citation constraints.
 */
function buildSystemPrompt(options: AIEngineOptions): string {
  const { organizationName, organizationDescription, guidelines, approvedFacts } = options;

  let prompt = `You are the BrandGuard AI Brand Intelligence Engine, an expert brand governance and compliance auditor.
Your job is to thoroughly analyze marketing, sales, and corporate content for "${organizationName}" to ensure brand consistency, voice alignment, and factual accuracy.
${organizationDescription ? `\nOrganization Context: ${organizationDescription}\n` : ''}

=== OFFICIAL BRAND GUIDELINES ===
${
  guidelines.length > 0
    ? guidelines
        .map(
          (g, index) =>
            `[Guideline ${index + 1}: ${g.title}] (ID: ${g.id})\n${g.content}`
        )
        .join('\n\n')
    : 'No explicit written brand guidelines provided. Evaluate based on standard high-trust enterprise tone.'
}

=== APPROVED BRAND FACTS ===
${
  approvedFacts.length > 0
    ? approvedFacts
        .map(
          (f) =>
            `- [${f.category.toUpperCase()}] "${f.claim}": ${f.value}${
              f.unit ? ' ' + f.unit : ''
            } (Fact ID: ${f.id})`
        )
        .join('\n')
    : 'No pre-approved facts registered.'
}

=== AUDIT INSTRUCTIONS ===
1. Tone and Voice Analysis:
   - Evaluate whether the tone matches the brand guidelines (e.g. professional, trustworthy, transparent, innovative).
   - Flag any aggressive, misleading, sensationalist, or non-compliant tone.
   - Assign a realistic "toneScore" from 0.0 (completely violates brand tone) to 1.0 (perfect brand voice).
   - Describe the overall tone in "overallTone".

2. Fact Verification and Claim Analysis:
   - Distinguish carefully between finding types:
     * "confirmed_contradiction": Content asserts something that directly contradicts an approved brand fact or guideline.
     * "unsupported_claim": Content makes a specific, verifiable metric, performance claim, award, or certification that has NO supporting evidence in the approved facts list.
     * "unverified_claim": Content makes an assertive statement that lacks necessary context, disclaimer, or documentation.
     * "guideline_violation": Content violates an explicit guideline rule regarding messaging, audience, or forbidden patterns.
     * "stylistic_inconsistency": Content contains clashing voice, awkward phrasing, or stylistic divergence.

3. STRICT CITATION RULE (DO NOT HALLUCINATE):
   - In "sourceGuidelineRef", ONLY reference guidelines that were explicitly provided in the list above (using the guideline title or exact quote).
   - DO NOT fabricate guidelines, standards, or facts that were not provided.
   - If a finding is based on general best practices rather than a provided guideline, leave "sourceGuidelineRef" undefined.

4. Actionable Corrections:
   - For every finding, provide an exact "affectedText" snippet from the content.
   - Provide a clear, polite "explanation" explaining why it violates brand standards.
   - Provide a "suggestedCorrection" offering concrete, ready-to-use alternative wording.
   - Assign appropriate severity: "critical", "high", "medium", "low", or "info".
   - Assign a confidence score from 0.0 to 1.0 representing your certainty in the violation.
`;

  return prompt;
}

/**
 * Runs AI-powered brand analysis on the provided content.
 * Primary model: gemini-2.0-flash
 * Fallback model: gemini-1.5-flash
 */
export async function runAIAnalysis(options: AIEngineOptions): Promise<AIAnalysisResult> {
  const { content } = options;

  if (!content || !content.trim()) {
    return {
      findings: [],
      overallTone: 'Neutral',
      toneScore: 1.0,
      summary: 'No content provided for analysis.',
    };
  }

  const google = getGoogleProvider();
  const systemPrompt = buildSystemPrompt(options);
  const userPrompt = `Please perform a complete brand intelligence audit on the following content:\n\n"""\n${content}\n"""`;

  let rawResult: unknown;

  // 1. Try primary model: gemini-2.0-flash
  try {
    const response = await generateObject({
      model: google('gemini-2.0-flash'),
      schema: AIAnalysisResultSchema,
      system: systemPrompt,
      prompt: userPrompt,
    });
    rawResult = response.object;
  } catch (primaryError) {
    console.warn(
      'Primary AI model (gemini-2.0-flash) failed, attempting fallback to gemini-1.5-flash:',
      primaryError
    );

    // 2. Fallback model: gemini-1.5-flash
    try {
      const fallbackResponse = await generateObject({
        model: google('gemini-1.5-flash'),
        schema: AIAnalysisResultSchema,
        system: systemPrompt,
        prompt: userPrompt,
      });
      rawResult = fallbackResponse.object;
    } catch (fallbackError) {
      console.error(
        'AI Brand Analysis failed with both gemini-2.0-flash and gemini-1.5-flash:',
        fallbackError
      );
      throw new Error(
        `AI Brand Analysis failed: ${
          fallbackError instanceof Error ? fallbackError.message : String(fallbackError)
        }`
      );
    }
  }

  // 3. Validate and sanitize structured output with Zod
  const validated = AIAnalysisResultSchema.parse(rawResult);

  // Ensure every finding has a valid unique ID and layer: 'ai'
  const sanitizedFindings: AIFinding[] = validated.findings.map((f, index) => ({
    ...f,
    id: f.id && f.id.trim().length > 0 ? f.id : `ai-${index + 1}-${crypto.randomUUID()}`,
    layer: 'ai' as const,
  }));

  return {
    findings: sanitizedFindings,
    overallTone: validated.overallTone,
    toneScore: Math.max(0, Math.min(1, validated.toneScore)),
    summary: validated.summary,
  };
}
