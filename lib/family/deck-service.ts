import 'server-only';

import {
  createDeckShellForReport,
  getDeckByIdForUser,
  getDeckForReport,
  getSharedDeckByToken,
  saveDeckSlidesForUser,
  updateDeckShellForUser,
} from '@/lib/family/decks';
import { getReportForUser } from '@/lib/family/repository';
import { recordDeckTelemetryEvent } from '@/lib/observability/deck-telemetry';

const ACTION_WHITELIST = new Set([
  'highlight_evidence',
  'focus_panel',
  'show_fact',
  'advance_note',
  'scroll_to_anchor',
]);

type ReportRecord = Awaited<ReturnType<typeof getReportForUser>>;

type GeneratedDeckAction = {
  actionIndex: number;
  actionType: 'highlight_evidence' | 'focus_panel' | 'show_fact' | 'advance_note' | 'scroll_to_anchor';
  referenceKey?: string | null;
  payload?: Record<string, unknown>;
  narrationText?: string;
  autoplay?: boolean;
  status?: 'draft' | 'ready' | 'rejected';
};

type GeneratedDeckSlide = {
  slideIndex: number;
  slideType: string;
  title: string;
  body: Record<string, unknown>;
  notes: Record<string, unknown>;
  status?: 'draft' | 'ready' | 'regenerated';
  actions: GeneratedDeckAction[];
};

function asRecord(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function asString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback;
}

function asArray<T = Record<string, unknown>>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function getParentReport(report: ReportRecord) {
  return asRecord((report as any)?.parentReportJson);
}

function getTutorReport(report: ReportRecord) {
  return asRecord((report as any)?.tutorReportJson);
}

function buildOutline(report: ReportRecord): Array<{ slideType: string; title: string }> {
  const parentReport = getParentReport(report);
  const topFindings = asArray(parentReport.topFindings);

  return [
    { slideType: 'overview', title: 'Guided Walkthrough Overview' },
    { slideType: 'diagnosis', title: 'What Stands Out Most' },
    { slideType: 'evidence', title: 'Visual Explanation Through Evidence' },
    { slideType: 'plan', title: '7-Day Review Step Plan' },
    {
      slideType: 'handoff',
      title: topFindings.length > 0 ? 'Tutor And Share Handoff' : 'Next Step Summary',
    },
  ];
}

