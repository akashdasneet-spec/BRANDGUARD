import { relations, type InferInsertModel, type InferSelectModel } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

// ============================================================================
// ENUMS
// ============================================================================

export const membershipRoleEnum = pgEnum('membership_role', [
  'admin',
  'manager',
  'creator',
  'reviewer',
]);

export const ruleTypeEnum = pgEnum('rule_type', [
  'prohibited_term',
  'required_term',
  'approved_phrase',
  'style_rule',
  'tone_rule',
  'fact_rule',
]);

export const ruleSeverityEnum = pgEnum('rule_severity', [
  'critical',
  'high',
  'medium',
  'low',
]);

export const termTypeEnum = pgEnum('term_type', [
  'approved',
  'prohibited',
  'preferred',
  'deprecated',
]);

export const assetTypeEnum = pgEnum('asset_type', [
  'logo',
  'color_palette',
  'font',
  'image',
  'template',
]);

export const submissionContentTypeEnum = pgEnum('submission_content_type', [
  'text',
  'document',
  'image',
  'mixed',
]);

export const submissionStatusEnum = pgEnum('submission_status', [
  'draft',
  'submitted',
  'in_review',
  'revision_requested',
  'approved',
  'rejected',
]);

export const analysisStatusEnum = pgEnum('analysis_status', [
  'pending',
  'running',
  'completed',
  'failed',
]);

export const findingLayerEnum = pgEnum('finding_layer', [
  'deterministic',
  'ai',
]);

export const findingCategoryEnum = pgEnum('finding_category', [
  'prohibited_term',
  'required_term',
  'fact_error',
  'date_error',
  'tone',
  'unsupported_claim',
  'guideline_violation',
  'style',
  'accessibility',
  'visual',
]);

export const findingSeverityEnum = pgEnum('finding_severity', [
  'critical',
  'high',
  'medium',
  'low',
  'info',
]);

export const findingStatusEnum = pgEnum('finding_status', [
  'open',
  'accepted',
  'dismissed',
  'fixed',
]);

export const reviewEventTypeEnum = pgEnum('review_event_type', [
  'submitted',
  'review_started',
  'comment_added',
  'revision_requested',
  'approved',
  'rejected',
  'resubmitted',
  'reset',
]);

export const actorTypeEnum = pgEnum('actor_type', [
  'user',
  'system',
  'demo',
]);

// ============================================================================
// TABLES
// ============================================================================

// 1. Organizations
export const organizations = pgTable(
  'organizations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    logoUrl: text('logo_url'),
    primaryColor: varchar('primary_color', { length: 32 }),
    secondaryColor: varchar('secondary_color', { length: 32 }),
    website: text('website'),
    description: text('description'),
    isDemo: boolean('is_demo').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('organizations_slug_idx').on(table.slug),
    index('organizations_is_demo_idx').on(table.isDemo),
  ],
);

// 2. Users
export const users = pgTable(
  'users',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }),
    email: varchar('email', { length: 255 }).notNull().unique(),
    emailVerified: boolean('email_verified').notNull().default(false),
    image: text('image'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('users_email_idx').on(table.email),
  ],
);

// 3. Sessions
export const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('sessions_user_id_idx').on(table.userId),
    index('sessions_token_idx').on(table.token),
  ],
);

// 4. Accounts
export const accounts = pgTable(
  'accounts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    password: text('password'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('accounts_user_id_idx').on(table.userId),
    index('accounts_provider_account_idx').on(table.providerId, table.accountId),
  ],
);

// 5. Verifications
export const verifications = pgTable(
  'verifications',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('verifications_identifier_idx').on(table.identifier),
  ],
);

// 6. Memberships
export const memberships = pgTable(
  'memberships',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    role: membershipRoleEnum('role').notNull().default('creator'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique('memberships_user_org_unique').on(table.userId, table.organizationId),
    index('memberships_user_id_idx').on(table.userId),
    index('memberships_organization_id_idx').on(table.organizationId),
  ],
);

// 7. Brand Guidelines
export const brandGuidelines = pgTable(
  'brand_guidelines',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    content: text('content').notNull(),
    version: varchar('version', { length: 50 }).notNull().default('1.0'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('brand_guidelines_org_idx').on(table.organizationId),
    index('brand_guidelines_org_active_idx').on(table.organizationId, table.isActive),
  ],
);

