import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { submissions, findings, analysisRuns, brandRules } from '@/db/schema/schema';
import { getDemoSession } from '@/lib/demo-session';
import { eq, count, sql, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  const demoSession = await getDemoSession();
  if (!demoSession) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const orgId = demoSession.organizationId;

  const [totalSubmissions, findingsBySeverity, findingsByCategory, submissionsByStatus] = await Promise.all([
    db.select({ count: count() }).from(submissions).where(eq(submissions.organizationId, orgId)),
    db.select({ severity: findings.severity, count: count() }).from(findings)
      .innerJoin(submissions, eq(findings.submissionId, submissions.id))
      .where(eq(submissions.organizationId, orgId))
      .groupBy(findings.severity),
    db.select({ category: findings.category, count: count() }).from(findings)
      .innerJoin(submissions, eq(findings.submissionId, submissions.id))
      .where(eq(submissions.organizationId, orgId))
      .groupBy(findings.category)
      .orderBy(sql`count(*) desc`)
      .limit(10),
    db.select({ status: submissions.status, count: count() }).from(submissions)
      .where(eq(submissions.organizationId, orgId))
      .groupBy(submissions.status),
  ]);

  return NextResponse.json({
    totalSubmissions: totalSubmissions[0]?.count ?? 0,
    findingsBySeverity,
    findingsByCategory,
    submissionsByStatus,
  });
}
