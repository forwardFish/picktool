import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ExportPdfButton } from '@/components/reports/ExportPdfButton';
import { ReportTabsClient } from '@/components/reports/report-tabs-client';
import { getUser } from '@/lib/db/queries';
import { getReportDetailData } from '@/lib/reports/get-report-detail-data';

type PageProps = {
  params: Promise<{ reportId: string }>;
  searchParams: Promise<{ locale?: string; tab?: string }>;
};

const reportTabs = [
  { id: 'diagnosis', label: 'Diagnosis' },
  { id: 'evidence', label: 'Evidence' },
  { id: 'plan', label: '7-Day Plan' },
  { id: 'output-gates', label: 'Output Gates' },
  { id: 'compare', label: 'Compare' },
] as const;

type ReportTabId = (typeof reportTabs)[number]['id'];

export default async function ReportPage({ params, searchParams }: PageProps) {
  const [{ reportId }, { locale: requestedLocale, tab }, user] = await Promise.all([
    params,
    searchParams,
    getUser(),
  ]);

  if (!user) {
    notFound();
  }

  const detail = await getReportDetailData(
    user.id,
    Number(reportId),
    requestedLocale,
    user.locale || 'en-US'
  );
  if (!detail) {
    notFound();
  }

  const matchedTab = reportTabs.find((item) => item.id === tab);
  const activeTab = matchedTab?.id ?? 'diagnosis';
  const learnerLabel =
    (detail.report as any).child?.nickname || detail.parentReport.childNickname || 'Learner';
  const sourceLabel =
    (detail.report as any).upload?.sourceType ||
    detail.parentReport.sourceType ||
    null;
  const reportDate = new Date((detail.report as any).createdAt || Date.now()).toLocaleDateString();
  const localizedTabs: ReadonlyArray<{ id: ReportTabId; label: string }> = [
    { id: 'diagnosis', label: detail.labels.diagnosis || 'Diagnosis' },
    { id: 'evidence', label: detail.labels.evidence || 'Evidence' },
    { id: 'plan', label: detail.labels.sevenDayPlan || '7-Day Plan' },
    { id: 'output-gates', label: 'Output Gates' },
    { id: 'compare', label: 'Compare' },
  ];

  return (
    <section className="space-y-6">
      <section className="panel pad">
        <div className="header-row">
          <div>
            <div className="breadcrumb">
              <Link href="/dashboard/reports" className="current">
                Reports
              </Link>
              <span>/</span>
              <span>{learnerLabel}</span>
              <span>/</span>
              <span>
                {detail.parentReport.topFindings?.[0]?.title || detail.labels.diagnosisHeadline}
              </span>
            </div>
            <h2>{`${learnerLabel} diagnosis report`}</h2>
            <p className="muted" style={{ marginTop: 10 }}>
              {detail.parentReport.summary ||
                detail.parentReport.doThisWeek ||
                'Review the diagnosis, evidence, and plan before deciding the next move.'}{' '}
              Created {reportDate}
              {sourceLabel ? `. Source: ${sourceLabel}.` : '.'}
            </p>
            <p className="muted" style={{ marginTop: 10 }}>
              Share state: {detail.shareState.hasActiveShare ? 'active link exists' : 'no active share yet'}
              {' / '}
              Quality gate: {detail.qualityGate.releaseStatus || 'pending'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            {detail.qualityGate.releaseStatus ? (
              <span className="tag green">
                {detail.qualityGate.releaseStatus.replace('_', ' ')}
              </span>
            ) : null}
            {detail.isUnlocked ? (
              <ExportPdfButton
                reportId={Number(reportId)}
                label={detail.labels.exportPdf}
                locale={detail.locale}
              />
            ) : null}
            <Link className="btn btn-secondary" href="/dashboard/tutor">
              Share
            </Link>
            {detail.isUnlocked && (!detail.deck || detail.deck.deck.walkthroughVisibility !== 'hidden') ? (
              <Link className="btn btn-secondary" href={`/dashboard/reports/${reportId}/play`}>
                Guided Walkthrough
              </Link>
            ) : null}
            <Link className="btn btn-primary" href="/dashboard/reports">
              Back to Reports
            </Link>
          </div>
        </div>

        {detail.isUnlocked ? (
          <div className="tabs">
            {localizedTabs.map((item) => (
              <div key={item.id} className={`tab ${activeTab === item.id ? 'active' : ''}`}>
                <Link href={`/dashboard/reports/${reportId}?tab=${item.id}`}>{item.label}</Link>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      {!detail.isUnlocked ? (
        <section className="panel pad">
          <h3>{detail.labels.fullReportLocked}</h3>
          <p className="subhead">{detail.labels.lockedDescription}</p>
          <div className="bottom-nav">
            <Link className="btn btn-primary" href="/dashboard/billing">
              {detail.labels.goToBilling}
            </Link>
          </div>
        </section>
      ) : (
        <ReportTabsClient reportViewModel={detail.reportViewModel} activeTab={activeTab} />
      )}
    </section>
  );
}
