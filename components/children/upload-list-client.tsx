'use client';

import { useState } from 'react';
import { DeleteResourceButton } from '@/components/ui/delete-resource-button';

type UploadItem = {
  id: number;
  totalPages: number;
  sourceType: string;
  status: string;
};

type Props = {
  uploads: UploadItem[];
};

export function UploadListClient({ uploads }: Props) {
  const [items, setItems] = useState(uploads);

  if (items.length === 0) {
    return (
      <p className="text-sm text-gray-600">
        No uploads yet. Start with a 5-10 page packet to create the first diagnosis run.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {items.slice(0, 4).map((upload) => (
        <div key={upload.id} className="rounded-2xl border border-gray-200 p-4 text-sm text-gray-700">
          <p className="font-medium text-gray-900">Upload #{upload.id}</p>
          <p className="mt-1">
            {upload.totalPages} pages / {upload.sourceType} / {upload.status}
          </p>
          <div className="mt-3">
            <DeleteResourceButton
              endpoint={`/api/uploads/${upload.id}`}
              label="Delete Upload"
              pendingLabel="Deleting upload..."
              confirmMessage="Delete this upload and every linked run, report, share link, and artifact?"
              onDeleted={() =>
                setItems((current) => current.filter((item) => item.id !== upload.id))
              }
            />
          </div>
        </div>
      ))}
    </div>
  );
}
