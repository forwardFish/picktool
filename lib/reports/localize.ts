import type { ParentReport } from '@/components/reports/report-types';

type ReportLabels = Record<string, string>;

const EN_LABELS: ReportLabels = {
  parentReport: 'Parent Report',
  diagnosisHeadline: 'Diagnosis, evidence, and next steps',
  diagnosis: 'Diagnosis',
  evidence: 'Evidence',
  sevenDayPlan: '7-Day Plan',
  reportSummary: 'Report Summary',
  child: 'Child',
  grade: 'Grade',
  sourceType: 'Source type',
  confidence: 'Confidence',
  backToDashboard: 'Back to Dashboard',
  shareWithTutor: 'Share With Tutor',
  exportPdf: 'Export PDF',
  pageViewer: 'Page Viewer',
  openSourcePage: 'Open Source Page',
  studentWork: 'Student work',
  whyItMatters: 'Why it matters',
  doThisWeek: 'Do This Week',
  notNow: 'Not Now',
  releaseStatus: 'Release status',
  needsReview: 'Needs review',
  readyForParentReading: 'Ready for parent reading',
  draftReportOnly: 'Draft report only',
  fullReportLocked: 'Full report locked until payment',
  preview: 'Preview',
  currentPlan: 'Current plan',
  remainingCredits: 'Remaining one-time credits',
  goToBilling: 'Go To Billing',
  evidenceWillAppear: 'Evidence anchors will appear here when the extraction bundle is available.',
  chooseEvidence: 'Choose an evidence item to open the related page and anchor details.',
  reportIntro:
    'This report reads from the structured extraction layer so diagnosis, evidence, and the 7-day plan stay tied to the same verified facts.',
  reportLanguage: 'Report language',
  english: 'English',
  spanish: 'Spanish',
  lockedDescription:
    'The summary is visible, but Diagnosis, Evidence, Plan, and tutor sharing stay locked until billing is complete.',
  diagnosisPreviewUnavailable: 'Diagnosis preview unavailable.',
  diagnosisSummaryUnavailable: 'Diagnosis summary unavailable.',
  readiness: 'Readiness',
  unavailable: 'Unavailable',
  focusGuidanceUnavailable: 'Focus guidance unavailable.',
  noGuardrailProvided: 'No guardrail provided.',
  page: 'Page',
  anchors: 'anchors',
  problemTextUnavailable: 'Problem text unavailable.',
  highlightOverlay: 'Highlight Overlay',
  highlightFallback:
    'No bounding box was captured for this evidence item, so the viewer falls back to the source page and problem reference.',
  estimatedAnchorFor: 'Estimated anchor for',
  day: 'Day',
  done: 'Done',
  markDone: 'Mark Done',
  parentPromptLabel: 'Parent prompt',
  successSignalLabel: 'Success signal',
  unableToSaveDayProgress: 'Unable to save day progress.',
  practiceCoachingGuardrail:
    'Use the plan for practice coaching, not direct homework answers.',
  shareDescription: 'Create a read-only tutor link with no parent-only notes.',
  createTutorLink: 'Create Tutor Link',
  copyLatestLink: 'Copy Latest Link',
  shareLinkCopied: 'Share link copied.',
  shareLinkCreated: 'Tutor share link created.',
  shareLinkRevoked: 'Tutor share link revoked.',
  unableToCreateShareLink: 'Unable to create share link.',
  unableToRevokeShareLink: 'Unable to revoke share link.',
  noTutorLinks: 'No tutor links created yet.',
  copy: 'Copy',
  revoke: 'Revoke',
  revoked: 'Revoked',
  expires: 'Expires',
};

