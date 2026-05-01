'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, ChevronRight, FileSearch, Grid2x2 } from 'lucide-react';

type SubjectCard = {
  title: string;
  subtitle: string;
  progress: number;
  progressLabel: string;
  statusLabel: string;
  tone: 'violet' | 'blue' | 'amber';
  mostRecentFocus: string;
};

type ReportCard = {
  id: number;
  title: string;
  createdAtLabel: string;
  statusLabel: string;
  statusTone: string;
};

type CurrentRun = {
  statusLabel: string;
  statusMessage: string | null;
};

type MemberTabsProps = {
  childId: number;
  subjectCards: SubjectCard[];
  reports: ReportCard[];
  recentCompletedReports: ReportCard[];
  currentRun: CurrentRun | null;
};

export function MemberTabs({
  childId: _childId,
  subjectCards,
  reports,
  recentCompletedReports: _recentCompletedReports,
  currentRun: _currentRun,
}: MemberTabsProps) {
  const [activeTab, setActiveTab] = useState<'subjects' | 'reports'>('subjects');

  return (
    <>
      <div className="member-tabbar">
        <button
          type="button"
          onClick={() => setActiveTab('subjects')}
          className={`member-tab ${activeTab === 'subjects' ? 'active' : ''}`}
        >
          Subjects
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('reports')}
          className={`member-tab ${activeTab === 'reports' ? 'active' : ''}`}
        >
          Reports
        </button>
      </div>

      {activeTab === 'subjects' ? (
        <section className="member-content-card">
          <div className="member-section-header">
            <h3>Subjects ({subjectCards.length})</h3>
            <span className="member-section-action">Manage</span>
          </div>

          <div className="member-list">
            {subjectCards.map((subject) => (
              <div key={subject.title} className="member-list-row">
                <div className="member-row-main">
                  <div
                    className={`subject-icon ${
                      subject.tone === 'blue'
                        ? 'blue'
                        : subject.tone === 'amber'
                          ? 'amber'
                          : 'violet'
                    }`}
                  >
                    {subject.tone === 'blue' ? (
                      <BookOpen className="h-6 w-6" />
                    ) : (
                      <Grid2x2 className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <div className="member-row-title">{subject.title}</div>
                    <div className="member-row-subtitle">{subject.subtitle}</div>
                    <div className="member-row-subtitle">{subject.mostRecentFocus}</div>
                  </div>
                </div>

                <div className="member-progress-block">
                  <div>
                    <span className="member-progress-label">{subject.progressLabel}</span>
                    <span className="member-progress-value">{subject.progress}%</span>
                  </div>
                  <div>
                    <div className="member-progress-line">
                      <span style={{ width: `${subject.progress}%` }} />
                    </div>
                    <div className="member-status">
                      <i />
                      <span>{subject.statusLabel}</span>
                    </div>
                  </div>
                </div>

                <button type="button" className="member-row-arrow" aria-label={`Open ${subject.title}`}>
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="member-content-card">
          <div className="member-section-header">
            <h3>Reports ({reports.length})</h3>
            <span className="member-section-action">View all</span>
          </div>

          <div className="member-report-list">
            {reports.length > 0 ? (
              reports.slice(0, 5).map((report) => (
                <Link key={report.id} href={`/dashboard/reports/${report.id}`} className="block">
                  <div className="member-report-row">
                    <div className="member-row-main">
                      <div className="report-icon">
                        <FileSearch className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="member-row-title">{report.title}</div>
                        <div className="member-row-subtitle">{report.createdAtLabel} / Report</div>
                      </div>
                    </div>

                    <div>
                      <span
                        className={
                          report.statusTone === 'completed'
                            ? 'member-completed-badge'
                            : 'inline-flex h-8 items-center rounded-full border border-[#e5e7eb] bg-[#f4f5f7] px-3.5 text-[13px] font-semibold text-[#667085]'
                        }
                      >
                        {report.statusLabel}
                      </span>
                    </div>

                    <button type="button" className="member-row-arrow" aria-label={`Open ${report.title}`}>
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </Link>
              ))
            ) : (
              <div className="py-4 text-sm text-[var(--pn-muted)]">
                No reports yet. Start the first diagnosis run for this child.
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}
