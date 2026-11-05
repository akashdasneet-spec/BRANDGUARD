import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { findings, submissions } from '@/db/schema/schema';
import { z } from 'zod';
import { getDemoSession } from '@/lib/demo-session';
import { eq, and } from 'drizzle-orm';

const UpdateFindingSchema = z.object({
  status: z.enum(['open', 'accepted', 'dismissed', 'fixed']),
  reviewNote: z.string().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const demoSession = await getDemoSession();
  if (!demoSession) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json();
  const parsed = UpdateFindingSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const finding = await db.query.findings.findFirst({ where: eq(findings.id, id) });
  if (!finding) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  // Verify org access via submission
  const submission = await db.query.submissions.findFirst({
    where: and(eq(submissions.id, finding.submissionId), eq(submissions.organizationId, demoSession.organizationId)),
  });
  if (!submission) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const [updated] = await db.update(findings).set({
    status: parsed.data.status,
    reviewNote: parsed.data.reviewNote,
    updatedAt: new Date(),
  }).where(eq(findings.id, id)).returning();

  return NextResponse.json({ finding: updated });
}
