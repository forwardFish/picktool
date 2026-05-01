import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { EvidenceItem } from '@/components/reports/report-types';

type Props = {
  item: EvidenceItem | null;
  labels?: Record<string, string>;
};

export function PageViewer({ item, labels = {} }: Props) {
  if (!item?.pageId) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-gray-600">
          {labels.chooseEvidence ||
            'Choose an evidence item to open the related page and anchor details.'}
        </CardContent>
      </Card>
    );
  }

  const artifactUrl = `/api/pages/${item.pageId}/artifact`;
  const pdfViewerUrl = `${artifactUrl}#page=${item.pageNo || 1}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{labels.pageViewer || 'Page Viewer'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700">
          <span className="rounded-full bg-gray-100 px-3 py-1">
            {labels.page || 'Page'} {item.pageNo}
          </span>
          <span className="rounded-full bg-gray-100 px-3 py-1">{item.problemNo}</span>
          {item.previewLabel ? (
            <span className="rounded-full bg-slate-100 px-3 py-1">{item.previewLabel}</span>
          ) : null}
          <Button asChild size="sm" variant="outline">
            <a href={pdfViewerUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              {labels.openSourcePage || 'Open Source Page'}
            </a>
          </Button>
        </div>

        {item.highlightBox ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-amber-700">
              {labels.highlightOverlay || 'Highlight Overlay'}
            </p>
            <div className="mt-3 rounded-2xl border border-gray-200 bg-white p-3">
              <div className="relative mx-auto aspect-[8.5/11] max-w-sm rounded-xl border border-gray-200 bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)]">
                <div className="absolute inset-x-6 top-[10%] h-3 rounded-full bg-slate-100" />
                <div className="absolute inset-x-6 top-[18%] h-3 rounded-full bg-slate-100" />
                <div className="absolute inset-x-6 top-[26%] h-3 rounded-full bg-slate-100" />
                <div className="absolute inset-x-6 top-[34%] h-3 rounded-full bg-slate-100" />
                <div
                  className="absolute rounded-lg border-2 border-amber-500 bg-amber-200/50 shadow-[0_0_0_3px_rgba(251,191,36,0.15)]"
                  style={{
                    left: `${item.highlightBox.x}%`,
                    top: `${item.highlightBox.y}%`,
                    width: `${item.highlightBox.width}%`,
                    height: `${item.highlightBox.height}%`,
                  }}
                />
              </div>
              <p className="mt-3 text-xs text-gray-600">
                {item.highlightBox.label ||
                  `${labels.estimatedAnchorFor || 'Estimated anchor for'} ${item.problemNo} on ${labels.page || 'page'} ${item.pageNo}.`}
              </p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-700">
            {labels.highlightFallback ||
              'No bounding box was captured for this evidence item, so the viewer falls back to the source page and problem reference.'}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <iframe
            title={`Page ${item.pageNo} preview`}
            src={pdfViewerUrl}
            className="h-[520px] w-full"
          />
        </div>
      </CardContent>
    </Card>
  );
}
