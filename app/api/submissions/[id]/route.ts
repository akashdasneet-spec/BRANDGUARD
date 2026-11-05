import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { submissions, submissionVersions, reviewEvents } from '@/db/schema/schema';
import { eq, and } from 'drizzle-orm';
import { getDemoSession } from '@/lib/demo-session';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const UpdateSubmissionSchema = z.object({
  status: z.enum(['submitted', 'draft']).optional(),
  note: z.string().optional(),
  content: z.string().optional(), // new version content
});

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const demoSession = await getDemoSession();
  if (!demoSession) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const submission = await db.query.submissions.findFirst({
    where: and(eq(submissions.id, id), eq(submissions.organizationId, demoSession.organizationId)),
    with: {
      submissionVersions: { orderBy: (v, { desc }) => [desc(v.versionNumber)] },
    },
  });

  if (!submission) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ submission });
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const demoSession = await getDemoSession();
  if (!demoSession) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const submission = await db.query.submissions.findFirst({
    where: and(eq(submissions.id, id), eq(submissions.organizationId, demoSession.organizationId)),
  });
  if (!submission) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const body = await request.json();
  const parsed = UpdateSubmissionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const updates: Record<string, unknown> = {};

  // If new content provided, create a new version
  if (parsed.data.content) {
    if (demoSession.role !== 'creator') return NextResponse.json({ error: 'Only creators can edit content' }, { status: 403 });
    const versions = await db.query.submissionVersions.findMany({
      where: eq(submissionVersions.submissionId, id),
    });
    const nextVersion = versions.length + 1;
    const versionId = uuidv4();
    const [newVersion] = await db.insert(submissionVersions).values({
      id: versionId,
      submissionId: id,
      versionNumber: nextVersion,
      content: parsed.data.content,
      createdById: demoSession.sub,
      changes: `Version ${nextVersion} - edited by ${demoSession.name}`,
    }).returning();
    updates.currentVersionId = versionId;
  }

  // Status transitions
  if (parsed.data.status) {
    const fromStatus = submission.status;
    let toStatus = parsed.data.status;

    // Validate transitions
    if (toStatus === 'submitted' && demoSession.role !== 'creator') {
      return NextResponse.json({ error: 'Only creators can submit' }, { status: 403 });
    }

    updates.status = toStatus;

    // Record review event
    await db.insert(reviewEvents).values({
      id: uuidv4(),
      submissionId: id,
      actorId: demoSession.sub,
      eventType: toStatus === 'submitted' ? 'submitted' : 'reset',
      fromStatus,
      toStatus,
      note: parsed.data.note,
    });
  }

  if (Object.keys(updates).length > 0) {
    await db.update(submissions).set({ ...updates, updatedAt: new Date() }).where(eq(submissions.id, id));
  }

  const updated = await db.query.submissions.findFirst({ where: eq(submissions.id, id) });
  return NextResponse.json({ submission: updated });
}
