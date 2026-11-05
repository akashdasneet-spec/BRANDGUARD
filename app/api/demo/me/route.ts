import { NextResponse } from 'next/server';
import { getDemoSession } from '@/lib/demo-session';

export async function GET() {
  const session = await getDemoSession();
  if (!session) return NextResponse.json({ error: 'No demo session' }, { status: 401 });
  return NextResponse.json({
    sub: session.sub,
    name: session.name,
    email: session.email,
    role: session.role,
    organizationId: session.organizationId,
    isDemo: true,
  });
}