const ES_LABELS: ReportLabels = {
  parentReport: 'Informe para padres',
  diagnosisHeadline: 'Diagnostico, evidencia y siguientes pasos',
  diagnosis: 'Diagnostico',
  evidence: 'Evidencia',
  sevenDayPlan: 'Plan de 7 dias',
  reportSummary: 'Resumen del informe',
  child: 'Estudiante',
  grade: 'Grado',
  sourceType: 'Tipo de material',
  confidence: 'Confianza',
  backToDashboard: 'Volver al panel',
  shareWithTutor: 'Compartir con tutor',
  exportPdf: 'Exportar PDF',
  pageViewer: 'Visor de pagina',
  openSourcePage: 'Abrir pagina original',
  studentWork: 'Trabajo del estudiante',
  whyItMatters: 'Por que importa',
  doThisWeek: 'Hacer esta semana',
  notNow: 'Todavia no',
  releaseStatus: 'Estado de publicacion',
  needsReview: 'Necesita revision',
  readyForParentReading: 'Listo para lectura de padres',
  draftReportOnly: 'Solo borrador del informe',
  fullReportLocked: 'El informe completo esta bloqueado hasta completar el pago',
  preview: 'Vista previa',
  currentPlan: 'Plan actual',
  remainingCredits: 'Creditos individuales restantes',
  goToBilling: 'Ir a facturacion',
  evidenceWillAppear:
    'Las anclas de evidencia apareceran aqui cuando el paquete de extraccion este listo.',
  chooseEvidence:
    'Elige un elemento de evidencia para abrir la pagina relacionada y los detalles del ancla.',
  reportIntro:
    'Este informe usa la capa de extraccion estructurada para que el diagnostico, la evidencia y el plan de 7 dias sigan conectados a los mismos hechos verificados.',
  reportLanguage: 'Idioma del informe',
  english: 'Ingles',
  spanish: 'Espanol',
  lockedDescription:
    'El resumen sigue visible, pero Diagnostico, Evidencia, Plan y el envio al tutor quedan bloqueados hasta completar la facturacion.',
  diagnosisPreviewUnavailable: 'La vista previa del diagnostico no esta disponible.',
  diagnosisSummaryUnavailable: 'El resumen del diagnostico no esta disponible.',
  readiness: 'Estado general',
  unavailable: 'No disponible',
  focusGuidanceUnavailable: 'La orientacion principal no esta disponible.',
  noGuardrailProvided: 'No se agrego una guia de uso para este informe.',
  page: 'Pagina',
  anchors: 'anclas',
  problemTextUnavailable: 'El texto del problema no esta disponible.',
  highlightOverlay: 'Superposicion resaltada',
  highlightFallback:
    'No se capturo un cuadro delimitador para esta evidencia, asi que el visor vuelve a la pagina original y a la referencia del problema.',
  estimatedAnchorFor: 'Ancla estimada para',
  day: 'Dia',
  done: 'Hecho',
  markDone: 'Marcar hecho',
  parentPromptLabel: 'Guia para la familia',
  successSignalLabel: 'Senal de logro',
  unableToSaveDayProgress: 'No se pudo guardar el avance del dia.',
  practiceCoachingGuardrail:
    'Usa este plan para acompanar la practica, no para dar respuestas directas de tarea.',
  shareDescription:
    'Crea un enlace de solo lectura para el tutor sin notas privadas de la familia.',
  createTutorLink: 'Crear enlace para tutor',
  copyLatestLink: 'Copiar ultimo enlace',
  shareLinkCopied: 'Enlace copiado.',
  shareLinkCreated: 'Se creo el enlace para el tutor.',
  shareLinkRevoked: 'Se revoco el enlace para el tutor.',
  unableToCreateShareLink: 'No se pudo crear el enlace.',
  unableToRevokeShareLink: 'No se pudo revocar el enlace.',
  noTutorLinks: 'Todavia no hay enlaces para tutor.',
  copy: 'Copiar',
  revoke: 'Revocar',
  revoked: 'Revocado',
  expires: 'Vence',
};