// 8. Brand Rules
export const brandRules = pgTable(
  'brand_rules',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    ruleType: ruleTypeEnum('rule_type').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    pattern: text('pattern').notNull(),
    severity: ruleSeverityEnum('severity').notNull().default('medium'),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('brand_rules_org_idx').on(table.organizationId),
    index('brand_rules_org_type_idx').on(table.organizationId, table.ruleType),
    index('brand_rules_org_active_idx').on(table.organizationId, table.isActive),
  ],
);

// 9. Approved Facts
export const approvedFacts = pgTable(
  'approved_facts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    category: varchar('category', { length: 100 }).notNull(),
    claim: text('claim').notNull(),
    source: text('source'),
    value: text('value'),
    unit: varchar('unit', { length: 50 }),
    effectiveDate: timestamp('effective_date', { withTimezone: true }),
    expiryDate: timestamp('expiry_date', { withTimezone: true }),
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('approved_facts_org_idx').on(table.organizationId),
    index('approved_facts_org_category_idx').on(table.organizationId, table.category),
    index('approved_facts_org_active_idx').on(table.organizationId, table.isActive),
  ],
);

// 10. Brand Terms
export const brandTerms = pgTable(
  'brand_terms',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    term: varchar('term', { length: 255 }).notNull(),
    termType: termTypeEnum('term_type').notNull(),
    preferredAlternative: varchar('preferred_alternative', { length: 255 }),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('brand_terms_org_idx').on(table.organizationId),
    index('brand_terms_org_term_idx').on(table.organizationId, table.term),
    index('brand_terms_org_type_idx').on(table.organizationId, table.termType),
  ],
);

// 11. Brand Assets
export const brandAssets = pgTable(
  'brand_assets',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    assetType: assetTypeEnum('asset_type').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    url: text('url').notNull(),
    metadata: jsonb('metadata').$type<Record<string, unknown>>(),
    isReference: boolean('is_reference').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('brand_assets_org_idx').on(table.organizationId),
    index('brand_assets_org_type_idx').on(table.organizationId, table.assetType),
  ],
);

// 12. Submissions
export const submissions = pgTable(
  'submissions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    creatorId: uuid('creator_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    contentType: submissionContentTypeEnum('content_type')
      .notNull()
      .default('text'),
    status: submissionStatusEnum('status').notNull().default('draft'),
    currentVersionId: uuid('current_version_id'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('submissions_org_idx').on(table.organizationId),
    index('submissions_creator_idx').on(table.creatorId),
    index('submissions_org_status_idx').on(table.organizationId, table.status),
  ],
);

// 13. Submission Versions
export const submissionVersions = pgTable(
  'submission_versions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    submissionId: uuid('submission_id')
      .notNull()
      .references(() => submissions.id, { onDelete: 'cascade' }),
    versionNumber: integer('version_number').notNull().default(1),
    content: text('content').notNull(),
    contentHtml: text('content_html'),
    fileUrl: text('file_url'),
    fileName: varchar('file_name', { length: 255 }),
    fileType: varchar('file_type', { length: 100 }),
    changes: text('changes'),
    createdById: uuid('created_by_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('submission_versions_sub_idx').on(table.submissionId),
    index('submission_versions_sub_num_idx').on(
      table.submissionId,
      table.versionNumber,
    ),
    index('submission_versions_creator_idx').on(table.createdById),
  ],
);

// 14. Analysis Runs
export const analysisRuns = pgTable(
  'analysis_runs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    submissionId: uuid('submission_id')
      .notNull()
      .references(() => submissions.id, { onDelete: 'cascade' }),
    versionId: uuid('version_id')
      .notNull()
      .references(() => submissionVersions.id, { onDelete: 'cascade' }),
    status: analysisStatusEnum('status').notNull().default('pending'),
    startedAt: timestamp('started_at', { withTimezone: true }),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    error: text('error'),
    modelUsed: varchar('model_used', { length: 100 }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('analysis_runs_sub_idx').on(table.submissionId),
    index('analysis_runs_version_idx').on(table.versionId),
    index('analysis_runs_status_idx').on(table.status),
  ],
);

