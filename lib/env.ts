import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url().optional(),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional(),
  DEMO_JWT_SECRET: z.string().min(32),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

function validateEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Invalid environment variables');
    }
  }
  return parsed.data ?? (process.env as unknown as z.infer<typeof envSchema>);
}

export const env = validateEnv();
