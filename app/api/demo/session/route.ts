import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { z } from 'zod';
import { rateLimit } from '@/lib/rate-limit';

const DEMO_ROLES = ['creator', 'manager', 'reviewer'] as const;
type DemoRole = typeof DEMO_ROLES[number];

const DEMO_USERS: Record<DemoRole, { name: string; email: string; userId: string }> = {
  creator: { name: 'Alex Chen (Demo Creator)', email: 'demo-creator@brandguard.demo', userId: 'demo-creator-001' },
  manager: { name: 'Jordan Smith (Demo Manager)', email: 'demo-manager@brandguard.demo', userId: 'demo-manager-001' },
  reviewer: { name: 'Riley Johnson (Demo Reviewer)', email: 'demo-reviewer@brandguard.demo', userId: 'demo-reviewer-001' },
};

const RequestSchema = z.object({
  role: z.enum(DEMO_ROLES),
});

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  const rl = rateLimit(`demo:${ip}`, 10, 60_000);
  if (!rl.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const body = await request.json();
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  const { role } = parsed.data;
  const user = DEMO_USERS[role];
  const secret = new TextEncoder().encode(process.env.DEMO_JWT_SECRET ?? 'demo-secret-change-in-production-32chars');

  const token = await new SignJWT({
    sub: user.userId,
    name: user.name,
    email: user.email,
    role,
    isDemo: true,
    organizationId: 'demo-org-001',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('4h')
    .sign(secret);

  const response = NextResponse.json({ success: true, role, name: user.name });
  response.cookies.set('demo_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 4, // 4 hours
    path: '/',
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete('demo_session');
  return response;
}