function buildSlides(report: ReportRecord) {
  const parentReport = getParentReport(report);
  const tutorReport = getTutorReport(report);
  const topFindings = asArray<Record<string, unknown>>(parentReport.topFindings);
  const evidenceGroups = asArray<Record<string, unknown>>(parentReport.evidenceGroups);
  const plan = asArray<Record<string, unknown>>(parentReport.sevenDayPlan);
  const shareLinks = Array.isArray((report as any)?.shareLinks) ? (report as any).shareLinks : [];
  const outline = buildOutline(report);
  const primaryFinding = topFindings[0] || {};

  return outline.map((item, index): GeneratedDeckSlide => {
    switch (item.slideType) {
      case 'overview':
        return {
          slideIndex: index,
          slideType: item.slideType,
          title: item.title,
          body: {
            summary: asString(parentReport.summary, 'Review the strongest diagnosis facts before changing practice.'),
            confidence: parentReport.confidence ?? null,
            confidenceBand: asString(parentReport.confidenceBand, 'unknown'),
            guardrail: asString(
              parentReport.guardrail,
              'Guided Walkthrough is optional and does not replace the main report.'
            ),
          },
          notes: { reviewStep: `Review step ${index + 1} of ${outline.length}` },
          actions: [
            {
              actionIndex: 0,
              actionType: 'focus_panel',
              payload: { panel: 'summary' },
              narrationText: asString(parentReport.summary, 'Start with the report summary.'),
            },
          ],
        };
      case 'diagnosis':
        return {
          slideIndex: index,
          slideType: item.slideType,
          title: item.title,
          body: {
            doThisWeek: asString(parentReport.doThisWeek),
            notNow: asString(parentReport.notNow),
            findings: topFindings.slice(0, 3).map((finding) => ({
              title: asString(finding.title),
              severity: asString(finding.severity),
              patternType: asString(finding.patternType),
              rationale: asString(finding.rationale),
            })),
          },
          notes: { reviewStep: `Review step ${index + 1} of ${outline.length}` },
          actions: topFindings.slice(0, 3).map((finding, findingIndex) => ({
            actionIndex: findingIndex,
            actionType: 'show_fact' as const,
            referenceKey: asString(finding.code, `finding-${findingIndex}`),
            payload: { title: asString(finding.title) },
            narrationText: asString(finding.whatToDo, asString(finding.title)),
          })),
        };
      case 'evidence':
        return {
          slideIndex: index,
          slideType: item.slideType,
          title: item.title,
          body: {
            groups: evidenceGroups.slice(0, 3).map((group) => ({
              displayName: asString(group.displayName),
              description: asString(group.description),
              count: group.count ?? 0,
              items: asArray<Record<string, unknown>>(group.items).slice(0, 2).map((evidence) => ({
                pageNo: evidence.pageNo ?? null,
                problemNo: asString(evidence.problemNo),
                previewLabel: asString(evidence.previewLabel),
                rationale: asString(evidence.rationale),
              })),
            })),
          },
          notes: { reviewStep: `Review step ${index + 1} of ${outline.length}` },
          actions: evidenceGroups.flatMap((group, groupIndex) =>
            asArray<Record<string, unknown>>(group.items).slice(0, 2).map((evidence, evidenceIndex) => ({
              actionIndex: groupIndex * 2 + evidenceIndex,
              actionType: 'highlight_evidence' as const,
              referenceKey: `page-${evidence.pageNo || 0}-problem-${asString(evidence.problemNo)}`,
              payload: {
                pageNo: evidence.pageNo ?? null,
                problemNo: asString(evidence.problemNo),
                previewLabel: asString(evidence.previewLabel),
              },
              narrationText: asString(evidence.rationale, 'Use the evidence to visually explain the pattern.'),
            }))
          ),
        };
      case 'plan':
        return {
          slideIndex: index,
          slideType: item.slideType,
          title: item.title,
          body: {
            days: plan.map((day) => ({
              day: day.day ?? null,
              goal: asString(day.goal),
              practice: asString(day.practice),
              parentPrompt: asString(day.parentPrompt),
              successSignal: asString(day.successSignal),
            })),
          },
          notes: { reviewStep: `Review step ${index + 1} of ${outline.length}` },
          actions: plan.slice(0, 3).map((day, dayIndex) => ({
            actionIndex: dayIndex,
            actionType: 'advance_note' as const,
            payload: { day: day.day ?? dayIndex + 1 },
            narrationText: asString(day.goal, 'Use one day at a time as the review step.'),
          })),
        };
      default:
        return {
          slideIndex: index,
          slideType: item.slideType,
          title: item.title,
          body: {
            recommendedFocus: asString(tutorReport.recommendedFocus, asString((primaryFinding as any).title)),
            secondaryFocus: asString(tutorReport.secondaryFocus),
            shareState: shareLinks.length > 0 ? 'share_ready' : 'share_available',
            tutorNotes: asString(
              tutorReport.notes,
              'Keep Guided Walkthrough optional and preserve the main report as the core value layer.'
            ),
          },
          notes: { reviewStep: `Review step ${index + 1} of ${outline.length}` },
          actions: [
            {
              actionIndex: 0,
              actionType: 'scroll_to_anchor',
              payload: { target: 'share-summary' },
              narrationText: asString(tutorReport.notes, 'Wrap with the tutor handoff summary.'),
            },
          ],
        };
    }
  });
}

function validateSlides(slides: GeneratedDeckSlide[]) {
  return slides.map((slide) => ({
    slideIndex: slide.slideIndex,
    isValid:
      slide.title.trim().length > 0 &&
      Object.keys(slide.body).length > 0 &&
      slide.actions.every((action) => ACTION_WHITELIST.has(action.actionType)),
  }));
}

function countAnchors(slides: GeneratedDeckSlide[]) {
  return slides.reduce((total, slide) => {
    return (
      total +
      slide.actions.filter(
        (action) =>
          action.actionType === 'highlight_evidence' ||
          action.actionType === 'scroll_to_anchor'
      ).length
    );
  }, 0);
}

function scoreDeck(slides: GeneratedDeckSlide[]) {
  const validation = validateSlides(slides);
  const validSlides = validation.filter((item) => item.isValid).length;
  const anchorCount = countAnchors(slides);
  const planDays = asArray<Record<string, unknown>>(slides.find((slide) => slide.slideType === 'plan')?.body.days).length;
  const findings = asArray<Record<string, unknown>>(slides.find((slide) => slide.slideType === 'diagnosis')?.body.findings).length;

  const score =
    validSlides * 12 +
    Math.min(anchorCount, 6) * 6 +
    Math.min(planDays, 7) * 4 +
    Math.min(findings, 3) * 8;

  if (validSlides < 3 || findings === 0) {
    return {
      score,
      tier: 'D' as const,
      status: 'hidden' as const,
      visibility: 'hidden' as const,
      qualitySummary: {
        validSlides,
        anchorCount,
        planDays,
        findings,
        validation,
      },
    };
  }

  if (score >= 95) {
    return {
      score,
      tier: 'A' as const,
      status: 'ready' as const,
      visibility: 'full' as const,
      qualitySummary: { validSlides, anchorCount, planDays, findings, validation },
    };
  }

  if (score >= 75) {
    return {
      score,
      tier: 'B' as const,
      status: 'ready' as const,
      visibility: 'full' as const,
      qualitySummary: { validSlides, anchorCount, planDays, findings, validation },
    };
  }

  if (score >= 55) {
    return {
      score,
      tier: 'C' as const,
      status: 'degraded' as const,
      visibility: 'static_only' as const,
      qualitySummary: { validSlides, anchorCount, planDays, findings, validation },
    };
  }

  return {
    score,
    tier: 'D' as const,
    status: 'hidden' as const,
    visibility: 'hidden' as const,
    qualitySummary: { validSlides, anchorCount, planDays, findings, validation },
  };
}