// 15. Findings
export const findings = pgTable(
  'findings',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    analysisRunId: uuid('analysis_run_id')
      .notNull()
      .references(() => analysisRuns.id, { onDelete: 'cascade' }),
    submissionId: uuid('submission_id')
      .notNull()
      .references(() => submissions.id, { onDelete: 'cascade' }),
    layer: findingLayerEnum('layer').notNull(),
    category: findingCategoryEnum('category').notNull(),
    severity: findingSeverityEnum('severity').notNull().default('medium'),
    confidence: numeric('confidence', { precision: 3, scale: 2 })
      .notNull()
      .default('1.00'),
    affectedText: text('affected_text').notNull(),
    startOffset: integer('start_offset'),
    endOffset: integer('end_offset'),
    explanation: text('explanation').notNull(),
    sourceGuidelineId: uuid('source_guideline_id').references(
      () => brandGuidelines.id,
      { onDelete: 'set null' },
    ),
    sourceRuleId: uuid('source_rule_id').references(() => brandRules.id, {
      onDelete: 'set null',
    }),
    approvedFactId: uuid('approved_fact_id').references(
      () => approvedFacts.id,
      { onDelete: 'set null' },
    ),
    suggestedCorrection: text('suggested_correction'),
    status: findingStatusEnum('status').notNull().default('open'),
    reviewNote: text('review_note'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('findings_run_idx').on(table.analysisRunId),
    index('findings_sub_idx').on(table.submissionId),
    index('findings_sub_status_idx').on(table.submissionId, table.status),
    index('findings_sub_severity_idx').on(table.submissionId, table.severity),
  ],
);

// 16. Review Comments
export const reviewComments = pgTable(
  'review_comments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    submissionId: uuid('submission_id')
      .notNull()
      .references(() => submissions.id, { onDelete: 'cascade' }),
    authorId: uuid('author_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    content: text('content').notNull(),
    versionId: uuid('version_id').references(() => submissionVersions.id, {
      onDelete: 'set null',
    }),
    findingId: uuid('finding_id').references(() => findings.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('review_comments_sub_idx').on(table.submissionId),
    index('review_comments_author_idx').on(table.authorId),
    index('review_comments_finding_idx').on(table.findingId),
  ],
);

// 17. Review Events
export const reviewEvents = pgTable(
  'review_events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    submissionId: uuid('submission_id')
      .notNull()
      .references(() => submissions.id, { onDelete: 'cascade' }),
    actorId: uuid('actor_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    eventType: reviewEventTypeEnum('event_type').notNull(),
    fromStatus: submissionStatusEnum('from_status'),
    toStatus: submissionStatusEnum('to_status'),
    note: text('note'),
    versionId: uuid('version_id').references(() => submissionVersions.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('review_events_sub_idx').on(table.submissionId),
    index('review_events_actor_idx').on(table.actorId),
    index('review_events_type_idx').on(table.eventType),
  ],
);

// 18. Audit Logs
export const auditLogs = pgTable(
  'audit_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    organizationId: uuid('organization_id')
      .notNull()
      .references(() => organizations.id, { onDelete: 'cascade' }),
    actorId: uuid('actor_id'),
    actorType: actorTypeEnum('actor_type').notNull().default('user'),
    action: text('action').notNull(),
    resourceType: varchar('resource_type', { length: 100 }).notNull(),
    resourceId: varchar('resource_id', { length: 255 }),
    details: jsonb('details').$type<Record<string, unknown>>(),
    ipAddress: varchar('ip_address', { length: 45 }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('audit_logs_org_idx').on(table.organizationId),
    index('audit_logs_org_resource_idx').on(
      table.organizationId,
      table.resourceType,
    ),
    index('audit_logs_actor_idx').on(table.actorId),
  ],
);

// ============================================================================
// RELATIONS
// ============================================================================

export const organizationsRelations = relations(organizations, ({ many }) => ({
  memberships: many(memberships),
  brandGuidelines: many(brandGuidelines),
  brandRules: many(brandRules),
  approvedFacts: many(approvedFacts),
  brandTerms: many(brandTerms),
  brandAssets: many(brandAssets),
  submissions: many(submissions),
  auditLogs: many(auditLogs),
}));

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  memberships: many(memberships),
  submissions: many(submissions),
  submissionVersions: many(submissionVersions),
  reviewComments: many(reviewComments),
  reviewEvents: many(reviewEvents),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const membershipsRelations = relations(memberships, ({ one }) => ({
  user: one(users, {
    fields: [memberships.userId],
    references: [users.id],
  }),
  organization: one(organizations, {
    fields: [memberships.organizationId],
    references: [organizations.id],
  }),
}));

export const brandGuidelinesRelations = relations(
  brandGuidelines,
  ({ one, many }) => ({
    organization: one(organizations, {
      fields: [brandGuidelines.organizationId],
      references: [organizations.id],
    }),
    findings: many(findings),
  }),
);

export const brandRulesRelations = relations(brandRules, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [brandRules.organizationId],
    references: [organizations.id],
  }),
  findings: many(findings),
}));

