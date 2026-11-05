import { db } from '../db';
import {
  organizations,
  users,
  brandGuidelines,
  brandRules,
  approvedFacts,
  brandTerms,
  brandAssets,
  submissions,
  submissionVersions,
} from '../db/schema/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

const DEMO_ORG_ID = 'demo-org-001';
const DEMO_CREATOR_ID = 'demo-creator-001';

async function seedDemoOrg() {
  console.log('🌱 Seeding demo organization...');

  // 1. Create demo organization
  await db
    .insert(organizations)
    .values({
      id: DEMO_ORG_ID,
      name: 'Nova Financial',
      slug: 'nova-financial-demo',
      description:
        'Nova Financial is a fictional consumer fintech company offering digital savings accounts, personal loans, and investment products. This is a demo organization.',
      primaryColor: '#1D4ED8',
      secondaryColor: '#7C3AED',
      website: 'https://novafinancial.example.com',
      isDemo: true,
    })
    .onConflictDoUpdate({
      target: organizations.id,
      set: { name: 'Nova Financial', updatedAt: new Date() },
    });

  // 1b. Create demo creator user (ensures foreign key relations succeed)
  await db
    .insert(users)
    .values({
      id: DEMO_CREATOR_ID,
      name: 'Demo Creator',
      email: 'creator@novafinancial.example.com',
      emailVerified: true,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: { name: 'Demo Creator', updatedAt: new Date() },
    });

  // 2. Brand Guidelines
  const guidelines = [
    {
      id: 'guide-001',
      organizationId: DEMO_ORG_ID,
      title: 'Tone of Voice',
      content:
        'Nova Financial communicates in a clear, confident, and empathetic tone. We avoid jargon and corporate speak. We are direct but never aggressive. We use "you" and "your" to speak directly to customers. We never use terms like "guaranteed returns" or "risk-free" when referring to investment products. Financial products always include appropriate disclaimers.',
      version: '2.1',
      isActive: true,
    },
    {
      id: 'guide-002',
      organizationId: DEMO_ORG_ID,
      title: 'Product Claims Policy',
      content:
        'All numerical claims must be verified against the approved facts database. Interest rates must reflect current approved rates. Never state APY above 5.2% for savings products. Never claim loan approval rates above 92%. Investment returns must include the disclaimer: "Past performance does not guarantee future results." Never use the phrase "guaranteed profits" or "risk-free investment."',
      version: '1.4',
      isActive: true,
    },
    {
      id: 'guide-003',
      organizationId: DEMO_ORG_ID,
      title: 'Terminology Standards',
      content:
        'Use "digital savings account" not "online savings account". Use "personal loan" not "consumer credit". Use "Nova Financial app" not "Nova app" or "NF app". Always capitalize Nova Financial as two words. Never use competitor names in marketing material. Use "members" not "customers" or "users" in marketing contexts.',
      version: '1.0',
      isActive: true,
    },
    {
      id: 'guide-004',
      organizationId: DEMO_ORG_ID,
      title: 'Visual Brand Standards',
      content:
        'Primary color: Nova Blue (#1D4ED8). Secondary color: Nova Purple (#7C3AED). Font: Inter (body), Sora (headings). Logo must always appear on white or dark navy backgrounds. Minimum logo size: 120px wide. Never distort, rotate, or apply effects to the logo.',
      version: '3.0',
      isActive: true,
    },
  ];

  for (const g of guidelines) {
    await db
      .insert(brandGuidelines)
      .values(g)
      .onConflictDoUpdate({
        target: brandGuidelines.id,
        set: { title: g.title, updatedAt: new Date() },
      });
  }

  // 3. Brand Rules
  const rules = [
    {
      id: 'rule-001',
      organizationId: DEMO_ORG_ID,
      ruleType: 'prohibited_term',
      name: 'No guaranteed returns',
      description: 'Never promise guaranteed returns on investment products',
      pattern: 'guaranteed (returns?|profits?|gains?|income)',
      severity: 'critical',
      isActive: true,
    },
    {
      id: 'rule-002',
      organizationId: DEMO_ORG_ID,
      ruleType: 'prohibited_term',
      name: 'No risk-free claims',
      description: 'Investment products are never risk-free',
      pattern: 'risk[- ]free',
      severity: 'critical',
      isActive: true,
    },
    {
      id: 'rule-003',
      organizationId: DEMO_ORG_ID,
      ruleType: 'prohibited_term',
      name: 'No NF abbreviation',
      description: 'Do not abbreviate Nova Financial as NF',
      pattern: '\\bNF\\b',
      severity: 'medium',
      isActive: true,
    },
    {
      id: 'rule-004',
      organizationId: DEMO_ORG_ID,
      ruleType: 'prohibited_term',
      name: 'No customer term',
      description: 'Use members instead of customers in marketing',
      pattern: '\\bcustomers?\\b',
      severity: 'low',
      isActive: true,
    },
    {
      id: 'rule-005',
      organizationId: DEMO_ORG_ID,
      ruleType: 'style_rule',
      name: 'Investment disclaimer required',
      description: 'Investment content must include past performance disclaimer',
      pattern: 'invest(ment|ing|or)',
      severity: 'high',
      isActive: true,
    },
    {
      id: 'rule-006',
      organizationId: DEMO_ORG_ID,
      ruleType: 'prohibited_term',
      name: 'No "Nova app" abbreviation',
      description: 'Must use full app name',
      pattern: 'Nova app\\b',
      severity: 'medium',
      isActive: true,
    },
  ];

  for (const r of rules) {
    await db
      .insert(brandRules)
      .values(r as never)
      .onConflictDoUpdate({
        target: brandRules.id,
        set: { name: r.name, updatedAt: new Date() },
      });
  }

  // 4. Approved Facts
  const facts = [
    {
      id: 'fact-001',
      organizationId: DEMO_ORG_ID,
      category: 'savings_rate',
      claim: 'Digital Savings Account APY',
      value: '4.75',
      unit: '%',
      source: 'Product Rate Sheet Q4 2026',
      isActive: true,
    },
    {
      id: 'fact-002',
      organizationId: DEMO_ORG_ID,
      category: 'loan_rate',
      claim: 'Personal Loan APR starting from',
      value: '6.99',
      unit: '%',
      source: 'Lending Rate Schedule Oct 2026',
      isActive: true,
    },
    {
      id: 'fact-003',
      organizationId: DEMO_ORG_ID,
      category: 'approval_rate',
      claim: 'Loan approval rate',
      value: '89',
      unit: '%',
      source: 'Internal Lending Data Q3 2026',
      isActive: true,
    },
    {
      id: 'fact-004',
      organizationId: DEMO_ORG_ID,
      category: 'member_count',
      claim: 'Total active members',
      value: '2.3',
      unit: 'million',
      source: 'Q3 2026 Annual Report',
      isActive: true,
    },
    {
      id: 'fact-005',
      organizationId: DEMO_ORG_ID,
      category: 'fdic',
      claim: 'FDIC insurance limit',
      value: '250000',
      unit: 'USD',
      source: 'FDIC.gov',
      isActive: true,
    },
    {
      id: 'fact-006',
      organizationId: DEMO_ORG_ID,
      category: 'loan_amount',
      claim: 'Maximum personal loan amount',
      value: '50000',
      unit: 'USD',
      source: 'Lending Policy 2026',
      isActive: true,
    },
  ];

  for (const f of facts) {
    await db
      .insert(approvedFacts)
      .values(f as never)
      .onConflictDoUpdate({
        target: approvedFacts.id,
        set: { claim: f.claim, updatedAt: new Date() },
      });
  }

  // 5. Brand Terms
  const terms = [
    {
      id: 'term-001',
      organizationId: DEMO_ORG_ID,
      term: 'online savings account',
      termType: 'prohibited',
      preferredAlternative: 'digital savings account',
      notes: 'Brand standard: always use "digital" not "online"',
    },
    {
      id: 'term-002',
      organizationId: DEMO_ORG_ID,
      term: 'consumer credit',
      termType: 'deprecated',
      preferredAlternative: 'personal loan',
      notes: 'Legacy term',
    },
    {
      id: 'term-003',
      organizationId: DEMO_ORG_ID,
      term: 'users',
      termType: 'prohibited',
      preferredAlternative: 'members',
      notes: 'Use members in all marketing material',
    },
    {
      id: 'term-004',
      organizationId: DEMO_ORG_ID,
      term: 'digital savings account',
      termType: 'approved',
      notes: 'Official product name',
    },
    {
      id: 'term-005',
      organizationId: DEMO_ORG_ID,
      term: 'personal loan',
      termType: 'approved',
      notes: 'Official product name',
    },
    {
      id: 'term-006',
      organizationId: DEMO_ORG_ID,
      term: 'Nova Financial app',
      termType: 'approved',
      notes: 'Full official app name',
    },
    {
      id: 'term-007',
      organizationId: DEMO_ORG_ID,
      term: 'members',
      termType: 'preferred',
      notes: 'Preferred term for all marketing',
    },
  ];

  for (const t of terms) {
    await db
      .insert(brandTerms)
      .values(t as never)
      .onConflictDoUpdate({
        target: brandTerms.id,
        set: { term: t.term, updatedAt: new Date() },
      });
  }

  // 6. Example submissions with known violations
  const exampleSubmissions = [
    {
      submissionId: 'sub-demo-001',
      versionId: 'ver-demo-001',
      title: 'Q4 Savings Account Campaign',
      content: `Earn guaranteed returns with our digital savings account! Nova Financial is offering an incredible 6.5% APY on all new accounts opened before December 31st. With over 3 million customers already saving with us, join the Nova app today and start growing your money risk-free. Our NF savings solution is the best in the market.\n\nTerms: This offer is available to new customers only. FDIC insured up to $250,000.`,
      status: 'draft',
    },
    {
      submissionId: 'sub-demo-002',
      versionId: 'ver-demo-002',
      title: 'Personal Loan Email Campaign',
      content: `Dear Nova Financial Member,\n\nAre you looking for flexible financing? Our personal loan starts from just 6.99% APR, with loan amounts up to $50,000. With an 89% approval rate, chances are you qualify today.\n\nApply in minutes through the Nova Financial app.\n\nNote: Loan approval subject to creditworthiness. Past performance does not guarantee future results.`,
      status: 'submitted',
    },
  ];

  for (const s of exampleSubmissions) {
    await db
      .insert(submissions)
      .values({
        id: s.submissionId,
        organizationId: DEMO_ORG_ID,
        creatorId: DEMO_CREATOR_ID,
        title: s.title,
        contentType: 'text',
        status: s.status as never,
      })
      .onConflictDoUpdate({
        target: submissions.id,
        set: { title: s.title, updatedAt: new Date() },
      });

    await db
      .insert(submissionVersions)
      .values({
        id: s.versionId,
        submissionId: s.submissionId,
        versionNumber: 1,
        content: s.content,
        createdById: DEMO_CREATOR_ID,
      })
      .onConflictDoUpdate({
        target: submissionVersions.id,
        set: { content: s.content },
      });

    await db
      .update(submissions)
      .set({ currentVersionId: s.versionId })
      .where(eq(submissions.id, s.submissionId));
  }

  console.log('✅ Demo data seeded successfully!');
  console.log('  - Organization: Nova Financial');
  console.log(`  - ${guidelines.length} brand guidelines`);
  console.log(`  - ${rules.length} brand rules`);
  console.log(`  - ${facts.length} approved facts`);
  console.log(`  - ${terms.length} brand terms`);
  console.log(`  - ${exampleSubmissions.length} example submissions`);
}

seedDemoOrg()
  .catch(console.error)
  .finally(() => process.exit(0));
