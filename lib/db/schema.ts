import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  real,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  googleSub: varchar('google_sub', { length: 255 }).unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('member'),
  is18PlusConfirmed: boolean('is_18plus_confirmed').notNull().default(false),
  country: varchar('country', { length: 100 }).notNull().default('US'),
  timezone: varchar('timezone', { length: 100 })
    .notNull()
    .default('America/Los_Angeles'),
  locale: varchar('locale', { length: 20 }).notNull().default('en-US'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripeProductId: text('stripe_product_id'),
  planName: varchar('plan_name', { length: 50 }),
  subscriptionStatus: varchar('subscription_status', { length: 20 }),
});

export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  role: varchar('role', { length: 50 }).notNull(),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
});

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  invitedBy: integer('invited_by')
    .notNull()
    .references(() => users.id),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
});

export const children = pgTable('children', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  nickname: varchar('nickname', { length: 100 }).notNull(),
  grade: varchar('grade', { length: 50 }).notNull(),
  curriculum: varchar('curriculum', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const childNotes = pgTable('child_notes', {
  id: serial('id').primaryKey(),
  childId: integer('child_id')
    .notNull()
    .references(() => children.id)
    .unique(),
  parentNote: text('parent_note'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const uploads = pgTable('uploads', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  childId: integer('child_id')
    .notNull()
    .references(() => children.id),
  sourceType: varchar('source_type', { length: 50 }).notNull(),
  notes: text('notes'),
  diagnosticGoal: text('diagnostic_goal'),
  recentTrend: text('recent_trend'),
  parentConcernJson: jsonb('parent_concern_json')
    .$type<string[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),
  teacherFeedbackPresent: boolean('teacher_feedback_present')
    .notNull()
    .default(false),
  hasTutor: boolean('has_tutor').notNull().default(false),
  intakeCompletedAt: timestamp('intake_completed_at'),
  totalPages: integer('total_pages').notNull().default(0),
  status: varchar('status', { length: 30 }).notNull().default('draft'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  submittedAt: timestamp('submitted_at'),
});

export const uploadFiles = pgTable('upload_files', {
  id: serial('id').primaryKey(),
  uploadId: integer('upload_id')
    .notNull()
    .references(() => uploads.id),
  originalName: varchar('original_name', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 120 }).notNull(),
  sizeBytes: integer('size_bytes').notNull().default(0),
  storagePath: text('storage_path').notNull(),
  pageCount: integer('page_count').notNull().default(1),
  previewKind: varchar('preview_kind', { length: 20 }).notNull().default('image'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const pages = pgTable('pages', {
  id: serial('id').primaryKey(),
  uploadId: integer('upload_id')
    .notNull()
    .references(() => uploads.id),
  uploadFileId: integer('upload_file_id')
    .notNull()
    .references(() => uploadFiles.id),
  pageNumber: integer('page_number').notNull(),
  sourceName: varchar('source_name', { length: 255 }).notNull(),
  storagePath: text('storage_path').notNull(),
  previewLabel: varchar('preview_label', { length: 255 }).notNull(),
  isBlurry: boolean('is_blurry').notNull().default(false),
  isRotated: boolean('is_rotated').notNull().default(false),
  isDark: boolean('is_dark').notNull().default(false),
  qualityScore: integer('quality_score').notNull().default(100),
  qualityFlags: jsonb('quality_flags')
    .$type<Record<string, boolean | number | string>>()
    .notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const analysisRuns = pgTable('analysis_runs', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  childId: integer('child_id')
    .notNull()
    .references(() => children.id),
  uploadId: integer('upload_id')
    .notNull()
    .references(() => uploads.id),
  status: varchar('status', { length: 30 }).notNull().default('queued'),
  stage: varchar('stage', { length: 40 }).notNull().default('queued'),
  progressPercent: integer('progress_percent').notNull().default(0),
  estimatedMinutes: integer('estimated_minutes').notNull().default(4),
  statusMessage: text('status_message'),
  overallConfidence: real('overall_confidence'),
  needsReviewReason: text('needs_review_reason'),
  errorMessage: text('error_message'),
  deckId: integer('deck_id'),
  deckGenerationStatus: varchar('deck_generation_status', { length: 30 })
    .notNull()
    .default('idle'),
  deckReviewStatus: varchar('deck_review_status', { length: 30 })
    .notNull()
    .default('not_requested'),
  deckExportStatus: varchar('deck_export_status', { length: 30 })
    .notNull()
    .default('idle'),
  startedAt: timestamp('started_at'),
  finishedAt: timestamp('finished_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const reports = pgTable('reports', {
  id: serial('id').primaryKey(),
  runId: integer('run_id')
    .notNull()
    .references(() => analysisRuns.id),
  parentReportJson: jsonb('parent_report_json')
    .$type<Record<string, unknown>>()
    .notNull(),
  studentReportJson: jsonb('student_report_json')
    .$type<Record<string, unknown>>()
    .notNull(),
  tutorReportJson: jsonb('tutor_report_json')
    .$type<Record<string, unknown>>()
    .notNull(),
  deckId: integer('deck_id'),
  deckStatus: varchar('deck_status', { length: 30 }).notNull().default('idle'),
  deckTier: varchar('deck_tier', { length: 20 }).notNull().default('pending'),
  walkthroughVisibility: varchar('walkthrough_visibility', { length: 30 })
    .notNull()
    .default('hidden'),
  voiceGuidanceDefault: boolean('voice_guidance_default')
    .notNull()
    .default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const reportDiagnosisOutlines = pgTable('report_diagnosis_outlines', {
  id: serial('id').primaryKey(),
  reportId: integer('report_id')
    .notNull()
    .references(() => reports.id)
    .unique(),
  summary: text('summary').notNull(),
  primaryIssue: text('primary_issue').notNull(),
  secondaryIssue: text('secondary_issue').notNull(),
  doThisWeek: text('do_this_week').notNull(),
  notNow: text('not_now').notNull(),
  guardrail: text('guardrail').notNull(),
  confidence: real('confidence').notNull(),
  locale: varchar('locale', { length: 20 }).notNull().default('en-US'),
  sourceMetaJson: jsonb('source_meta_json')
    .$type<Record<string, unknown>>()
    .notNull()
    .default(sql`'{}'::jsonb`),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const reportShortestPaths = pgTable('report_shortest_paths', {
  id: serial('id').primaryKey(),
  reportId: integer('report_id')
    .notNull()
    .references(() => reports.id)
    .unique(),
  currentNode: text('current_node').notNull(),
  nextNode: text('next_node').notNull(),
  laterNodesJson: jsonb('later_nodes_json')
    .$type<Record<string, unknown>[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),
  whyFirst: text('why_first').notNull(),
  whatThisSolves: text('what_this_solves').notNull(),
  whatWaits: text('what_waits').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const reportOutputGates = pgTable('report_output_gates', {
  id: serial('id').primaryKey(),
  reportId: integer('report_id')
    .notNull()
    .references(() => reports.id),
  gateCode: varchar('gate_code', { length: 80 }).notNull(),
  title: text('title').notNull(),
  status: varchar('status', { length: 40 }).notNull(),
  body: text('body').notNull(),
  whatThisVerifies: text('what_this_verifies').notNull(),
  howToCheck: text('how_to_check').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const reportSevenDayPlans = pgTable('report_seven_day_plans', {
  id: serial('id').primaryKey(),
  reportId: integer('report_id')
    .notNull()
    .references(() => reports.id),
  dayNumber: integer('day_number').notNull(),
  goal: text('goal').notNull(),
  practice: text('practice').notNull(),
  parentPrompt: text('parent_prompt').notNull(),
  successSignal: text('success_signal').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const reportCompareSnapshots = pgTable('report_compare_snapshots', {
  id: serial('id').primaryKey(),
  reportId: integer('report_id')
    .notNull()
    .references(() => reports.id)
    .unique(),
  improved: text('improved').notNull(),
  stillUneven: text('still_uneven').notNull(),
  needsSupport: text('needs_support').notNull(),
  trendPointsJson: jsonb('trend_points_json')
    .$type<number[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),
  resumeDecision: text('resume_decision').notNull(),
  nextSuggestedFocus: text('next_suggested_focus').notNull(),
  compareSummary: text('compare_summary').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const reportShareArtifacts = pgTable('report_share_artifacts', {
  id: serial('id').primaryKey(),
  reportId: integer('report_id')
    .notNull()
    .references(() => reports.id)
    .unique(),
  shareSummary: text('share_summary').notNull(),
  tutorSummary: text('tutor_summary').notNull(),
  resumeCallToAction: text('resume_call_to_action').notNull(),
  artifactJson: jsonb('artifact_json')
    .$type<Record<string, unknown>>()
    .notNull()
    .default(sql`'{}'::jsonb`),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const reportReviewSnapshots = pgTable('report_review_snapshots', {
  id: serial('id').primaryKey(),
  reportId: integer('report_id')
    .notNull()
    .references(() => reports.id)
    .unique(),
  releaseStatus: varchar('release_status', { length: 40 }).notNull(),
  reviewReason: text('review_reason'),
  reviewBanner: text('review_banner'),
  qualityFlagsJson: jsonb('quality_flags_json')
    .$type<Record<string, unknown>>()
    .notNull()
    .default(sql`'{}'::jsonb`),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const diagnosisDecks = pgTable('diagnosis_decks', {
  id: serial('id').primaryKey(),
  runId: integer('run_id')
    .notNull()
    .references(() => analysisRuns.id),
  reportId: integer('report_id')
    .notNull()
    .references(() => reports.id),
  status: varchar('status', { length: 30 }).notNull().default('draft'),
  tier: varchar('tier', { length: 20 }).notNull().default('pending'),
  reviewStatus: varchar('review_status', { length: 30 })
    .notNull()
    .default('pending'),
  walkthroughVisibility: varchar('walkthrough_visibility', { length: 30 })
    .notNull()
    .default('hidden'),
  voiceGuidanceDefault: boolean('voice_guidance_default')
    .notNull()
    .default(false),
  qualityScore: real('quality_score'),
  qualitySummary: jsonb('quality_summary')
    .$type<Record<string, unknown>>()
    .notNull()
    .default(sql`'{}'::jsonb`),
  sourceFacts: jsonb('source_facts')
    .$type<Record<string, unknown>>()
    .notNull()
    .default(sql`'{}'::jsonb`),
  title: text('title').notNull(),
  generatedAt: timestamp('generated_at'),
  approvedAt: timestamp('approved_at'),
  rejectedAt: timestamp('rejected_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const diagnosisSlides = pgTable('diagnosis_slides', {
  id: serial('id').primaryKey(),
  deckId: integer('deck_id')
    .notNull()
    .references(() => diagnosisDecks.id),
  slideIndex: integer('slide_index').notNull(),
  slideType: varchar('slide_type', { length: 50 }).notNull(),
  title: text('title').notNull(),
  body: jsonb('body')
    .$type<Record<string, unknown>>()
    .notNull()
    .default(sql`'{}'::jsonb`),
  notes: jsonb('notes')
    .$type<Record<string, unknown>>()
    .notNull()
    .default(sql`'{}'::jsonb`),
  status: varchar('status', { length: 30 }).notNull().default('draft'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const diagnosisSlideActions = pgTable('diagnosis_slide_actions', {
  id: serial('id').primaryKey(),
  deckId: integer('deck_id')
    .notNull()
    .references(() => diagnosisDecks.id),
  slideId: integer('slide_id')
    .notNull()
    .references(() => diagnosisSlides.id),
  actionIndex: integer('action_index').notNull(),
  actionType: varchar('action_type', { length: 50 }).notNull(),
  referenceKey: varchar('reference_key', { length: 120 }),
  payload: jsonb('payload')
    .$type<Record<string, unknown>>()
    .notNull()
    .default(sql`'{}'::jsonb`),
  narrationText: text('narration_text').notNull().default(''),
  autoplay: boolean('autoplay').notNull().default(false),
  status: varchar('status', { length: 30 }).notNull().default('draft'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const deckExports = pgTable('deck_exports', {
  id: serial('id').primaryKey(),
  deckId: integer('deck_id')
    .notNull()
    .references(() => diagnosisDecks.id),
  format: varchar('format', { length: 20 }).notNull(),
  status: varchar('status', { length: 30 }).notNull().default('queued'),
  artifactPath: text('artifact_path'),
  metadata: jsonb('metadata')
    .$type<Record<string, unknown>>()
    .notNull()
    .default(sql`'{}'::jsonb`),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const deckShareSettings = pgTable('deck_share_settings', {
  id: serial('id').primaryKey(),
  deckId: integer('deck_id')
    .notNull()
    .references(() => diagnosisDecks.id),
  reportId: integer('report_id')
    .notNull()
    .references(() => reports.id),
  allowParentPlayback: boolean('allow_parent_playback')
    .notNull()
    .default(false),
  allowSharePlayback: boolean('allow_share_playback')
    .notNull()
    .default(false),
  defaultVoiceEnabled: boolean('default_voice_enabled')
    .notNull()
    .default(false),
  maxAutoplayTier: varchar('max_autoplay_tier', { length: 20 })
    .notNull()
    .default('B'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const deckPlaybackSnapshots = pgTable('deck_playback_snapshots', {
  id: serial('id').primaryKey(),
  deckId: integer('deck_id')
    .notNull()
    .references(() => diagnosisDecks.id),
  userId: integer('user_id').references(() => users.id),
  shareToken: varchar('share_token', { length: 120 }),
  currentSlideIndex: integer('current_slide_index').notNull().default(0),
  currentActionIndex: integer('current_action_index').notNull().default(0),
  playbackState: varchar('playback_state', { length: 20 })
    .notNull()
    .default('idle'),
  voiceEnabled: boolean('voice_enabled').notNull().default(false),
  snapshotJson: jsonb('snapshot_json')
    .$type<Record<string, unknown>>()
    .notNull()
    .default(sql`'{}'::jsonb`),
  restoredAt: timestamp('restored_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const problemItems = pgTable('problem_items', {
  id: serial('id').primaryKey(),
  runId: integer('run_id')
    .notNull()
    .references(() => analysisRuns.id),
  pageId: integer('page_id')
    .notNull()
    .references(() => pages.id),
  problemNo: varchar('problem_no', { length: 50 }).notNull(),
  problemText: text('problem_text'),
  studentWork: text('student_work'),
  teacherMark: varchar('teacher_mark', { length: 20 }).notNull().default('unknown'),
  modelIsCorrect: boolean('model_is_correct'),
  itemConfidence: real('item_confidence'),
  evidenceAnchor: jsonb('evidence_anchor')
    .$type<Record<string, unknown>>()
    .notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const errorLabels = pgTable('error_labels', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 80 }).notNull().unique(),
  displayName: varchar('display_name', { length: 120 }).notNull(),
  description: text('description').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const itemErrors = pgTable('item_errors', {
  id: serial('id').primaryKey(),
  itemId: integer('item_id')
    .notNull()
    .references(() => problemItems.id),
  labelId: integer('label_id')
    .notNull()
    .references(() => errorLabels.id),
  severity: varchar('severity', { length: 20 }).notNull().default('med'),
  rationale: text('rationale'),
  confidence: real('confidence'),
  isPrimary: boolean('is_primary').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const shareLinks = pgTable('share_links', {
  id: serial('id').primaryKey(),
  reportId: integer('report_id')
    .notNull()
    .references(() => reports.id),
  token: varchar('token', { length: 120 }).notNull().unique(),
  role: varchar('role', { length: 20 }).notNull().default('tutor'),
  expiresAt: timestamp('expires_at').notNull(),
  revokedAt: timestamp('revoked_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const reviewHistories = pgTable('review_histories', {
  id: serial('id').primaryKey(),
  childId: integer('child_id')
    .notNull()
    .references(() => children.id),
  runId: integer('run_id')
    .notNull()
    .references(() => analysisRuns.id),
  reportId: integer('report_id')
    .notNull()
    .references(() => reports.id)
    .unique(),
  primaryIssue: text('primary_issue').notNull(),
  secondaryIssue: text('secondary_issue'),
  compareSummary: text('compare_summary').notNull(),
  parentNote: text('parent_note'),
  completedDaysJson: jsonb('completed_days_json')
    .$type<number[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),
  snapshotJson: jsonb('snapshot_json')
    .$type<Record<string, unknown>>()
    .notNull()
    .default(sql`'{}'::jsonb`),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const issueTrends = pgTable('issue_trends', {
  id: serial('id').primaryKey(),
  childId: integer('child_id')
    .notNull()
    .references(() => children.id),
  issueCode: varchar('issue_code', { length: 80 }).notNull(),
  issueTitle: text('issue_title').notNull(),
  status: varchar('status', { length: 40 }).notNull().default('active'),
  trendDirection: varchar('trend_direction', { length: 40 }).notNull().default('new'),
  firstSeenReportId: integer('first_seen_report_id')
    .notNull()
    .references(() => reports.id),
  latestReportId: integer('latest_report_id')
    .notNull()
    .references(() => reports.id),
  occurrenceCount: integer('occurrence_count').notNull().default(1),
  summary: text('summary').notNull(),
  trendPointsJson: jsonb('trend_points_json')
    .$type<number[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const chatThreads = pgTable('chat_threads', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  childId: integer('child_id').references(() => children.id),
  relatedRunId: integer('related_run_id').references(() => analysisRuns.id),
  relatedReportId: integer('related_report_id').references(() => reports.id),
  title: varchar('title', { length: 160 }).notNull(),
  mode: varchar('mode', { length: 40 }).notNull().default('workspace'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  lastMessageAt: timestamp('last_message_at').notNull().defaultNow(),
});

export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  threadId: integer('thread_id')
    .notNull()
    .references(() => chatThreads.id),
  role: varchar('role', { length: 20 }).notNull(),
  body: text('body').notNull(),
  attachmentsJson: jsonb('attachments_json')
    .$type<Array<Record<string, unknown>>>()
    .notNull()
    .default(sql`'[]'::jsonb`),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const subscriptions = pgTable('subscriptions', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  provider: varchar('provider', { length: 20 }).notNull().default('stripe'),
  planType: varchar('plan_type', { length: 20 }).notNull(),
  priceId: varchar('price_id', { length: 120 }).notNull(),
  status: varchar('status', { length: 30 }).notNull().default('pending'),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  checkoutSessionId: text('checkout_session_id').unique(),
  reportCredits: integer('report_credits').notNull().default(0),
  unlockedReportIds: jsonb('unlocked_report_ids')
    .$type<number[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),
  currentPeriodEndsAt: timestamp('current_period_ends_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const billingEvents = pgTable('billing_events', {
  id: serial('id').primaryKey(),
  source: varchar('source', { length: 20 }).notNull().default('stripe'),
  eventId: varchar('event_id', { length: 150 }).notNull().unique(),
  eventType: varchar('event_type', { length: 120 }).notNull(),
  payload: jsonb('payload')
    .$type<Record<string, unknown>>()
    .notNull(),
  processedAt: timestamp('processed_at').notNull().defaultNow(),
});

export const billingProviderAccounts = pgTable('billing_provider_accounts', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  provider: varchar('provider', { length: 20 }).notNull(),
  providerCustomerId: text('provider_customer_id'),
  providerSubscriptionId: text('provider_subscription_id'),
  email: varchar('email', { length: 255 }),
  metadata: jsonb('metadata')
    .$type<Record<string, unknown>>()
    .notNull()
    .default(sql`'{}'::jsonb`),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const billingEntitlements = pgTable('billing_entitlements', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  provider: varchar('provider', { length: 20 }).notNull(),
  planType: varchar('plan_type', { length: 20 }).notNull(),
  priceId: varchar('price_id', { length: 120 }).notNull(),
  status: varchar('status', { length: 30 }).notNull().default('pending'),
  providerCustomerId: text('provider_customer_id'),
  providerSubscriptionId: text('provider_subscription_id'),
  checkoutSessionId: text('checkout_session_id'),
  reportCredits: integer('report_credits').notNull().default(0),
  unlockedReportIds: jsonb('unlocked_report_ids')
    .$type<number[]>()
    .notNull()
    .default(sql`'[]'::jsonb`),
  currentPeriodEndsAt: timestamp('current_period_ends_at'),
  legacySubscriptionId: integer('legacy_subscription_id').references(() => subscriptions.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const billingWebhookEvents = pgTable('billing_webhook_events', {
  id: serial('id').primaryKey(),
  provider: varchar('provider', { length: 20 }).notNull(),
  providerEventKey: varchar('provider_event_key', { length: 220 }).notNull().unique(),
  eventId: varchar('event_id', { length: 150 }).notNull(),
  eventType: varchar('event_type', { length: 120 }).notNull(),
  payload: jsonb('payload')
    .$type<Record<string, unknown>>()
    .notNull(),
  processedAt: timestamp('processed_at').notNull().defaultNow(),
});

// Runtime records now live in Neon on Vercel. The legacy local JSON stores remain
// as documented fallback paths only and are no longer the production source of truth.
export const reminderEvents = pgTable('reminder_events', {
  id: varchar('id', { length: 80 }).primaryKey(),
  kind: varchar('kind', { length: 40 }).notNull(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  reportId: integer('report_id').references(() => reports.id),
  childId: integer('child_id').references(() => children.id),
  deliveryChannel: varchar('delivery_channel', { length: 40 }).notNull(),
  status: varchar('status', { length: 30 }).notNull(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  metadata: jsonb('metadata')
    .$type<Record<string, unknown>>()
    .notNull()
    .default(sql`'{}'::jsonb`),
  dedupeKey: varchar('dedupe_key', { length: 200 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  scheduledFor: timestamp('scheduled_for').notNull().defaultNow(),
  attemptedAt: timestamp('attempted_at'),
});

export const runLifecycleEvents = pgTable('run_lifecycle_events', {
  id: varchar('id', { length: 80 }).primaryKey(),
  runId: integer('run_id')
    .notNull()
    .references(() => analysisRuns.id),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  childId: integer('child_id').references(() => children.id),
  uploadId: integer('upload_id').references(() => uploads.id),
  eventType: varchar('event_type', { length: 40 }).notNull(),
  status: varchar('status', { length: 30 }).notNull(),
  stage: varchar('stage', { length: 40 }).notNull(),
  message: text('message').notNull(),
  metadata: jsonb('metadata')
    .$type<Record<string, unknown>>()
    .notNull()
    .default(sql`'{}'::jsonb`),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const runErrorEvents = pgTable('run_error_events', {
  id: varchar('id', { length: 80 }).primaryKey(),
  runId: integer('run_id')
    .notNull()
    .references(() => analysisRuns.id),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  errorType: varchar('error_type', { length: 40 }).notNull(),
  message: text('message').notNull(),
  metadata: jsonb('metadata')
    .$type<Record<string, unknown>>()
    .notNull()
    .default(sql`'{}'::jsonb`),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const runCostArtifacts = pgTable('run_cost_artifacts', {
  id: varchar('id', { length: 80 }).primaryKey(),
  runId: integer('run_id')
    .notNull()
    .references(() => analysisRuns.id)
    .unique(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  engine: varchar('engine', { length: 20 }).notNull(),
  pageCount: integer('page_count').notNull().default(0),
  labeledItemCount: integer('labeled_item_count').notNull().default(0),
  estimatedInputTokens: integer('estimated_input_tokens').notNull().default(0),
  estimatedOutputTokens: integer('estimated_output_tokens').notNull().default(0),
  estimatedUsd: real('estimated_usd').notNull().default(0),
  status: varchar('status', { length: 30 }).notNull(),
  artifactPath: text('artifact_path'),
  metadata: jsonb('metadata')
    .$type<Record<string, unknown>>()
    .notNull()
    .default(sql`'{}'::jsonb`),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const modelProviderConfigs = pgTable('model_provider_configs', {
  id: serial('id').primaryKey(),
  providerName: varchar('provider_name', { length: 40 }).notNull().unique(),
  isEnabled: boolean('is_enabled').notNull().default(true),
  defaultModel: varchar('default_model', { length: 160 }).notNull(),
  baseUrl: text('base_url').notNull(),
  timeoutMs: integer('timeout_ms').notNull().default(30000),
  maxRetries: integer('max_retries').notNull().default(1),
  supportsJsonSchema: boolean('supports_json_schema').notNull().default(true),
  supportsReasoning: boolean('supports_reasoning').notNull().default(false),
  supportsTools: boolean('supports_tools').notNull().default(false),
  metadata: jsonb('metadata')
    .$type<Record<string, unknown>>()
    .notNull()
    .default(sql`'{}'::jsonb`),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const analysisRunModels = pgTable('analysis_run_models', {
  id: varchar('id', { length: 80 }).primaryKey(),
  runId: integer('run_id')
    .notNull()
    .references(() => analysisRuns.id),
  providerConfigId: integer('provider_config_id').references(() => modelProviderConfigs.id),
  taskType: varchar('task_type', { length: 40 }).notNull(),
  attemptIndex: integer('attempt_index').notNull().default(0),
  providerName: varchar('provider_name', { length: 40 }).notNull(),
  modelName: varchar('model_name', { length: 160 }).notNull(),
  status: varchar('status', { length: 30 }).notNull(),
  finishReason: varchar('finish_reason', { length: 40 }),
  latencyMs: integer('latency_ms'),
  inputTokens: integer('input_tokens'),
  outputTokens: integer('output_tokens'),
  reasoningTokens: integer('reasoning_tokens'),
  totalTokens: integer('total_tokens'),
  metadata: jsonb('metadata')
    .$type<Record<string, unknown>>()
    .notNull()
    .default(sql`'{}'::jsonb`),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const evidenceAnchors = pgTable('evidence_anchors', {
  id: serial('id').primaryKey(),
  problemItemId: integer('problem_item_id')
    .notNull()
    .references(() => problemItems.id),
  pageId: integer('page_id')
    .notNull()
    .references(() => pages.id),
  pageNo: integer('page_no').notNull(),
  problemNo: varchar('problem_no', { length: 50 }).notNull(),
  previewLabel: varchar('preview_label', { length: 255 }).notNull(),
  highlightBoxJson: jsonb('highlight_box_json')
    .$type<Record<string, unknown>>()
    .notNull()
    .default(sql`'{}'::jsonb`),
  anchorKind: varchar('anchor_kind', { length: 40 }).notNull().default('problem'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const modelCallFailovers = pgTable('model_call_failovers', {
  id: varchar('id', { length: 80 }).primaryKey(),
  runId: integer('run_id')
    .notNull()
    .references(() => analysisRuns.id),
  taskType: varchar('task_type', { length: 40 }).notNull(),
  fromRunModelId: varchar('from_run_model_id', { length: 80 }).references(() => analysisRunModels.id),
  fromProviderName: varchar('from_provider_name', { length: 40 }).notNull(),
  fromModelName: varchar('from_model_name', { length: 160 }).notNull(),
  toProviderName: varchar('to_provider_name', { length: 40 }).notNull(),
  toModelName: varchar('to_model_name', { length: 160 }).notNull(),
  errorType: varchar('error_type', { length: 80 }),
  errorMessage: text('error_message'),
  metadata: jsonb('metadata')
    .$type<Record<string, unknown>>()
    .notNull()
    .default(sql`'{}'::jsonb`),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
  subscriptions: many(subscriptions),
}));

export const usersRelations = relations(users, ({ many }) => ({
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations),
  children: many(children),
  uploads: many(uploads),
  analysisRuns: many(analysisRuns),
  subscriptions: many(subscriptions),
  deckPlaybackSnapshots: many(deckPlaybackSnapshots),
  chatThreads: many(chatThreads),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
  invitedBy: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
  }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  team: one(teams, {
    fields: [activityLogs.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export const childrenRelations = relations(children, ({ one, many }) => ({
  user: one(users, {
    fields: [children.userId],
    references: [users.id],
  }),
  childNote: one(childNotes, {
    fields: [children.id],
    references: [childNotes.childId],
  }),
  reviewHistories: many(reviewHistories),
  issueTrends: many(issueTrends),
  chatThreads: many(chatThreads),
}));

export const childNotesRelations = relations(childNotes, ({ one }) => ({
  child: one(children, {
    fields: [childNotes.childId],
    references: [children.id],
  }),
}));

export const uploadsRelations = relations(uploads, ({ one, many }) => ({
  user: one(users, {
    fields: [uploads.userId],
    references: [users.id],
  }),
  child: one(children, {
    fields: [uploads.childId],
    references: [children.id],
  }),
  files: many(uploadFiles),
  pages: many(pages),
  runs: many(analysisRuns),
}));

export const uploadFilesRelations = relations(uploadFiles, ({ one, many }) => ({
  upload: one(uploads, {
    fields: [uploadFiles.uploadId],
    references: [uploads.id],
  }),
  pages: many(pages),
}));

export const pagesRelations = relations(pages, ({ one, many }) => ({
  upload: one(uploads, {
    fields: [pages.uploadId],
    references: [uploads.id],
  }),
  uploadFile: one(uploadFiles, {
    fields: [pages.uploadFileId],
    references: [uploadFiles.id],
  }),
  evidenceAnchors: many(evidenceAnchors),
}));

export const analysisRunsRelations = relations(analysisRuns, ({ one, many }) => ({
  user: one(users, {
    fields: [analysisRuns.userId],
    references: [users.id],
  }),
  child: one(children, {
    fields: [analysisRuns.childId],
    references: [children.id],
  }),
  upload: one(uploads, {
    fields: [analysisRuns.uploadId],
    references: [uploads.id],
  }),
  reports: many(reports),
  diagnosisDecks: many(diagnosisDecks),
  problemItems: many(problemItems),
  reviewHistories: many(reviewHistories),
}));

export const reportsRelations = relations(reports, ({ one, many }) => ({
  run: one(analysisRuns, {
    fields: [reports.runId],
    references: [analysisRuns.id],
  }),
  shareLinks: many(shareLinks),
  diagnosisDecks: many(diagnosisDecks),
  deckShareSettings: many(deckShareSettings),
  diagnosisOutline: one(reportDiagnosisOutlines, {
    fields: [reports.id],
    references: [reportDiagnosisOutlines.reportId],
  }),
  shortestPath: one(reportShortestPaths, {
    fields: [reports.id],
    references: [reportShortestPaths.reportId],
  }),
  outputGates: many(reportOutputGates),
  sevenDayPlans: many(reportSevenDayPlans),
  compareSnapshot: one(reportCompareSnapshots, {
    fields: [reports.id],
    references: [reportCompareSnapshots.reportId],
  }),
  shareArtifact: one(reportShareArtifacts, {
    fields: [reports.id],
    references: [reportShareArtifacts.reportId],
  }),
  reviewSnapshot: one(reportReviewSnapshots, {
    fields: [reports.id],
    references: [reportReviewSnapshots.reportId],
  }),
  reviewHistories: many(reviewHistories),
}));

export const reportDiagnosisOutlinesRelations = relations(
  reportDiagnosisOutlines,
  ({ one }) => ({
    report: one(reports, {
      fields: [reportDiagnosisOutlines.reportId],
      references: [reports.id],
    }),
  })
);

export const reportShortestPathsRelations = relations(reportShortestPaths, ({ one }) => ({
  report: one(reports, {
    fields: [reportShortestPaths.reportId],
    references: [reports.id],
  }),
}));

export const reportOutputGatesRelations = relations(reportOutputGates, ({ one }) => ({
  report: one(reports, {
    fields: [reportOutputGates.reportId],
    references: [reports.id],
  }),
}));

export const reportSevenDayPlansRelations = relations(reportSevenDayPlans, ({ one }) => ({
  report: one(reports, {
    fields: [reportSevenDayPlans.reportId],
    references: [reports.id],
  }),
}));

export const reportCompareSnapshotsRelations = relations(
  reportCompareSnapshots,
  ({ one }) => ({
    report: one(reports, {
      fields: [reportCompareSnapshots.reportId],
      references: [reports.id],
    }),
  })
);

export const reportShareArtifactsRelations = relations(reportShareArtifacts, ({ one }) => ({
  report: one(reports, {
    fields: [reportShareArtifacts.reportId],
    references: [reports.id],
  }),
}));

export const reportReviewSnapshotsRelations = relations(reportReviewSnapshots, ({ one }) => ({
  report: one(reports, {
    fields: [reportReviewSnapshots.reportId],
    references: [reports.id],
  }),
}));

export const diagnosisDecksRelations = relations(diagnosisDecks, ({ one, many }) => ({
  run: one(analysisRuns, {
    fields: [diagnosisDecks.runId],
    references: [analysisRuns.id],
  }),
  report: one(reports, {
    fields: [diagnosisDecks.reportId],
    references: [reports.id],
  }),
  slides: many(diagnosisSlides),
  actions: many(diagnosisSlideActions),
  exports: many(deckExports),
  shareSettings: many(deckShareSettings),
  playbackSnapshots: many(deckPlaybackSnapshots),
}));

export const diagnosisSlidesRelations = relations(diagnosisSlides, ({ one, many }) => ({
  deck: one(diagnosisDecks, {
    fields: [diagnosisSlides.deckId],
    references: [diagnosisDecks.id],
  }),
  actions: many(diagnosisSlideActions),
}));

export const diagnosisSlideActionsRelations = relations(
  diagnosisSlideActions,
  ({ one }) => ({
    deck: one(diagnosisDecks, {
      fields: [diagnosisSlideActions.deckId],
      references: [diagnosisDecks.id],
    }),
    slide: one(diagnosisSlides, {
      fields: [diagnosisSlideActions.slideId],
      references: [diagnosisSlides.id],
    }),
  })
);

export const deckExportsRelations = relations(deckExports, ({ one }) => ({
  deck: one(diagnosisDecks, {
    fields: [deckExports.deckId],
    references: [diagnosisDecks.id],
  }),
}));

export const deckShareSettingsRelations = relations(deckShareSettings, ({ one }) => ({
  deck: one(diagnosisDecks, {
    fields: [deckShareSettings.deckId],
    references: [diagnosisDecks.id],
  }),
  report: one(reports, {
    fields: [deckShareSettings.reportId],
    references: [reports.id],
  }),
}));

export const deckPlaybackSnapshotsRelations = relations(
  deckPlaybackSnapshots,
  ({ one }) => ({
    deck: one(diagnosisDecks, {
      fields: [deckPlaybackSnapshots.deckId],
      references: [diagnosisDecks.id],
    }),
    user: one(users, {
      fields: [deckPlaybackSnapshots.userId],
      references: [users.id],
    }),
  })
);

export const problemItemsRelations = relations(problemItems, ({ one, many }) => ({
  run: one(analysisRuns, {
    fields: [problemItems.runId],
    references: [analysisRuns.id],
  }),
  page: one(pages, {
    fields: [problemItems.pageId],
    references: [pages.id],
  }),
  evidenceAnchors: many(evidenceAnchors),
  itemErrors: many(itemErrors),
}));

export const evidenceAnchorsRelations = relations(evidenceAnchors, ({ one }) => ({
  item: one(problemItems, {
    fields: [evidenceAnchors.problemItemId],
    references: [problemItems.id],
  }),
  page: one(pages, {
    fields: [evidenceAnchors.pageId],
    references: [pages.id],
  }),
}));

export const errorLabelsRelations = relations(errorLabels, ({ many }) => ({
  itemErrors: many(itemErrors),
}));

export const itemErrorsRelations = relations(itemErrors, ({ one }) => ({
  item: one(problemItems, {
    fields: [itemErrors.itemId],
    references: [problemItems.id],
  }),
  label: one(errorLabels, {
    fields: [itemErrors.labelId],
    references: [errorLabels.id],
  }),
}));

export const shareLinksRelations = relations(shareLinks, ({ one }) => ({
  report: one(reports, {
    fields: [shareLinks.reportId],
    references: [reports.id],
  }),
}));

export const reviewHistoriesRelations = relations(reviewHistories, ({ one }) => ({
  child: one(children, {
    fields: [reviewHistories.childId],
    references: [children.id],
  }),
  run: one(analysisRuns, {
    fields: [reviewHistories.runId],
    references: [analysisRuns.id],
  }),
  report: one(reports, {
    fields: [reviewHistories.reportId],
    references: [reports.id],
  }),
}));

export const issueTrendsRelations = relations(issueTrends, ({ one }) => ({
  child: one(children, {
    fields: [issueTrends.childId],
    references: [children.id],
  }),
  firstSeenReport: one(reports, {
    fields: [issueTrends.firstSeenReportId],
    references: [reports.id],
  }),
  latestReport: one(reports, {
    fields: [issueTrends.latestReportId],
    references: [reports.id],
  }),
}));

export const chatThreadsRelations = relations(chatThreads, ({ one, many }) => ({
  user: one(users, {
    fields: [chatThreads.userId],
    references: [users.id],
  }),
  child: one(children, {
    fields: [chatThreads.childId],
    references: [children.id],
  }),
  run: one(analysisRuns, {
    fields: [chatThreads.relatedRunId],
    references: [analysisRuns.id],
  }),
  report: one(reports, {
    fields: [chatThreads.relatedReportId],
    references: [reports.id],
  }),
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  thread: one(chatThreads, {
    fields: [chatMessages.threadId],
    references: [chatThreads.id],
  }),
}));

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  team: one(teams, {
    fields: [subscriptions.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
export type Child = typeof children.$inferSelect;
export type NewChild = typeof children.$inferInsert;
export type ChildNote = typeof childNotes.$inferSelect;
export type NewChildNote = typeof childNotes.$inferInsert;
export type Upload = typeof uploads.$inferSelect;
export type NewUpload = typeof uploads.$inferInsert;
export type UploadFile = typeof uploadFiles.$inferSelect;
export type NewUploadFile = typeof uploadFiles.$inferInsert;
export type Page = typeof pages.$inferSelect;
export type NewPage = typeof pages.$inferInsert;
export type AnalysisRun = typeof analysisRuns.$inferSelect;
export type NewAnalysisRun = typeof analysisRuns.$inferInsert;
export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;
export type ReportDiagnosisOutline = typeof reportDiagnosisOutlines.$inferSelect;
export type NewReportDiagnosisOutline = typeof reportDiagnosisOutlines.$inferInsert;
export type ReportShortestPath = typeof reportShortestPaths.$inferSelect;
export type NewReportShortestPath = typeof reportShortestPaths.$inferInsert;
export type ReportOutputGate = typeof reportOutputGates.$inferSelect;
export type NewReportOutputGate = typeof reportOutputGates.$inferInsert;
export type ReportSevenDayPlan = typeof reportSevenDayPlans.$inferSelect;
export type NewReportSevenDayPlan = typeof reportSevenDayPlans.$inferInsert;
export type ReportCompareSnapshot = typeof reportCompareSnapshots.$inferSelect;
export type NewReportCompareSnapshot = typeof reportCompareSnapshots.$inferInsert;
export type ReportShareArtifact = typeof reportShareArtifacts.$inferSelect;
export type NewReportShareArtifact = typeof reportShareArtifacts.$inferInsert;
export type ReportReviewSnapshot = typeof reportReviewSnapshots.$inferSelect;
export type NewReportReviewSnapshot = typeof reportReviewSnapshots.$inferInsert;
export type DiagnosisDeck = typeof diagnosisDecks.$inferSelect;
export type NewDiagnosisDeck = typeof diagnosisDecks.$inferInsert;
export type DiagnosisSlide = typeof diagnosisSlides.$inferSelect;
export type NewDiagnosisSlide = typeof diagnosisSlides.$inferInsert;
export type DiagnosisSlideAction = typeof diagnosisSlideActions.$inferSelect;
export type NewDiagnosisSlideAction = typeof diagnosisSlideActions.$inferInsert;
export type DeckExport = typeof deckExports.$inferSelect;
export type NewDeckExport = typeof deckExports.$inferInsert;
export type DeckShareSetting = typeof deckShareSettings.$inferSelect;
export type NewDeckShareSetting = typeof deckShareSettings.$inferInsert;
export type DeckPlaybackSnapshot = typeof deckPlaybackSnapshots.$inferSelect;
export type NewDeckPlaybackSnapshot = typeof deckPlaybackSnapshots.$inferInsert;
export type ProblemItem = typeof problemItems.$inferSelect;
export type NewProblemItem = typeof problemItems.$inferInsert;
export type EvidenceAnchor = typeof evidenceAnchors.$inferSelect;
export type NewEvidenceAnchor = typeof evidenceAnchors.$inferInsert;
export type ErrorLabel = typeof errorLabels.$inferSelect;
export type NewErrorLabel = typeof errorLabels.$inferInsert;
export type ItemError = typeof itemErrors.$inferSelect;
export type NewItemError = typeof itemErrors.$inferInsert;
export type ShareLink = typeof shareLinks.$inferSelect;
export type NewShareLink = typeof shareLinks.$inferInsert;
export type ReviewHistory = typeof reviewHistories.$inferSelect;
export type NewReviewHistory = typeof reviewHistories.$inferInsert;
export type IssueTrend = typeof issueTrends.$inferSelect;
export type NewIssueTrend = typeof issueTrends.$inferInsert;
export type ChatThread = typeof chatThreads.$inferSelect;
export type NewChatThread = typeof chatThreads.$inferInsert;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type NewChatMessage = typeof chatMessages.$inferInsert;
export type Subscription = typeof subscriptions.$inferSelect;
export type NewSubscription = typeof subscriptions.$inferInsert;
export type BillingEvent = typeof billingEvents.$inferSelect;
export type NewBillingEvent = typeof billingEvents.$inferInsert;
export type BillingProviderAccount = typeof billingProviderAccounts.$inferSelect;
export type NewBillingProviderAccount = typeof billingProviderAccounts.$inferInsert;
export type BillingEntitlement = typeof billingEntitlements.$inferSelect;
export type NewBillingEntitlement = typeof billingEntitlements.$inferInsert;
export type BillingWebhookEvent = typeof billingWebhookEvents.$inferSelect;
export type NewBillingWebhookEvent = typeof billingWebhookEvents.$inferInsert;
export type ReminderEvent = typeof reminderEvents.$inferSelect;
export type NewReminderEvent = typeof reminderEvents.$inferInsert;
export type RunLifecycleEventRecord = typeof runLifecycleEvents.$inferSelect;
export type NewRunLifecycleEventRecord = typeof runLifecycleEvents.$inferInsert;
export type RunErrorEventRecord = typeof runErrorEvents.$inferSelect;
export type NewRunErrorEventRecord = typeof runErrorEvents.$inferInsert;
export type RunCostArtifactRecord = typeof runCostArtifacts.$inferSelect;
export type NewRunCostArtifactRecord = typeof runCostArtifacts.$inferInsert;
export type ModelProviderConfigRecord = typeof modelProviderConfigs.$inferSelect;
export type NewModelProviderConfigRecord = typeof modelProviderConfigs.$inferInsert;
export type AnalysisRunModelRecord = typeof analysisRunModels.$inferSelect;
export type NewAnalysisRunModelRecord = typeof analysisRunModels.$inferInsert;
export type ModelCallFailoverRecord = typeof modelCallFailovers.$inferSelect;
export type NewModelCallFailoverRecord = typeof modelCallFailovers.$inferInsert;
export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'email'>;
  })[];
};

export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_TEAM = 'CREATE_TEAM',
  REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
  INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',
  CREATE_CHILD = 'CREATE_CHILD',
  UPDATE_CHILD = 'UPDATE_CHILD',
  ARCHIVE_CHILD = 'ARCHIVE_CHILD',
  CREATE_UPLOAD = 'CREATE_UPLOAD',
  SUBMIT_UPLOAD = 'SUBMIT_UPLOAD',
  RETRY_RUN = 'RETRY_RUN',
}
