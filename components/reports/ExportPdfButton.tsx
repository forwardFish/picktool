'use client';

import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
  reportId: number;
  label?: string;
  locale?: string;
};

export function ExportPdfButton({ reportId, label = 'Export PDF', locale }: Props) {
  const href = locale
    ? `/api/reports/${reportId}/export?locale=${encodeURIComponent(locale)}`
    : `/api/reports/${reportId}/export`;

  return (
    <Button asChild variant="outline">
      <a href={href} target="_blank" rel="noreferrer">
        <Download className="mr-2 h-4 w-4" />
        {label}
      </a>
    </Button>
  );
}
