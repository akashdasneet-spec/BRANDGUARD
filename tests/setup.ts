import { vi } from 'vitest';

// Mock environment variables for testing
process.env.DATABASE_URL = 'postgresql://test:test@localhost/test';
process.env.BETTER_AUTH_SECRET = 'test-secret-at-least-32-characters-long';
process.env.DEMO_JWT_SECRET = 'demo-test-secret-at-least-32-chars';
// NODE_ENV is set by the test runner (vitest sets it to 'test' automatically)

// Mock next/headers for server components
vi.mock('next/headers', () => ({
  cookies: vi.fn().mockReturnValue({
    get: vi.fn().mockReturnValue(null),
    set: vi.fn(),
    delete: vi.fn(),
  }),
  headers: vi.fn().mockReturnValue(new Map()),
}));
