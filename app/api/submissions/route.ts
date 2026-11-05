import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { submissions, submissionVersions, organizations } from '@/db/schema/schema';
import { z } from 'zod';
import { getDemoSession } from '@/lib/demo-session';
import { rateLimit } from '@/lib/rate-limit';
import { eq, desc, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

const CreateSubmissionSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1).max(100000),
  contentType: z.enum(['text', 'document', 'image', 'mixed']).default('text'),
});

export async function GET(request: NextRequest) {
  const demoSession = await getDemoSession();
  if (!demoSession) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const orgId = demoSession.organizationId;
  const rows = await db.query.submissions.findMany({
    where: eq(submissions.organizationId, orgId),
    orderBy: [desc(submissions.createdAt)],
    with: { submissionVersions: { orderBy: [desc(submissionVersions.versionNumber)], limit: 1 } },
  });

  return NextResponse.json({ submissions: rows });
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  const rl = rateLimit(`submissions:${ip}`, 10, 60_000);
  if (!rl.success) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });

  const demoSession = await getDemoSession();
  if (!demoSession) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (demoSession.role !== 'creator') return NextResponse.json({ error: 'Only creators can submit content' }, { status: 403 });

  const body = await request.json();
  const parsed = CreateSubmissionSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const submissionId = uuidv4();
  const versionId = uuidv4();

  const [newSubmission] = await db.insert(submissions).values({
    id: submissionId,
    organizationId: demoSession.organizationId,
    creatorId: demoSession.sub,
    title: parsed.data.title,
    contentType: parsed.data.contentType,
    status: 'draft',
  }).returning();

  const [version] = await db.insert(submissionVersions).values({
    id: versionId,
    submissionId,
    versionNumber: 1,
    content: parsed.data.content,
    createdById: demoSession.sub,
  }).returning();

  await db.update(submissions).set({ currentVersionId: versionId }).where(eq(submissions.id, submissionId));

  return NextResponse.json({ submission: newSubmission, version }, { status: 201 });
}
