'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
  endpoint: string;
  label: string;
  pendingLabel: string;
  confirmMessage: string;
  redirectHref?: string;
  onDeleted?: () => void;
};

export function DeleteResourceButton({
  endpoint,
  label,
  pendingLabel,
  confirmMessage,
  redirectHref,
  onDeleted,
}: Props) {
  const router = useRouter();
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    if (!window.confirm(confirmMessage)) {
      return;
    }

    startTransition(async () => {
      const response = await fetch(endpoint, {
        method: 'DELETE',
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setError(payload?.error || 'Delete failed.');
        return;
      }

      setError('');
      onDeleted?.();

      if (redirectHref) {
        router.push(redirectHref);
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="destructive"
        onClick={handleDelete}
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {pendingLabel}
          </>
        ) : (
          label
        )}
      </Button>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </div>
  );
}