export const approvedFactsRelations = relations(
  approvedFacts,
  ({ one, many }) => ({
    organization: one(organizations, {
      fields: [approvedFacts.organizationId],
      references: [organizations.id],
    }),
    findings: many(findings),
  }),
);

export const brandTermsRelations = relations(brandTerms, ({ one }) => ({
  organization: one(organizations, {
    fields: [brandTerms.organizationId],
    references: [organizations.id],
  }),
}));

export const brandAssetsRelations = relations(brandAssets, ({ one }) => ({
  organization: one(organizations, {
    fields: [brandAssets.organizationId],
    references: [organizations.id],
  }),
}));

export const submissionsRelations = relations(submissions, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [submissions.organizationId],
    references: [organizations.id],
  }),
  creator: one(users, {
    fields: [submissions.creatorId],
    references: [users.id],
  }),
  currentVersion: one(submissionVersions, {
    fields: [submissions.currentVersionId],
    references: [submissionVersions.id],
  }),
  versions: many(submissionVersions),
  submissionVersions: many(submissionVersions),
  analysisRuns: many(analysisRuns),
  findings: many(findings),
  reviewComments: many(reviewComments),
  reviewEvents: many(reviewEvents),
}));

export const submissionVersionsRelations = relations(
  submissionVersions,
  ({ one, many }) => ({
    submission: one(submissions, {
      fields: [submissionVersions.submissionId],
      references: [submissions.id],
    }),
    createdBy: one(users, {
      fields: [submissionVersions.createdById],
      references: [users.id],
    }),
    analysisRuns: many(analysisRuns),
    reviewComments: many(reviewComments),
    reviewEvents: many(reviewEvents),
  }),
);

export const analysisRunsRelations = relations(
  analysisRuns,
  ({ one, many }) => ({
    submission: one(submissions, {
      fields: [analysisRuns.submissionId],
      references: [submissions.id],
    }),
    version: one(submissionVersions, {
      fields: [analysisRuns.versionId],
      references: [submissionVersions.id],
    }),
    findings: many(findings),
  }),
);

export const findingsRelations = relations(findings, ({ one, many }) => ({
  analysisRun: one(analysisRuns, {
    fields: [findings.analysisRunId],
    references: [analysisRuns.id],
  }),
  submission: one(submissions, {
    fields: [findings.submissionId],
    references: [submissions.id],
  }),
  sourceGuideline: one(brandGuidelines, {
    fields: [findings.sourceGuidelineId],
    references: [brandGuidelines.id],
  }),
  sourceRule: one(brandRules, {
    fields: [findings.sourceRuleId],
    references: [brandRules.id],
  }),
  approvedFact: one(approvedFacts, {
    fields: [findings.approvedFactId],
    references: [approvedFacts.id],
  }),
  reviewComments: many(reviewComments),
}));

export const reviewCommentsRelations = relations(
  reviewComments,
  ({ one }) => ({
    submission: one(submissions, {
      fields: [reviewComments.submissionId],
      references: [submissions.id],
    }),
    author: one(users, {
      fields: [reviewComments.authorId],
      references: [users.id],
    }),
    version: one(submissionVersions, {
      fields: [reviewComments.versionId],
      references: [submissionVersions.id],
    }),
    finding: one(findings, {
      fields: [reviewComments.findingId],
      references: [findings.id],
    }),
  }),
);