const TRANSLATIONS = new Map<string, string>([
  ['Concept gap', 'Brecha conceptual'],
  ['Procedure gap', 'Brecha de procedimiento'],
  ['Calculation slip', 'Error de calculo'],
  ['Reading issue', 'Problema de lectura'],
  ['Notation error', 'Error de notacion'],
  ['Strategy error', 'Error de estrategia'],
  ['Careless slip', 'Descuido'],
  ['Incomplete reasoning', 'Razonamiento incompleto'],
  [
    'The student is missing the underlying concept, not just the procedure.',
    'El estudiante no domina el concepto base, no solo el procedimiento.',
  ],
  [
    'The student knows the concept but loses the correct step order.',
    'El estudiante entiende el concepto, pero pierde el orden correcto de los pasos.',
  ],
  [
    'The setup is mostly correct, but arithmetic execution slips.',
    'La configuracion es mayormente correcta, pero hay fallos en la ejecucion aritmetica.',
  ],
  [
    'The student appears to misread the prompt, units, or symbols.',
    'Parece que el estudiante interpreta mal la consigna, las unidades o los simbolos.',
  ],
  [
    'The student uses inconsistent signs, symbols, or formatting.',
    'El estudiante usa signos, simbolos o formato de manera inconsistente.',
  ],
  [
    'The student chooses an inefficient or mismatched solving strategy.',
    'El estudiante elige una estrategia poco eficiente o que no corresponde al problema.',
  ],
  [
    'The student likely knew the path but rushed a final detail.',
    'Probablemente el estudiante conocia el camino, pero apuro un detalle final.',
  ],
  [
    'The student started correctly but stopped before finishing the explanation.',
    'El estudiante empezo bien, pero se detuvo antes de completar la explicacion.',
  ],
  [
    'This report supports diagnosis and practice planning, not direct homework answers.',
    'Este informe sirve para diagnostico y planificacion de practica, no para dar respuestas directas de tarea.',
  ],
  [
    'Use the plan for practice coaching, not direct homework answers.',
    'Usa el plan para acompanar la practica, no para dar respuestas directas de tarea.',
  ],
  [
    'The upload is structurally processed, but the diagnosis needs more evidence before a stronger conclusion.',
    'La carga ya fue procesada, pero el diagnostico necesita mas evidencia antes de llegar a una conclusion mas solida.',
  ],
]);

export function isSpanishLocale(locale: string | null | undefined) {
  return (locale || '').toLowerCase().startsWith('es');
}

export function resolveReportLocale(
  requestedLocale: string | null | undefined,
  fallbackLocale: string | null | undefined
) {
  const normalized = (requestedLocale || fallbackLocale || 'en-US').toLowerCase();
  return normalized.startsWith('es') ? 'es-US' : 'en-US';
}

function translateToken(text: string) {
  return TRANSLATIONS.get(text) || text;
}

function translateParagraph(text: string) {
  let translated = translateToken(text);

  const replacements: Array<[RegExp, string]> = [
    [/Name the pattern behind (.+)\./, 'Identifica el patron detras de $1.'],
    [/Slow down the procedure for (.+)\./, 'Baja la velocidad del procedimiento para $1.'],
    [/Catch slips linked to (.+)\./, 'Detecta errores ligados a $1.'],
    [/Rehearse (.+) in a new context\./, 'Practica $1 en un contexto nuevo.'],
    [
      /Start by stabilizing (.+) before introducing harder mixed practice\./,
      'Empieza por estabilizar $1 antes de introducir practica mixta mas dificil.',
    ],
    [
      /Do not turn this report into direct homework answers or jump to harder packets before the repeated pattern settles\./,
      'No conviertas este informe en respuestas directas de tarea ni pases a materiales mas dificiles antes de estabilizar el patron repetido.',
    ],
    [/Draft report only: (.+)/, 'Solo borrador del informe: $1'],
    [/Improving: (.+)/, 'Mejorando: $1'],
    [/Still sticky: (.+)/, 'Sigue costando: $1'],
    [/Steady pattern: (.+)/, 'Patron estable: $1'],
    [/Focus shifted from (.+) to (.+)\./, 'El foco cambio de $1 a $2.'],
  ];

  for (const [pattern, replacement] of replacements) {
    translated = translated.replace(pattern, replacement);
  }

  translated = translated
    .replace(
      'Needs review before the full report is released.',
      'Necesita revision antes de publicar el informe completo.'
    )
    .replace('Ready for parent reading', 'Listo para lectura de padres')
    .replace('Needs review', 'Necesita revision')
    .replace('pattern', 'patron')
    .replace('sporadic', 'esporadico')
    .replace('high', 'alta')
    .replace('med', 'media')
    .replace('low', 'baja');

  return translated;
}

