#!/usr/bin/env node
/**
 * BrandGuard Environment Validation Script
 * Run this before deployment to verify all required env vars are set
 */

const required = [
  'DATABASE_URL',
  'BETTER_AUTH_SECRET',
  'DEMO_JWT_SECRET',
];

const optional = [
  'BETTER_AUTH_URL',
  'GOOGLE_GENERATIVE_AI_API_KEY',
  'NEXT_PUBLIC_APP_URL',
];

let hasError = false;

console.log('\n🔍 BrandGuard Environment Validation\n');

for (const key of required) {
  if (!process.env[key]) {
    console.error(`❌ MISSING (required): ${key}`);
    hasError = true;
  } else {
    // Don't show the actual value for security
    console.log(`✅ SET: ${key}`);
  }
}

for (const key of optional) {
  if (!process.env[key]) {
    console.warn(`⚠️  NOT SET (optional): ${key}`);
  } else {
    console.log(`✅ SET: ${key}`);
  }
}

// Validate secret lengths
if (process.env.BETTER_AUTH_SECRET && process.env.BETTER_AUTH_SECRET.length < 32) {
  console.error('❌ BETTER_AUTH_SECRET must be at least 32 characters');
  hasError = true;
}

if (process.env.DEMO_JWT_SECRET && process.env.DEMO_JWT_SECRET.length < 32) {
  console.error('❌ DEMO_JWT_SECRET must be at least 32 characters');
  hasError = true;
}

if (hasError) {
  console.error('\n❌ Environment validation failed. Please set missing variables.\n');
  process.exit(1);
} else {
  console.log('\n✅ All required environment variables are set!\n');
}
