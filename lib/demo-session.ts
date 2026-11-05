import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export interface DemoSession {
  sub: string;
  name: string;
  email: string;
  role: 'creator' | 'manager' | 'reviewer';
  isDemo: true;
  organizationId: string;
}

export async function getDemoSession(): Promise<DemoSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('demo_session')?.value;
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(
      process.env.DEMO_JWT_SECRET ?? 'demo-secret-change-in-production-32chars'
    );
    const { payload } = await jwtVerify(token, secret);
    return payload as unknown as DemoSession;
  } catch {
    return null;
  }
}

export async function requireDemoSession(): Promise<DemoSession> {
  const session = await getDemoSession();
  if (!session) throw new Error('Demo session required');
  return session;
}
