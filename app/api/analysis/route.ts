import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { submissions, submissionVersions, analysisRuns, findings, brandGuidelines, brandRules, approvedFacts, brandTerms } from '@/db/schema/schema';
import { z } from 'zod';
import { getDemoSession } from '@/lib/demo-session';
import { rateLimit } from '@/lib/rate-limit';
import { runDeterministicAnalysis } from '@/engine/deterministic';
import { runAIAnalysis } from '@/engine/ai';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

const AnalysisRequestSchema = z.object({
  submissionId: z.string().uuid(),
  versionId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  const rl = rateLimit(`analysis:${ip}`, 5, 60_000);
  if (!rl.success) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

  const demoSession = await getDemoSession();
  if (!demoSession) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const parsed = AnalysisRequestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { submissionId, versionId } = parsed.data;

  // Verify ownership
  const submission = await db.query.submissions.findFirst({
    where: and(eq(submissions.id, submissionId), eq(submissions.organizationId, demoSession.organizationId)),
  });
  if (!submission) return NextResponse.json({ error: 'Submission not found' }, { status: 404 });

  const version = await db.query.submissionVersions.findFirst({
    where: and(eq(submissionVersions.id, versionId), eq(submissionVersions.submissionId, submissionId)),
  });
  if (!version) return NextResponse.json({ error: 'Version not found' }, { status: 404 });

  // Create analysis run
  const runId = uuidv4();
  await db.insert(analysisRuns).values({
    id: runId,
    submissionId,
    versionId,
    status: 'running',
    startedAt: new Date(),
    modelUsed: 'gemini-2.0-flash',
  });

  try {
    // Load brand data
    const orgId = demoSession.organizationId;
    const [rules, facts, terms, guidelines] = await Promise.all([
      db.query.brandRules.findMany({ where: and(eq(brandRules.organizationId, orgId), eq(brandRules.isActive, true)) }),
      db.query.approvedFacts.findMany({ where: and(eq(approvedFacts.organizationId, orgId), eq(approvedFacts.isActive, true)) }),
      db.query.brandTerms.findMany({ where: eq(brandTerms.organizationId, orgId) }),
      db.query.brandGuidelines.findMany({ where: and(eq(brandGuidelines.organizationId, orgId), eq(brandGuidelines.isActive, true)) }),
    ]);

    const content = version.content ?? '';

    // Run deterministic analysis
    const deterministicFindings = runDeterministicAnalysis(content, { rules, facts, terms });

    // Run AI analysis
    const aiResult = await runAIAnalysis({
      content,
      guidelines: guidelines.map(g => ({ id: g.id, title: g.title, content: g.content })),
      approvedFacts: facts.map(f => ({ id: f.id, category: f.category, claim: f.claim, value: f.value, unit: f.unit ?? undefined })),
      organizationName: 'Nova Financial (Demo)',
      organizationDescription: 'A fictional financial services company used for demo purposes',
    });

    // Insert all findings
    const allFindings = [
      ...deterministicFindings.map(f => ({
        id: f.id ?? uuidv4(),
        analysisRunId: runId,
        submissionId,
        layer: 'deterministic' as const,
        category: f.category as never,
        severity: f.severity,
        confidence: f.confidence.toString(),
        affectedText: f.affectedText,
        startOffset: f.startOffset,
        endOffset: f.endOffset,
        explanation: f.explanation,
        sourceRuleId: f.sourceRuleId,
        approvedFactId: f.approvedFactId,
        suggestedCorrection: f.suggestedCorrection,
        status: 'open' as const,
      })),
      ...aiResult.findings.map(f => ({
        id: f.id ?? uuidv4(),
        analysisRunId: runId,
        submissionId,
        layer: 'ai' as const,
        category: f.category as never,
        severity: f.severity,
        confidence: f.confidence.toString(),
        affectedText: f.affectedText,
        explanation: f.explanation,
        suggestedCorrection: f.suggestedCorrection,
        status: 'open' as const,
      })),
    ];

    if (allFindings.length > 0) {
      await db.insert(findings).values(allFindings);
    }

    // Mark analysis run complete
    await db.update(analysisRuns).set({
      status: 'completed',
      completedAt: new Date(),
    }).where(eq(analysisRuns.id, runId));

    return NextResponse.json({
      runId,
      findings: allFindings,
      aiSummary: aiResult.summary,
      overallTone: aiResult.overallTone,
      toneScore: aiResult.toneScore,
    }, { status: 201 });

  } catch (error) {
    await db.update(analysisRuns).set({
      status: 'failed',
      completedAt: new Date(),
      error: error instanceof Error ? error.message : 'Unknown error',
    }).where(eq(analysisRuns.id, runId));
    console.error('Analysis failed:', error);
    return NextResponse.json({ error: 'Analysis failed', runId }, { status: 500 });
  }
}