export async function generateDeckForReport(userId: number, reportId: number) {
  const report = await getReportForUser(userId, reportId);
  if (!report) {
    return null;
  }

  const slides = buildSlides(report);
  const gate = scoreDeck(slides);
  const deck = await createDeckShellForReport(userId, reportId, {
    title: `Guided Walkthrough ${reportId}`,
    sourceFacts: {
      parentReport: getParentReport(report),
      tutorReport: getTutorReport(report),
      reportId,
    },
    status: gate.status,
    tier: gate.tier,
    walkthroughVisibility: gate.visibility,
    voiceGuidanceDefault: false,
    qualityScore: gate.score,
    qualitySummary: gate.qualitySummary,
    allowParentPlayback: gate.tier !== 'D',
    allowSharePlayback: gate.tier !== 'D',
    defaultVoiceEnabled: false,
    maxAutoplayTier: 'B',
  });

  if (!deck) {
    return null;
  }

  const withSlides = await saveDeckSlidesForUser(userId, deck.deck.id, slides);
  if (!withSlides) {
    return null;
  }

  const updated = await updateDeckShellForUser(userId, deck.deck.id, {
    status: gate.status,
    tier: gate.tier,
    walkthroughVisibility: gate.visibility,
    voiceGuidanceDefault: false,
    qualityScore: gate.score,
    qualitySummary: gate.qualitySummary,
    generatedAt: new Date().toISOString(),
  });
  if (updated) {
    await recordDeckTelemetryEvent({
      deckId: updated.deck.id,
      reportId: updated.deck.reportId,
      runId: updated.deck.runId,
      eventType: 'deck_generated',
      status: updated.deck.status,
      metadata: {
        tier: updated.deck.tier,
        score: gate.score,
        walkthroughVisibility: updated.deck.walkthroughVisibility,
      },
    });
  }
  return updated;
}

export async function ensureDeckForReport(userId: number, reportId: number) {
  const existing = await getDeckForReport(userId, reportId);
  if (existing) {
    return existing;
  }
  return generateDeckForReport(userId, reportId);
}

export async function regenerateDeckSlideForUser(
  userId: number,
  deckId: number,
  slideIndex: number
) {
  const deck = await getDeckByIdForUser(userId, deckId);
  if (!deck) {
    return null;
  }
  return generateDeckForReport(userId, deck.deck.reportId);
}

export async function regenerateDeckActionsForUser(
  userId: number,
  deckId: number,
  slideIndex?: number
) {
  const deck = await getDeckByIdForUser(userId, deckId);
  if (!deck) {
    return null;
  }
  return generateDeckForReport(userId, deck.deck.reportId);
}

export async function getDeckPlaybackForUser(userId: number, deckId: number) {
  const deck = await getDeckByIdForUser(userId, deckId);
  if (!deck) {
    return null;
  }

  return {
    deckId: deck.deck.id,
    reportId: deck.deck.reportId,
    status: deck.deck.status,
    tier: deck.deck.tier,
    walkthroughVisibility: deck.deck.walkthroughVisibility,
    voiceGuidanceDefault: deck.deck.voiceGuidanceDefault,
    autoplayAllowed: deck.deck.tier === 'A' || deck.deck.tier === 'B',
    slides: deck.slides.map((slide) => ({
      ...slide,
      actions: deck.actions.filter((action) => action.slideId === slide.id),
    })),
    latestSnapshot: deck.latestSnapshot,
  };
}

export async function getSharedDeckPlayback(token: string) {
  const payload = await getSharedDeckByToken(token);
  if (payload.status !== 'active' || !payload.deck) {
    return payload;
  }

  return {
    status: 'active' as const,
    shareLink: payload.shareLink,
    playback: {
      deckId: payload.deck.deck.id,
      reportId: payload.deck.deck.reportId,
      status: payload.deck.deck.status,
      tier: payload.deck.deck.tier,
      walkthroughVisibility: payload.deck.deck.walkthroughVisibility,
      voiceGuidanceDefault: payload.deck.deck.voiceGuidanceDefault,
      autoplayAllowed: payload.deck.deck.tier === 'A' || payload.deck.deck.tier === 'B',
      slides: payload.deck.slides.map((slide) => ({
        ...slide,
        actions: payload.deck.actions.filter((action) => action.slideId === slide.id),
      })),
      latestSnapshot: payload.deck.latestSnapshot,
    },
  };
}
