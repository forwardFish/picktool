import 'server-only';

import { and, desc, eq, inArray, isNull } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  analysisRuns,
  deckExports,
  deckPlaybackSnapshots,
  deckShareSettings,
  diagnosisDecks,
  diagnosisSlideActions,
  diagnosisSlides,
  reports,
  shareLinks,
} from '@/lib/db/schema';
import { isFamilyEduDemoMode } from '@/lib/family/config';
import {
  readFamilyMockState,
  updateFamilyMockState,
} from '@/lib/family/mock-store';
import { recordDeckTelemetryEvent } from '@/lib/observability/deck-telemetry';
import type {
  DeckPlaybackState,
  DeckReviewStatus,
  DeckSlideStatus,
  DeckStatus,
  DeckTier,
  DeckWalkthroughVisibility,
  StoredDeckExport,
  StoredDeckPlaybackSnapshot,
  StoredDeckShareSetting,
  StoredDiagnosisDeck,
  StoredDiagnosisSlide,
  StoredDiagnosisSlideAction,
} from '@/lib/family/types';

const FAMILY_EDU_DEMO_MODE = isFamilyEduDemoMode();

export type DeckAggregate = {
  deck: StoredDiagnosisDeck;
  slides: StoredDiagnosisSlide[];
  actions: StoredDiagnosisSlideAction[];
  shareSettings: StoredDeckShareSetting | null;
  exports: StoredDeckExport[];
  latestSnapshot: StoredDeckPlaybackSnapshot | null;
};

export type CreateDeckShellInput = {
  title?: string;
  sourceFacts?: Record<string, unknown>;
  status?: DeckStatus;
  tier?: DeckTier;
  reviewStatus?: DeckReviewStatus;
  walkthroughVisibility?: DeckWalkthroughVisibility;
  voiceGuidanceDefault?: boolean;
  qualityScore?: number | null;
  qualitySummary?: Record<string, unknown>;
  allowParentPlayback?: boolean;
  allowSharePlayback?: boolean;
  defaultVoiceEnabled?: boolean;
  maxAutoplayTier?: Exclude<DeckTier, 'pending'>;
};

export type SaveDeckSlidesInput = Array<{
  slideIndex: number;
  slideType: string;
  title: string;
  body?: Record<string, unknown>;
  notes?: Record<string, unknown>;
  status?: DeckSlideStatus;
  actions?: Array<{
    actionIndex: number;
    actionType: StoredDiagnosisSlideAction['actionType'];
    referenceKey?: string | null;
    payload?: Record<string, unknown>;
    narrationText?: string;
    autoplay?: boolean;
    status?: StoredDiagnosisSlideAction['status'];
  }>;
}>;

export type SaveSnapshotInput = {
  currentSlideIndex: number;
  currentActionIndex: number;
  playbackState: DeckPlaybackState;
  voiceEnabled: boolean;
  snapshotJson?: Record<string, unknown>;
  shareToken?: string | null;
};

function nowIso() {
  return new Date().toISOString();
}

function resolveDeckTitle(reportId: number, input?: CreateDeckShellInput) {
  return input?.title?.trim() || `Guided Walkthrough ${reportId}`;
}

function normalizeDeckAggregate(args: {
  deck: StoredDiagnosisDeck;
  slides: StoredDiagnosisSlide[];
  actions: StoredDiagnosisSlideAction[];
  shareSettings: StoredDeckShareSetting | null;
  exports: StoredDeckExport[];
  latestSnapshot: StoredDeckPlaybackSnapshot | null;
}): DeckAggregate {
  return {
    deck: args.deck,
    slides: args.slides.sort((left, right) => left.slideIndex - right.slideIndex),
    actions: args.actions.sort((left, right) => {
      if (left.slideId !== right.slideId) {
        return left.slideId - right.slideId;
      }
      return left.actionIndex - right.actionIndex;
    }),
    shareSettings: args.shareSettings,
    exports: args.exports.sort((left, right) => right.createdAt.localeCompare(left.createdAt)),
    latestSnapshot: args.latestSnapshot,
  };
}

