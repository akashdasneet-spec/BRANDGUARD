import { NextRequest, NextResponse } from 'next/server';
import { getDemoSession } from '@/lib/demo-session';
import { db } from '@/db';
import {
  submissions,
  findings,
  analysisRuns,
  reviewComments,
  reviewEvents,
  submissionVersions,
} from '@/db/schema/schema';
import { eq } from 'drizzle-orm';
import { rateLimit } from '@/lib/rate-limit';

const DEMO_ORG_ID = 'demo-org-001';

export async function POST(request: NextRequest) {
  const demoSession = await getDemoSession();
  if (!demoSession) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  const rl = rateLimit(`demo-reset:${ip}`, 3, 60_000);
  if (!rl.success) return NextResponse.json({ error: 'Too many reset requests' }, { status: 429 });

  try {
    // Only reset analysis/review data, preserve base submissions
    const subs = await db.query.submissions.findMany({
      where: eq(submissions.organizationId, DEMO_ORG_ID),
    });
    for (const sub of subs) {
      await db.delete(findings).where(eq(findings.submissionId, sub.id));
      await db.delete(reviewComments).where(eq(reviewComments.submissionId, sub.id));
      await db.delete(reviewEvents).where(eq(reviewEvents.submissionId, sub.id));
      await db.delete(analysisRuns).where(eq(analysisRuns.submissionId, sub.id));
    }
    // Remove submissions created during demo (not the seed ones)
    const seedIds = ['sub-demo-001', 'sub-demo-002'];
    for (const sub of subs) {
      if (!seedIds.includes(sub.id)) {
        await db
          .delete(submissionVersions)
          .where(eq(submissionVersions.submissionId, sub.id));
        await db.delete(submissions).where(eq(submissions.id, sub.id));
      } else {
        await db
          .update(submissions)
          .set({ status: sub.id === 'sub-demo-002' ? 'submitted' : 'draft' })
          .where(eq(submissions.id, sub.id));
      }
    }
    return NextResponse.json({ success: true, message: 'Demo data reset successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Reset failed' }, { status: 500 });
  }
}
