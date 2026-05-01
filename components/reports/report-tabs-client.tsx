import { AlertTriangle } from 'lucide-react';
import { CompareResumeTab } from '@/components/reports/CompareResumeTab';
import { DiagnosisTab } from '@/components/reports/DiagnosisTab';
import { EvidenceTab } from '@/components/reports/EvidenceTab';
import { OutputGatesTab } from '@/components/reports/OutputGatesTab';
import { PlanTab } from '@/components/reports/PlanTab';
import type { DeepResearchReportViewModel } from '@/components/reports/report-types';

type Props = {
  reportViewModel: DeepResearchReportViewModel;
  activeTab: 'diagnosis' | 'evidence' | 'plan' | 'output-gates' | 'compare';
};

export function ReportTabsClient({ reportViewModel, activeTab }: Props) {
  const labels = reportViewModel.labels || {};
  const reviewBanner = reportViewModel.review.reviewBanner;

  return (
    <div className="space-y-6">
      {reviewBanner ? (
        <section className="panel pad">
          <div className="flex items-start gap-3 text-sm text-amber-950">
            <AlertTriangle className="mt-0.5 h-4 w-4" />
            <div className="space-y-2">
              <p className="font-medium">{labels.draftReportOnly || 'Draft report only'}</p>
              <p>{reviewBanner}</p>
            </div>
          </div>
        </section>
      ) : null}

      {activeTab === 'diagnosis' ? <DiagnosisTab reportViewModel={reportViewModel} /> : null}
      {activeTab === 'evidence' ? (
        <EvidenceTab
          evidenceGroups={reportViewModel.parentReport.evidenceGroups || []}
          labels={labels}
        />
      ) : null}
      {activeTab === 'plan' ? (
        <PlanTab
          reportId={reportViewModel.reportId}
          sevenDayPlan={reportViewModel.plan.days || []}
          guardrail={reportViewModel.plan.guardrail}
          initialCompletedDays={reportViewModel.plan.completedDays || []}
          labels={labels}
        />
      ) : null}
      {activeTab === 'output-gates' ? (
        <OutputGatesTab
          reportViewModel={reportViewModel}
          labels={labels}
        />
      ) : null}
      {activeTab === 'compare' ? <CompareResumeTab reportViewModel={reportViewModel} /> : null}
    </div>
  );
}
