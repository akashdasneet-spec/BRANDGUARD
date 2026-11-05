import { db } from '../db';
import {
  submissions,
  submissionVersions,
  findings,
  analysisRuns,
  reviewComments,
  reviewEvents,
} from '../db/schema/schema';
import { eq } from 'drizzle-orm';

const DEMO_ORG_ID = 'demo-org-001';

async function resetDemo() {
  console.log('🔄 Resetting demo data...');

  // Delete analysis data
  const subs = await db.query.submissions.findMany({
    where: eq(submissions.organizationId, DEMO_ORG_ID),
  });
  for (const sub of subs) {
    const versions = await db.query.submissionVersions.findMany({
      where: eq(submissionVersions.submissionId, sub.id),
    });
    for (const v of versions) {
      await db.delete(findings).where(eq(findings.submissionId, sub.id));
    }
    await db.delete(reviewComments).where(eq(reviewComments.submissionId, sub.id));
    await db.delete(reviewEvents).where(eq(reviewEvents.submissionId, sub.id));
    await db.delete(analysisRuns).where(eq(analysisRuns.submissionId, sub.id));
    await db
      .update(submissions)
      .set({ status: 'draft', currentVersionId: null })
      .where(eq(submissions.id, sub.id));
  }

  console.log('✅ Demo data reset complete');
}

resetDemo()
  .catch(console.error)
  .finally(() => process.exit(0));
