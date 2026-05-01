'use client';

import { useMemo, useState } from 'react';
import { FileSearch } from 'lucide-react';
import { PageViewer } from '@/components/reports/PageViewer';
import type { EvidenceGroup, EvidenceItem } from '@/components/reports/report-types';

type Props = {
  evidenceGroups: EvidenceGroup[];
  labels?: Record<string, string>;
};

export function EvidenceTab({ evidenceGroups, labels = {} }: Props) {
  const firstItem = useMemo(() => {
    for (const group of evidenceGroups) {
      if (group.items && group.items.length > 0) {
        return group.items[0];
      }
    }
    return null;
  }, [evidenceGroups]);
  const [selectedItem, setSelectedItem] = useState<EvidenceItem | null>(firstItem);

  if (evidenceGroups.length === 0) {
    return (
      <div className="pn-section-card">
        <div className="flex items-center gap-3 text-sm text-[var(--pn-muted)]">
          <FileSearch className="h-4 w-4" />
          <p>
            {labels.evidenceWillAppear ||
              'Evidence anchors will appear here when the extraction bundle is available.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-4">
        {evidenceGroups.map((group, groupIndex) => (
          <div key={`${group.code}-${groupIndex}`} className="pn-section-card">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xl font-black tracking-[-0.03em] text-[#111827]">
                {group.displayName || 'Evidence group'}
              </p>
              {typeof group.count === 'number' ? (
                <span className="rounded-full bg-[var(--pn-soft)] px-3 py-1 text-xs font-semibold text-[var(--pn-violet)]">
                  {group.count} {labels.anchors || 'anchors'}
                </span>
              ) : null}
              {group.severity ? (
                <span className="pn-status-pill" data-status="needs_review">
                  {group.severity}
                </span>
              ) : null}
            </div>
            <p className="mt-3 text-sm leading-7 text-[var(--pn-muted)]">{group.description}</p>

            <div className="mt-5 space-y-3">
              {(group.items || []).map((item, itemIndex) => {
                const isSelected =
                  selectedItem?.pageId === item.pageId &&
                  selectedItem?.problemNo === item.problemNo;
                return (
                  <button
                    key={`${item.pageId}-${item.problemNo}-${itemIndex}`}
                    type="button"
                    onClick={() => setSelectedItem(item)}
                    className={`w-full rounded-[1.3rem] border p-4 text-left transition ${
                      isSelected
                        ? 'border-[var(--pn-soft-border)] bg-[var(--pn-soft)]'
                        : 'border-[var(--pn-border)] bg-white hover:border-[var(--pn-soft-border)]'
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-[#111827]">
                      <span>
                        {labels.page || 'Page'} {item.pageNo}
                      </span>
                      <span>{item.problemNo}</span>
                      {item.previewLabel ? (
                        <span className="rounded-full bg-white px-2.5 py-1 text-xs text-[#52525b] shadow-sm">
                          {item.previewLabel}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-3 text-sm leading-7 text-[var(--pn-muted-2)]">
                      {item.problemText ||
                        labels.problemTextUnavailable ||
                        'Problem text unavailable.'}
                    </p>
                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <div className="rounded-[1rem] border border-[var(--pn-border)] bg-white p-3">
                        <p className="pn-muted-label">{labels.studentWork || 'Student work'}</p>
                        <p className="mt-2 text-sm leading-7 text-[var(--pn-muted-2)]">
                          {item.studentWork}
                        </p>
                      </div>
                      <div className="rounded-[1rem] border border-[var(--pn-border)] bg-white p-3">
                        <p className="pn-muted-label">{labels.whyItMatters || 'Why it matters'}</p>
                        <p className="mt-2 text-sm leading-7 text-[var(--pn-muted-2)]">
                          {item.rationale}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <PageViewer item={selectedItem} labels={labels} />
    </div>
  );
}