export const reviewEventsRelations = relations(reviewEvents, ({ one }) => ({
  submission: one(submissions, {
    fields: [reviewEvents.submissionId],
    references: [submissions.id],
  }),
  actor: one(users, {
    fields: [reviewEvents.actorId],
    references: [users.id],
  }),
  version: one(submissionVersions, {
    fields: [reviewEvents.versionId],
    references: [submissionVersions.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  organization: one(organizations, {
    fields: [auditLogs.organizationId],
    references: [organizations.id],
  }),
}));

// ============================================================================
// INFERRED TYPES
// ============================================================================

export type Organization = InferSelectModel<typeof organizations>;
export type NewOrganization = InferInsertModel<typeof organizations>;

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type Session = InferSelectModel<typeof sessions>;
export type NewSession = InferInsertModel<typeof sessions>;

export type Account = InferSelectModel<typeof accounts>;
export type NewAccount = InferInsertModel<typeof accounts>;

export type Verification = InferSelectModel<typeof verifications>;
export type NewVerification = InferInsertModel<typeof verifications>;

export type Membership = InferSelectModel<typeof memberships>;
export type NewMembership = InferInsertModel<typeof memberships>;

export type BrandGuideline = InferSelectModel<typeof brandGuidelines>;
export type NewBrandGuideline = InferInsertModel<typeof brandGuidelines>;

export type BrandRule = InferSelectModel<typeof brandRules>;
export type NewBrandRule = InferInsertModel<typeof brandRules>;

export type ApprovedFact = InferSelectModel<typeof approvedFacts>;
export type NewApprovedFact = InferInsertModel<typeof approvedFacts>;

export type BrandTerm = InferSelectModel<typeof brandTerms>;
export type NewBrandTerm = InferInsertModel<typeof brandTerms>;

export type BrandAsset = InferSelectModel<typeof brandAssets>;
export type NewBrandAsset = InferInsertModel<typeof brandAssets>;

export type Submission = InferSelectModel<typeof submissions>;
export type NewSubmission = InferInsertModel<typeof submissions>;

export type SubmissionVersion = InferSelectModel<typeof submissionVersions>;
export type NewSubmissionVersion = InferInsertModel<typeof submissionVersions>;

export type AnalysisRun = InferSelectModel<typeof analysisRuns>;
export type NewAnalysisRun = InferInsertModel<typeof analysisRuns>;

export type Finding = InferSelectModel<typeof findings>;
export type NewFinding = InferInsertModel<typeof findings>;

export type ReviewComment = InferSelectModel<typeof reviewComments>;
export type NewReviewComment = InferInsertModel<typeof reviewComments>;

export type ReviewEvent = InferSelectModel<typeof reviewEvents>;
export type NewReviewEvent = InferInsertModel<typeof reviewEvents>;

export type AuditLog = InferSelectModel<typeof auditLogs>;
export type NewAuditLog = InferInsertModel<typeof auditLogs>;

// Enum types
export type MembershipRole = (typeof membershipRoleEnum.enumValues)[number];
export type RuleType = (typeof ruleTypeEnum.enumValues)[number];
export type RuleSeverity = (typeof ruleSeverityEnum.enumValues)[number];
export type TermType = (typeof termTypeEnum.enumValues)[number];
export type AssetType = (typeof assetTypeEnum.enumValues)[number];
export type SubmissionContentType = (typeof submissionContentTypeEnum.enumValues)[number];
export type SubmissionStatus = (typeof submissionStatusEnum.enumValues)[number];
export type AnalysisStatus = (typeof analysisStatusEnum.enumValues)[number];
export type FindingLayer = (typeof findingLayerEnum.enumValues)[number];
export type FindingCategory = (typeof findingCategoryEnum.enumValues)[number];
export type FindingSeverity = (typeof findingSeverityEnum.enumValues)[number];
export type FindingStatus = (typeof findingStatusEnum.enumValues)[number];
export type ReviewEventType = (typeof reviewEventTypeEnum.enumValues)[number];
export type ActorType = (typeof actorTypeEnum.enumValues)[number];
