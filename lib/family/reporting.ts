import type { CanonicalExtractionBundle } from '@/lib/ai/extraction-schema';
import { composeDeepResearchReport } from '@/lib/family/report-composer';

type ChildSummary = {
  nickname: string;
  grade: string;
  curriculum: string;
};

type UploadSummary = {
  sourceType: string;
};

export function buildReportsFromExtraction(args: {
  bundle: CanonicalExtractionBundle;
  child: ChildSummary;
  upload: UploadSummary;
}) {
  const composed = composeDeepResearchReport(args);
  return {
    parentReportJson: composed.parentReportJson,
    studentReportJson: composed.studentReportJson,
    tutorReportJson: composed.tutorReportJson,
  };
}
