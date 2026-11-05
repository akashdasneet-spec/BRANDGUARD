import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { submissions, reviewComments, reviewEvents } from '@/db/schema/schema';
import { z } from 'zod';
import { getDemoSession } from '@/lib/demo-session';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { rateLimit } from '@/lib/rate-limit';

const ReviewActionSchema = z.object({
  submissionId: z.string().uuid(),
  action: z.enum(['approve', 'reject', 'request_revision', 'comment']),
  note: z.string().min(1).max(2000),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  const rl = rateLimit(`review:${ip}`, 20, 60_000);
  if (!rl.success) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

  const demoSession = await getDemoSession();
  if (!demoSession) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Only reviewers and managers can take review actions (except comment)
  const body = await request.json();
  const parsed = ReviewActionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { submissionId, action, note } = parsed.data;

  // Authorize: approve/reject/request_revision requires reviewer or manager
  if (['approve', 'reject', 'request_revision'].includes(action)) {
    if (!['reviewer', 'manager'].includes(demoSession.role)) {
      return NextResponse.json({ error: 'Only reviewers and managers can take this action' }, { status: 403 });
    }
  }

  const submission = await db.query.submissions.findFirst({
    where: and(eq(submissions.id, submissionId), eq(submissions.organizationId, demoSession.organizationId)),
  });
  if (!submission) return NextResponse.json({ error: 'Submission not found' }, { status: 404 });

  const fromStatus = submission.status;
  let toStatus: string | undefined;

  if (action === 'approve') toStatus = 'approved';
  else if (action === 'reject') toStatus = 'rejected';
  else if (action === 'request_revision') toStatus = 'revision_requested';

  // Add comment
  await db.insert(reviewComments).values({
    id: uuidv4(),
    submissionId,
    authorId: demoSession.sub,
    content: note,
    versionId: submission.currentVersionId,
  });

  // Record event
  const eventTypeMap: Record<string, string> = {
    approve: 'approved',
    reject: 'rejected',
    request_revision: 'revision_requested',
    comment: 'comment_added',
  };

  await db.insert(reviewEvents).values({
    id: uuidv4(),
    submissionId,
    actorId: demoSession.sub,
    eventType: eventTypeMap[action] as never,
    fromStatus,
    toStatus: (toStatus ?? fromStatus) as never,
    note,
    versionId: submission.currentVersionId,
  });

  // Update submission status
  if (toStatus) {
    await db.update(submissions).set({ status: toStatus as never, updatedAt: new Date() }).where(eq(submissions.id, submissionId));
  }

  return NextResponse.json({ success: true, action, newStatus: toStatus ?? fromStatus });
}