export function getReportLabels(locale: string | null | undefined) {
  return isSpanishLocale(locale) ? ES_LABELS : EN_LABELS;
}

export function localizeParentReport(
  parentReport: ParentReport,
  locale: string | null | undefined
): ParentReport {
  const resolvedLocale = resolveReportLocale(locale, parentReport.locale);
  if (!isSpanishLocale(resolvedLocale)) {
    return {
      ...parentReport,
      locale: 'en-US',
      labels: EN_LABELS,
    };
  }

  return {
    ...parentReport,
    locale: 'es-US',
    labels: ES_LABELS,
    summary: parentReport.summary ? translateParagraph(parentReport.summary) : parentReport.summary,
    doThisWeek: parentReport.doThisWeek
      ? translateParagraph(parentReport.doThisWeek)
      : parentReport.doThisWeek,
    notNow: parentReport.notNow ? translateParagraph(parentReport.notNow) : parentReport.notNow,
    reviewReason: parentReport.reviewReason
      ? translateParagraph(parentReport.reviewReason)
      : parentReport.reviewReason,
    reviewBanner: parentReport.reviewBanner
      ? translateParagraph(parentReport.reviewBanner)
      : parentReport.reviewBanner,
    guardrail: parentReport.guardrail
      ? translateParagraph(parentReport.guardrail)
      : parentReport.guardrail,
    topFindings: (parentReport.topFindings || []).map((finding) => ({
      ...finding,
      title: finding.title ? translateToken(finding.title) : finding.title,
      severity: finding.severity ? translateParagraph(finding.severity) : finding.severity,
      patternType: finding.patternType
        ? translateParagraph(finding.patternType)
        : finding.patternType,
      whatToDo: finding.whatToDo ? translateParagraph(finding.whatToDo) : finding.whatToDo,
      rationale: finding.rationale ? translateParagraph(finding.rationale) : finding.rationale,
      evidence: (finding.evidence || []).map((anchor) => ({
        ...anchor,
        highlightBox: anchor.highlightBox
          ? {
              ...anchor.highlightBox,
              label: anchor.highlightBox.label
                ? translateParagraph(anchor.highlightBox.label)
                : anchor.highlightBox.label,
            }
          : anchor.highlightBox,
      })),
    })),
    evidenceGroups: (parentReport.evidenceGroups || []).map((group) => ({
      ...group,
      displayName: group.displayName ? translateToken(group.displayName) : group.displayName,
      description: group.description ? translateParagraph(group.description) : group.description,
      severity: group.severity ? translateParagraph(group.severity) : group.severity,
      items: (group.items || []).map((item) => ({
        ...item,
        rationale: item.rationale ? translateParagraph(item.rationale) : item.rationale,
        highlightBox: item.highlightBox
          ? {
              ...item.highlightBox,
              label: item.highlightBox.label
                ? translateParagraph(item.highlightBox.label)
                : item.highlightBox.label,
            }
          : item.highlightBox,
      })),
    })),
    sevenDayPlan: (parentReport.sevenDayPlan || []).map((day) => ({
      ...day,
      goal: day.goal ? translateParagraph(day.goal) : day.goal,
      practice: day.practice ? translateParagraph(day.practice) : day.practice,
      parentPrompt: day.parentPrompt ? translateParagraph(day.parentPrompt) : day.parentPrompt,
      successSignal: day.successSignal
        ? translateParagraph(day.successSignal)
        : day.successSignal,
    })),
  };
}