function toStoredDiagnosisDeck(row: typeof diagnosisDecks.$inferSelect): StoredDiagnosisDeck {
  return {
    ...row,
    status: row.status as StoredDiagnosisDeck['status'],
    tier: row.tier as StoredDiagnosisDeck['tier'],
    reviewStatus: row.reviewStatus as StoredDiagnosisDeck['reviewStatus'],
    walkthroughVisibility:
      row.walkthroughVisibility as StoredDiagnosisDeck['walkthroughVisibility'],
    generatedAt: row.generatedAt?.toISOString() || null,
    approvedAt: row.approvedAt?.toISOString() || null,
    rejectedAt: row.rejectedAt?.toISOString() || null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toStoredDiagnosisSlide(row: typeof diagnosisSlides.$inferSelect): StoredDiagnosisSlide {
  return {
    ...row,
    status: row.status as StoredDiagnosisSlide['status'],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toStoredDiagnosisSlideAction(
  row: typeof diagnosisSlideActions.$inferSelect
): StoredDiagnosisSlideAction {
  return {
    ...row,
    actionType: row.actionType as StoredDiagnosisSlideAction['actionType'],
    status: row.status as StoredDiagnosisSlideAction['status'],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toStoredDeckShareSetting(
  row: typeof deckShareSettings.$inferSelect
): StoredDeckShareSetting {
  return {
    ...row,
    maxAutoplayTier: row.maxAutoplayTier as StoredDeckShareSetting['maxAutoplayTier'],
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toStoredDeckExport(row: typeof deckExports.$inferSelect): StoredDeckExport {
  return {
    ...row,
    format: row.format as StoredDeckExport['format'],
    status: row.status as StoredDeckExport['status'],
    completedAt: row.completedAt?.toISOString() || null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toStoredDeckPlaybackSnapshot(
  row: typeof deckPlaybackSnapshots.$inferSelect
): StoredDeckPlaybackSnapshot {
  return {
    ...row,
    playbackState: row.playbackState as StoredDeckPlaybackSnapshot['playbackState'],
    restoredAt: row.restoredAt?.toISOString() || null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

async function readDemoDeckAggregate(deckId: number): Promise<DeckAggregate | null> {
  const state = await readFamilyMockState();
  const deck = state.diagnosisDecks.find((item) => item.id === deckId) || null;
  if (!deck) {
    return null;
  }

  return normalizeDeckAggregate({
    deck,
    slides: state.diagnosisSlides.filter((item) => item.deckId === deck.id),
    actions: state.diagnosisSlideActions.filter((item) => item.deckId === deck.id),
    shareSettings:
      state.deckShareSettings.find((item) => item.deckId === deck.id) || null,
    exports: state.deckExports.filter((item) => item.deckId === deck.id),
    latestSnapshot:
      state.deckPlaybackSnapshots
        .filter((item) => item.deckId === deck.id)
        .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))[0] || null,
  });
}

export async function createDeckShellForReport(
  userId: number,
  reportId: number,
  input?: CreateDeckShellInput
) {
  if (FAMILY_EDU_DEMO_MODE) {
    const deckId = await updateFamilyMockState((state) => {
      const report = state.reports.find((item) => item.id === reportId);
      if (!report) {
        return null;
      }
      const run = state.runs.find((item) => item.id === report.runId && item.userId === userId);
      if (!run) {
        return null;
      }

      const timestamp = nowIso();
      const deck: StoredDiagnosisDeck = {
        id: state.meta.nextIds.diagnosisDeck++,
        runId: run.id,
        reportId: report.id,
        status: input?.status || 'draft',
        tier: input?.tier || 'pending',
        reviewStatus: input?.reviewStatus || 'pending',
        walkthroughVisibility: input?.walkthroughVisibility || 'hidden',
        voiceGuidanceDefault: input?.voiceGuidanceDefault ?? false,
        qualityScore:
          typeof input?.qualityScore === 'number' ? input.qualityScore : null,
        qualitySummary: input?.qualitySummary || {},
        sourceFacts: input?.sourceFacts || {},
        title: resolveDeckTitle(report.id, input),
        generatedAt: null,
        approvedAt: null,
        rejectedAt: null,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      const shareSetting: StoredDeckShareSetting = {
        id: state.meta.nextIds.deckShareSetting++,
        deckId: deck.id,
        reportId: report.id,
        allowParentPlayback: input?.allowParentPlayback ?? false,
        allowSharePlayback: input?.allowSharePlayback ?? false,
        defaultVoiceEnabled: input?.defaultVoiceEnabled ?? false,
        maxAutoplayTier: input?.maxAutoplayTier || 'B',
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      state.diagnosisDecks.push(deck);
      state.deckShareSettings.push(shareSetting);

      run.deckId = deck.id;
      run.deckGenerationStatus = deck.status;
      run.deckReviewStatus = deck.reviewStatus;
      run.updatedAt = timestamp;

      report.deckId = deck.id;
      report.deckStatus = deck.status;
      report.deckTier = deck.tier;
      report.walkthroughVisibility = deck.walkthroughVisibility;
      report.voiceGuidanceDefault = deck.voiceGuidanceDefault;
      report.updatedAt = timestamp;

      return deck.id;
    });

    const aggregate = deckId ? await readDemoDeckAggregate(deckId) : null;
    if (aggregate) {
      await recordDeckTelemetryEvent({
        deckId: aggregate.deck.id,
        reportId: aggregate.deck.reportId,
        runId: aggregate.deck.runId,
        eventType: 'deck_created',
        status: aggregate.deck.status,
        metadata: {
          tier: aggregate.deck.tier,
          walkthroughVisibility: aggregate.deck.walkthroughVisibility,
        },
      });
    }
    return aggregate;
  }

  const [reportRow] = await db
    .select({
      reportId: reports.id,
      runId: reports.runId,
      userId: analysisRuns.userId,
    })
    .from(reports)
    .innerJoin(analysisRuns, eq(reports.runId, analysisRuns.id))
    .where(and(eq(reports.id, reportId), eq(analysisRuns.userId, userId)))
    .limit(1);

  if (!reportRow) {
    return null;
  }

  const [deck] = await db
    .insert(diagnosisDecks)
    .values({
      runId: reportRow.runId,
      reportId: reportRow.reportId,
      status: input?.status || 'draft',
      tier: input?.tier || 'pending',
      reviewStatus: input?.reviewStatus || 'pending',
      walkthroughVisibility: input?.walkthroughVisibility || 'hidden',
      voiceGuidanceDefault: input?.voiceGuidanceDefault ?? false,
      qualityScore:
        typeof input?.qualityScore === 'number' ? input.qualityScore : null,
      qualitySummary: input?.qualitySummary || {},
      sourceFacts: input?.sourceFacts || {},
      title: resolveDeckTitle(reportRow.reportId, input),
    })
    .returning();

  await db.insert(deckShareSettings).values({
    deckId: deck.id,
    reportId: reportRow.reportId,
    allowParentPlayback: input?.allowParentPlayback ?? false,
    allowSharePlayback: input?.allowSharePlayback ?? false,
    defaultVoiceEnabled: input?.defaultVoiceEnabled ?? false,
    maxAutoplayTier: input?.maxAutoplayTier || 'B',
  });

  await db
    .update(analysisRuns)
    .set({
      deckId: deck.id,
      deckGenerationStatus: deck.status,
      deckReviewStatus: deck.reviewStatus,
      updatedAt: new Date(),
    })
    .where(eq(analysisRuns.id, reportRow.runId));

  await db
    .update(reports)
    .set({
      deckId: deck.id,
      deckStatus: deck.status,
      deckTier: deck.tier,
      walkthroughVisibility: deck.walkthroughVisibility,
      voiceGuidanceDefault: deck.voiceGuidanceDefault,
      updatedAt: new Date(),
    })
    .where(eq(reports.id, reportRow.reportId));

  const aggregate = await getDeckByIdForUser(userId, deck.id);
  if (aggregate) {
    await recordDeckTelemetryEvent({
      deckId: aggregate.deck.id,
      reportId: aggregate.deck.reportId,
      runId: aggregate.deck.runId,
      eventType: 'deck_created',
      status: aggregate.deck.status,
      metadata: {
        tier: aggregate.deck.tier,
        walkthroughVisibility: aggregate.deck.walkthroughVisibility,
      },
    });
  }
  return aggregate;
}

export async function getDeckForReport(userId: number, reportId: number) {
  if (FAMILY_EDU_DEMO_MODE) {
    const state = await readFamilyMockState();
    const report = state.reports.find((item) => item.id === reportId);
    if (!report) {
      return null;
    }
    const run = state.runs.find((item) => item.id === report.runId && item.userId === userId);
    if (!run) {
      return null;
    }
    const deckId =
      report.deckId ||
      state.diagnosisDecks
        .filter((item) => item.reportId === reportId)
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0]?.id ||
      null;

    return deckId ? readDemoDeckAggregate(deckId) : null;
  }

  const [row] = await db
    .select({
      deckId: reports.deckId,
      userId: analysisRuns.userId,
    })
    .from(reports)
    .innerJoin(analysisRuns, eq(reports.runId, analysisRuns.id))
    .where(and(eq(reports.id, reportId), eq(analysisRuns.userId, userId)))
    .limit(1);

  if (!row) {
    return null;
  }

  if (row.deckId) {
    return getDeckByIdForUser(userId, row.deckId);
  }

  const [latestDeck] = await db
    .select({ id: diagnosisDecks.id })
    .from(diagnosisDecks)
    .innerJoin(reports, eq(diagnosisDecks.reportId, reports.id))
    .innerJoin(analysisRuns, eq(reports.runId, analysisRuns.id))
    .where(and(eq(diagnosisDecks.reportId, reportId), eq(analysisRuns.userId, userId)))
    .orderBy(desc(diagnosisDecks.createdAt))
    .limit(1);

  return latestDeck ? getDeckByIdForUser(userId, latestDeck.id) : null;
}

export async function getDeckByIdForUser(userId: number, deckId: number) {
  if (FAMILY_EDU_DEMO_MODE) {
    const aggregate = await readDemoDeckAggregate(deckId);
    if (!aggregate) {
      return null;
    }
    const state = await readFamilyMockState();
    const run = state.runs.find(
      (item) => item.id === aggregate.deck.runId && item.userId === userId
    );
    return run ? aggregate : null;
  }

  const [deckRow] = await db
    .select({
      deck: diagnosisDecks,
      userId: analysisRuns.userId,
    })
    .from(diagnosisDecks)
    .innerJoin(analysisRuns, eq(diagnosisDecks.runId, analysisRuns.id))
    .where(and(eq(diagnosisDecks.id, deckId), eq(analysisRuns.userId, userId)))
    .limit(1);

  if (!deckRow) {
    return null;
  }

  const slides = await db
    .select()
    .from(diagnosisSlides)
    .where(eq(diagnosisSlides.deckId, deckId))
    .orderBy(diagnosisSlides.slideIndex);
  const slideIds = slides.map((slide) => slide.id);
  const actions =
    slideIds.length > 0
      ? await db
          .select()
          .from(diagnosisSlideActions)
          .where(inArray(diagnosisSlideActions.slideId, slideIds))
          .orderBy(diagnosisSlideActions.slideId, diagnosisSlideActions.actionIndex)
      : [];
  const [shareSetting] = await db
    .select()
    .from(deckShareSettings)
    .where(eq(deckShareSettings.deckId, deckId))
    .limit(1);
  const exportRows = await db
    .select()
    .from(deckExports)
    .where(eq(deckExports.deckId, deckId))
    .orderBy(desc(deckExports.createdAt));
  const [latestSnapshot] = await db
    .select()
    .from(deckPlaybackSnapshots)
    .where(and(eq(deckPlaybackSnapshots.deckId, deckId), eq(deckPlaybackSnapshots.userId, userId)))
    .orderBy(desc(deckPlaybackSnapshots.updatedAt))
    .limit(1);

  return normalizeDeckAggregate({
    deck: toStoredDiagnosisDeck(deckRow.deck),
    slides: slides.map(toStoredDiagnosisSlide),
    actions: actions.map(toStoredDiagnosisSlideAction),
    shareSettings: shareSetting ? toStoredDeckShareSetting(shareSetting) : null,
    exports: exportRows.map(toStoredDeckExport),
    latestSnapshot: latestSnapshot ? toStoredDeckPlaybackSnapshot(latestSnapshot) : null,
  });
}

export async function updateDeckShellForUser(
  userId: number,
  deckId: number,
  patch: Partial<
    Pick<
      StoredDiagnosisDeck,
      | 'status'
      | 'tier'
      | 'reviewStatus'
      | 'walkthroughVisibility'
      | 'voiceGuidanceDefault'
      | 'qualityScore'
      | 'qualitySummary'
      | 'sourceFacts'
      | 'title'
      | 'generatedAt'
      | 'approvedAt'
      | 'rejectedAt'
    >
  >
) {
  if (FAMILY_EDU_DEMO_MODE) {
    await updateFamilyMockState((state) => {
      const deck = state.diagnosisDecks.find((item) => item.id === deckId);
      if (!deck) {
        return null;
      }
      const run = state.runs.find((item) => item.id === deck.runId && item.userId === userId);
      if (!run) {
        return null;
      }
      const report = state.reports.find((item) => item.id === deck.reportId) || null;
      Object.assign(deck, patch, { updatedAt: nowIso() });
      run.deckGenerationStatus = deck.status;
      run.deckReviewStatus = deck.reviewStatus;
      run.updatedAt = deck.updatedAt;
      if (report) {
        report.deckStatus = deck.status;
        report.deckTier = deck.tier;
        report.walkthroughVisibility = deck.walkthroughVisibility;
        report.voiceGuidanceDefault = deck.voiceGuidanceDefault;
        report.updatedAt = deck.updatedAt;
      }
      return true;
    });
    const next = await getDeckByIdForUser(userId, deckId);
    if (next) {
      await recordDeckTelemetryEvent({
        deckId: next.deck.id,
        reportId: next.deck.reportId,
        runId: next.deck.runId,
        eventType: 'deck_updated',
        status: next.deck.status,
        metadata: {
          tier: next.deck.tier,
          reviewStatus: next.deck.reviewStatus,
        },
      });
    }
    return next;
  }

  const aggregate = await getDeckByIdForUser(userId, deckId);
  if (!aggregate) {
    return null;
  }

  await db
    .update(diagnosisDecks)
    .set({
      ...patch,
      updatedAt: new Date(),
      generatedAt: patch.generatedAt ? new Date(patch.generatedAt) : undefined,
      approvedAt: patch.approvedAt ? new Date(patch.approvedAt) : undefined,
      rejectedAt: patch.rejectedAt ? new Date(patch.rejectedAt) : undefined,
    })
    .where(eq(diagnosisDecks.id, deckId));

  await db
    .update(analysisRuns)
    .set({
      deckGenerationStatus: patch.status || aggregate.deck.status,
      deckReviewStatus: patch.reviewStatus || aggregate.deck.reviewStatus,
      updatedAt: new Date(),
    })
    .where(eq(analysisRuns.id, aggregate.deck.runId));

  await db
    .update(reports)
    .set({
      deckStatus: patch.status || aggregate.deck.status,
      deckTier: patch.tier || aggregate.deck.tier,
      walkthroughVisibility:
        patch.walkthroughVisibility || aggregate.deck.walkthroughVisibility,
      voiceGuidanceDefault:
        patch.voiceGuidanceDefault ?? aggregate.deck.voiceGuidanceDefault,
      updatedAt: new Date(),
    })
    .where(eq(reports.id, aggregate.deck.reportId));

  const next = await getDeckByIdForUser(userId, deckId);
  if (next) {
    await recordDeckTelemetryEvent({
      deckId: next.deck.id,
      reportId: next.deck.reportId,
      runId: next.deck.runId,
      eventType: 'deck_updated',
      status: next.deck.status,
      metadata: {
        tier: next.deck.tier,
        reviewStatus: next.deck.reviewStatus,
      },
    });
  }
  return next;
}

export async function saveDeckSlidesForUser(
  userId: number,
  deckId: number,
  slides: SaveDeckSlidesInput
) {
  const aggregate = await getDeckByIdForUser(userId, deckId);
  if (!aggregate) {
    return null;
  }

  if (FAMILY_EDU_DEMO_MODE) {
    await updateFamilyMockState((state) => {
      state.diagnosisSlideActions = state.diagnosisSlideActions.filter(
        (item) => item.deckId !== deckId
      );
      state.diagnosisSlides = state.diagnosisSlides.filter((item) => item.deckId !== deckId);

      const timestamp = nowIso();
      for (const slideInput of slides) {
        const slide: StoredDiagnosisSlide = {
          id: state.meta.nextIds.diagnosisSlide++,
          deckId,
          slideIndex: slideInput.slideIndex,
          slideType: slideInput.slideType,
          title: slideInput.title,
          body: slideInput.body || {},
          notes: slideInput.notes || {},
          status: slideInput.status || 'draft',
          createdAt: timestamp,
          updatedAt: timestamp,
        };
        state.diagnosisSlides.push(slide);

        for (const actionInput of slideInput.actions || []) {
          state.diagnosisSlideActions.push({
            id: state.meta.nextIds.diagnosisSlideAction++,
            deckId,
            slideId: slide.id,
            actionIndex: actionInput.actionIndex,
            actionType: actionInput.actionType,
            referenceKey: actionInput.referenceKey || null,
            payload: actionInput.payload || {},
            narrationText: actionInput.narrationText || '',
            autoplay: actionInput.autoplay ?? false,
            status: actionInput.status || 'draft',
            createdAt: timestamp,
            updatedAt: timestamp,
          });
        }
      }
      return true;
    });
    return getDeckByIdForUser(userId, deckId);
  }

  const existingSlides = await db
    .select({ id: diagnosisSlides.id })
    .from(diagnosisSlides)
    .where(eq(diagnosisSlides.deckId, deckId));
  const existingSlideIds = existingSlides.map((slide) => slide.id);
  if (existingSlideIds.length > 0) {
    await db
      .delete(diagnosisSlideActions)
      .where(inArray(diagnosisSlideActions.slideId, existingSlideIds));
    await db.delete(diagnosisSlides).where(eq(diagnosisSlides.deckId, deckId));
  }

  for (const slideInput of slides) {
    const [createdSlide] = await db
      .insert(diagnosisSlides)
      .values({
        deckId,
        slideIndex: slideInput.slideIndex,
        slideType: slideInput.slideType,
        title: slideInput.title,
        body: slideInput.body || {},
        notes: slideInput.notes || {},
        status: slideInput.status || 'draft',
      })
      .returning();

    if ((slideInput.actions || []).length > 0) {
      await db.insert(diagnosisSlideActions).values(
        (slideInput.actions || []).map((actionInput) => ({
          deckId,
          slideId: createdSlide.id,
          actionIndex: actionInput.actionIndex,
          actionType: actionInput.actionType,
          referenceKey: actionInput.referenceKey || null,
          payload: actionInput.payload || {},
          narrationText: actionInput.narrationText || '',
          autoplay: actionInput.autoplay ?? false,
          status: actionInput.status || 'draft',
        }))
      );
    }
  }

  return getDeckByIdForUser(userId, deckId);
}

export async function saveDeckPlaybackSnapshotForUser(
  userId: number,
  deckId: number,
  input: SaveSnapshotInput
) {
  const aggregate = await getDeckByIdForUser(userId, deckId);
  if (!aggregate) {
    return null;
  }

  if (FAMILY_EDU_DEMO_MODE) {
    await updateFamilyMockState((state) => {
      const existing = state.deckPlaybackSnapshots.find(
        (item) => item.deckId === deckId && item.userId === userId && item.shareToken === null
      );
      const timestamp = nowIso();
      if (existing) {
        existing.currentSlideIndex = input.currentSlideIndex;
        existing.currentActionIndex = input.currentActionIndex;
        existing.playbackState = input.playbackState;
        existing.voiceEnabled = input.voiceEnabled;
        existing.snapshotJson = input.snapshotJson || {};
        existing.updatedAt = timestamp;
      } else {
        state.deckPlaybackSnapshots.push({
          id: state.meta.nextIds.deckPlaybackSnapshot++,
          deckId,
          userId,
          shareToken: null,
          currentSlideIndex: input.currentSlideIndex,
          currentActionIndex: input.currentActionIndex,
          playbackState: input.playbackState,
          voiceEnabled: input.voiceEnabled,
          snapshotJson: input.snapshotJson || {},
          restoredAt: null,
          createdAt: timestamp,
          updatedAt: timestamp,
        });
      }
      return true;
    });
    const next = await getDeckPlaybackSnapshotForUser(userId, deckId);
    if (aggregate && next) {
      await recordDeckTelemetryEvent({
        deckId,
        reportId: aggregate.deck.reportId,
        runId: aggregate.deck.runId,
        eventType: 'snapshot_saved',
        status: next.playbackState,
        metadata: {
          currentSlideIndex: next.currentSlideIndex,
          currentActionIndex: next.currentActionIndex,
          voiceEnabled: next.voiceEnabled,
        },
      });
    }
    return next;
  }

  const [existing] = await db
    .select()
    .from(deckPlaybackSnapshots)
    .where(and(eq(deckPlaybackSnapshots.deckId, deckId), eq(deckPlaybackSnapshots.userId, userId)))
    .limit(1);

  if (existing) {
    await db
      .update(deckPlaybackSnapshots)
      .set({
        currentSlideIndex: input.currentSlideIndex,
        currentActionIndex: input.currentActionIndex,
        playbackState: input.playbackState,
        voiceEnabled: input.voiceEnabled,
        snapshotJson: input.snapshotJson || {},
        updatedAt: new Date(),
      })
      .where(eq(deckPlaybackSnapshots.id, existing.id));
  } else {
    await db.insert(deckPlaybackSnapshots).values({
      deckId,
      userId,
      shareToken: input.shareToken || null,
      currentSlideIndex: input.currentSlideIndex,
      currentActionIndex: input.currentActionIndex,
      playbackState: input.playbackState,
      voiceEnabled: input.voiceEnabled,
      snapshotJson: input.snapshotJson || {},
    });
  }

  const next = await getDeckPlaybackSnapshotForUser(userId, deckId);
  if (aggregate && next) {
    await recordDeckTelemetryEvent({
      deckId,
      reportId: aggregate.deck.reportId,
      runId: aggregate.deck.runId,
      eventType: 'snapshot_saved',
      status: next.playbackState,
      metadata: {
        currentSlideIndex: next.currentSlideIndex,
        currentActionIndex: next.currentActionIndex,
        voiceEnabled: next.voiceEnabled,
      },
    });
  }
  return next;
}

export async function getDeckPlaybackSnapshotForUser(userId: number, deckId: number) {
  if (FAMILY_EDU_DEMO_MODE) {
    const state = await readFamilyMockState();
    return (
      state.deckPlaybackSnapshots
        .filter((item) => item.deckId === deckId && item.userId === userId)
        .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))[0] || null
    );
  }

  const [snapshot] = await db
    .select()
    .from(deckPlaybackSnapshots)
    .where(and(eq(deckPlaybackSnapshots.deckId, deckId), eq(deckPlaybackSnapshots.userId, userId)))
    .orderBy(desc(deckPlaybackSnapshots.updatedAt))
    .limit(1);

  return snapshot
    ? {
        ...snapshot,
        restoredAt: snapshot.restoredAt?.toISOString() || null,
        createdAt: snapshot.createdAt.toISOString(),
        updatedAt: snapshot.updatedAt.toISOString(),
      }
    : null;
}

export async function markDeckPlaybackSnapshotRestored(
  userId: number,
  deckId: number,
  snapshotId: number
) {
  const aggregate = await getDeckByIdForUser(userId, deckId);
  if (FAMILY_EDU_DEMO_MODE) {
    await updateFamilyMockState((state) => {
      const snapshot = state.deckPlaybackSnapshots.find(
        (item) => item.id === snapshotId && item.deckId === deckId && item.userId === userId
      );
      if (!snapshot) {
        return null;
      }
      snapshot.restoredAt = nowIso();
      snapshot.updatedAt = nowIso();
      return true;
    });
    const next = await getDeckPlaybackSnapshotForUser(userId, deckId);
    if (aggregate && next) {
      await recordDeckTelemetryEvent({
        deckId,
        reportId: aggregate.deck.reportId,
        runId: aggregate.deck.runId,
        eventType: 'snapshot_restored',
        status: next.playbackState,
        metadata: {
          currentSlideIndex: next.currentSlideIndex,
          currentActionIndex: next.currentActionIndex,
        },
      });
    }
    return next;
  }

  await db
    .update(deckPlaybackSnapshots)
    .set({
      restoredAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(deckPlaybackSnapshots.id, snapshotId),
        eq(deckPlaybackSnapshots.deckId, deckId),
        eq(deckPlaybackSnapshots.userId, userId)
      )
    );

  const next = await getDeckPlaybackSnapshotForUser(userId, deckId);
  if (aggregate && next) {
    await recordDeckTelemetryEvent({
      deckId,
      reportId: aggregate.deck.reportId,
      runId: aggregate.deck.runId,
      eventType: 'snapshot_restored',
      status: next.playbackState,
      metadata: {
        currentSlideIndex: next.currentSlideIndex,
        currentActionIndex: next.currentActionIndex,
      },
    });
  }
  return next;
}

export async function createDeckExportForUser(
  userId: number,
  deckId: number,
  format: 'h5' | 'pdf',
  metadata?: Record<string, unknown>
) {
  const aggregate = await getDeckByIdForUser(userId, deckId);
  if (!aggregate) {
    return null;
  }

  if (FAMILY_EDU_DEMO_MODE) {
    await updateFamilyMockState((state) => {
      const timestamp = nowIso();
      state.deckExports.unshift({
        id: state.meta.nextIds.deckExport++,
        deckId,
        format,
        status: 'queued',
        artifactPath: null,
        metadata: metadata || {},
        completedAt: null,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      const run = state.runs.find((item) => item.id === aggregate.deck.runId);
      if (run) {
        run.deckExportStatus = 'queued';
        run.updatedAt = timestamp;
      }
      return true;
    });
    const next = await listDeckExportsForUser(userId, deckId);
    await recordDeckTelemetryEvent({
      deckId,
      reportId: aggregate.deck.reportId,
      runId: aggregate.deck.runId,
      eventType: 'export_requested',
      status: 'queued',
      metadata: { format },
    });
    return next;
  }

  await db.insert(deckExports).values({
    deckId,
    format,
    status: 'queued',
    metadata: metadata || {},
  });
  await db
    .update(analysisRuns)
    .set({
      deckExportStatus: 'queued',
      updatedAt: new Date(),
    })
    .where(eq(analysisRuns.id, aggregate.deck.runId));

  const next = await listDeckExportsForUser(userId, deckId);
  await recordDeckTelemetryEvent({
    deckId,
    reportId: aggregate.deck.reportId,
    runId: aggregate.deck.runId,
    eventType: 'export_requested',
    status: 'queued',
    metadata: { format },
  });
  return next;
}

export async function updateDeckExportForUser(
  userId: number,
  deckId: number,
  exportId: number,
  patch: {
    status?: StoredDeckExport['status'];
    artifactPath?: string | null;
    metadata?: Record<string, unknown>;
    completedAt?: string | null;
  }
) {
  const aggregate = await getDeckByIdForUser(userId, deckId);
  if (!aggregate) {
    return null;
  }

  if (FAMILY_EDU_DEMO_MODE) {
    await updateFamilyMockState((state) => {
      const exportRow = state.deckExports.find(
        (item) => item.id === exportId && item.deckId === deckId
      );
      if (!exportRow) {
        return null;
      }
      exportRow.status = patch.status || exportRow.status;
      exportRow.artifactPath =
        patch.artifactPath === undefined ? exportRow.artifactPath : patch.artifactPath;
      exportRow.metadata = patch.metadata || exportRow.metadata;
      exportRow.completedAt =
        patch.completedAt === undefined ? exportRow.completedAt : patch.completedAt;
      exportRow.updatedAt = nowIso();
      const run = state.runs.find((item) => item.id === aggregate.deck.runId);
      if (run) {
        run.deckExportStatus =
          exportRow.status === 'ready'
            ? 'ready'
            : exportRow.status === 'failed'
              ? 'failed'
              : 'queued';
        run.updatedAt = exportRow.updatedAt;
      }
      return true;
    });
    const next = await listDeckExportsForUser(userId, deckId);
    await recordDeckTelemetryEvent({
      deckId,
      reportId: aggregate.deck.reportId,
      runId: aggregate.deck.runId,
      eventType: patch.status === 'ready' ? 'export_completed' : 'deck_updated',
      status: patch.status || 'queued',
      metadata: {
        exportId,
        artifactPath: patch.artifactPath || null,
      },
    });
    return next;
  }

  await db
    .update(deckExports)
    .set({
      status: patch.status,
      artifactPath: patch.artifactPath,
      metadata: patch.metadata,
      completedAt: patch.completedAt ? new Date(patch.completedAt) : undefined,
      updatedAt: new Date(),
    })
    .where(and(eq(deckExports.id, exportId), eq(deckExports.deckId, deckId)));

  await db
    .update(analysisRuns)
    .set({
      deckExportStatus:
        patch.status === 'ready' ? 'ready' : patch.status === 'failed' ? 'failed' : 'queued',
      updatedAt: new Date(),
    })
    .where(eq(analysisRuns.id, aggregate.deck.runId));

  const next = await listDeckExportsForUser(userId, deckId);
  await recordDeckTelemetryEvent({
    deckId,
    reportId: aggregate.deck.reportId,
    runId: aggregate.deck.runId,
    eventType: patch.status === 'ready' ? 'export_completed' : 'deck_updated',
    status: patch.status || 'queued',
    metadata: {
      exportId,
      artifactPath: patch.artifactPath || null,
    },
  });
  return next;
}

export async function listDeckExportsForUser(userId: number, deckId: number) {
  const aggregate = await getDeckByIdForUser(userId, deckId);
  return aggregate?.exports || null;
}

export async function getSharedDeckByToken(token: string) {
  if (FAMILY_EDU_DEMO_MODE) {
    const state = await readFamilyMockState();
    const shareLink = state.shareLinks.find((item) => item.token === token) || null;
    if (!shareLink) {
      return { status: 'missing' as const, deck: null, shareLink: null };
    }
    if (shareLink.revokedAt) {
      return { status: 'revoked' as const, deck: null, shareLink };
    }
    if (new Date(shareLink.expiresAt) < new Date()) {
      return { status: 'expired' as const, deck: null, shareLink };
    }

    const report = state.reports.find((item) => item.id === shareLink.reportId) || null;
    if (!report?.deckId) {
      return { status: 'missing' as const, deck: null, shareLink };
    }
    const aggregate = await readDemoDeckAggregate(report.deckId);
    const shareSetting =
      aggregate?.shareSettings?.allowSharePlayback && aggregate.shareSettings
        ? aggregate.shareSettings
        : null;
    if (!aggregate || !shareSetting) {
      return { status: 'blocked' as const, deck: null, shareLink };
    }

    await recordDeckTelemetryEvent({
      deckId: aggregate.deck.id,
      reportId: aggregate.deck.reportId,
      runId: aggregate.deck.runId,
      eventType: 'share_playback_read',
      status: aggregate.deck.status,
      metadata: {
        token,
        tier: aggregate.deck.tier,
      },
    });
    return {
      status: 'active' as const,
      shareLink,
      deck: aggregate,
    };
  }

  const [row] = await db
    .select({
      shareLink: shareLinks,
      reportId: reports.id,
      deckId: reports.deckId,
    })
    .from(shareLinks)
    .innerJoin(reports, eq(shareLinks.reportId, reports.id))
    .where(eq(shareLinks.token, token))
    .limit(1);

  if (!row) {
    return { status: 'missing' as const, deck: null, shareLink: null };
  }
  if (row.shareLink.revokedAt) {
    return { status: 'revoked' as const, deck: null, shareLink: row.shareLink };
  }
  if (new Date(row.shareLink.expiresAt) < new Date()) {
    return { status: 'expired' as const, deck: null, shareLink: row.shareLink };
  }
  if (!row.deckId) {
    return { status: 'missing' as const, deck: null, shareLink: row.shareLink };
  }

  const [shareSetting] = await db
    .select()
    .from(deckShareSettings)
    .where(and(eq(deckShareSettings.deckId, row.deckId), eq(deckShareSettings.reportId, row.reportId)))
    .limit(1);

  if (!shareSetting?.allowSharePlayback) {
    return { status: 'blocked' as const, deck: null, shareLink: row.shareLink };
  }

  const [deckRow] = await db
    .select()
    .from(diagnosisDecks)
    .where(eq(diagnosisDecks.id, row.deckId))
    .limit(1);

  if (!deckRow) {
    return { status: 'missing' as const, deck: null, shareLink: row.shareLink };
  }

  const slides = await db
    .select()
    .from(diagnosisSlides)
    .where(eq(diagnosisSlides.deckId, row.deckId))
    .orderBy(diagnosisSlides.slideIndex);
  const slideIds = slides.map((slide) => slide.id);
  const actions =
    slideIds.length > 0
      ? await db
          .select()
          .from(diagnosisSlideActions)
          .where(inArray(diagnosisSlideActions.slideId, slideIds))
      : [];
  const exportRows = await db
    .select()
    .from(deckExports)
    .where(eq(deckExports.deckId, row.deckId))
    .orderBy(desc(deckExports.createdAt));
  const [latestSnapshot] = await db
    .select()
    .from(deckPlaybackSnapshots)
    .where(and(eq(deckPlaybackSnapshots.deckId, row.deckId), isNull(deckPlaybackSnapshots.userId)))
    .orderBy(desc(deckPlaybackSnapshots.updatedAt))
    .limit(1);

  await recordDeckTelemetryEvent({
    deckId: row.deckId,
    reportId: row.reportId,
    runId: deckRow.runId,
    eventType: 'share_playback_read',
    status: deckRow.status,
    metadata: {
      token,
      tier: deckRow.tier,
    },
  });
  return {
    status: 'active' as const,
    shareLink: row.shareLink,
    deck: normalizeDeckAggregate({
      deck: toStoredDiagnosisDeck(deckRow),
      slides: slides.map(toStoredDiagnosisSlide),
      actions: actions.map(toStoredDiagnosisSlideAction),
      shareSettings: toStoredDeckShareSetting(shareSetting),
      exports: exportRows.map(toStoredDeckExport),
      latestSnapshot: latestSnapshot ? toStoredDeckPlaybackSnapshot(latestSnapshot) : null,
    }),
  };
}
