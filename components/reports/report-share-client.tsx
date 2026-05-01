'use client';

import { useState, useTransition } from 'react';
import { Copy, Link2, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type ShareLinkRecord = {
  id: number;
  token: string;
  expiresAt: string;
  revokedAt: string | null;
};

type Props = {
  reportId: number;
  initialShareLinks: ShareLinkRecord[];
  labels?: Record<string, string>;
};

function buildShareUrl(token: string) {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/share/${token}`;
  }
  return `/share/${token}`;
}

export function ReportShareClient({
  reportId,
  initialShareLinks,
  labels = {},
}: Props) {
  const [shareLinks, setShareLinks] = useState(initialShareLinks);
  const [lastCreatedUrl, setLastCreatedUrl] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isPending, startTransition] = useTransition();

  function createShareLink() {
    startTransition(async () => {
      const response = await fetch(`/api/reports/${reportId}/share`, {
        method: 'POST',
      });
      const payload = await response.json();
      if (!response.ok) {
        setFeedback(
          payload.error ||
            labels.unableToCreateShareLink ||
            'Unable to create share link.'
        );
        return;
      }

      setShareLinks((current) => [payload, ...current]);
      setLastCreatedUrl(payload.shareUrl || buildShareUrl(payload.token));
      setFeedback(labels.shareLinkCreated || 'Tutor-ready share summary created.');
    });
  }

  function revokeShareLink(token: string) {
    startTransition(async () => {
      const response = await fetch(
        `/api/reports/${reportId}/share?token=${encodeURIComponent(token)}`,
        { method: 'DELETE' }
      );
      const payload = await response.json();
      if (!response.ok) {
        setFeedback(
          payload.error ||
            labels.unableToRevokeShareLink ||
            'Unable to revoke share link.'
        );
        return;
      }

      setShareLinks((current) =>
        current.map((item) =>
          item.token === token ? { ...item, revokedAt: payload.revokedAt } : item
        )
      );
      setFeedback(labels.shareLinkRevoked || 'Tutor-ready share summary revoked.');
    });
  }

  async function copyShareUrl(token: string) {
    const shareUrl = buildShareUrl(token);
    await navigator.clipboard.writeText(shareUrl);
    setFeedback(labels.shareLinkCopied || 'Share link copied.');
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-4 w-4" />
          {labels.shareWithTutor || 'Tutor-ready Share Summary'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-gray-700">
        <p>
          {labels.shareDescription ||
            'Create a read-only tutor-ready share summary with no parent-only notes.'}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={createShareLink} disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Working...
              </>
            ) : (
              labels.createTutorLink || 'Create Tutor-ready Summary'
            )}
          </Button>
          {lastCreatedUrl ? (
            <Button
              type="button"
              variant="outline"
              onClick={async () => {
                await navigator.clipboard.writeText(lastCreatedUrl);
                setFeedback(labels.shareLinkCopied || 'Share link copied.');
              }}
            >
              <Copy className="mr-2 h-4 w-4" />
              {labels.copyLatestLink || 'Copy Latest Link'}
            </Button>
          ) : null}
        </div>

        {feedback ? <p className="text-xs text-gray-500">{feedback}</p> : null}

        <div className="space-y-3">
          {shareLinks.length > 0 ? (
            shareLinks.map((shareLink) => {
              const isRevoked = Boolean(shareLink.revokedAt);
              return (
                <div key={shareLink.id} className="rounded-2xl border border-gray-200 p-4">
                  <p className="font-medium text-gray-900">{buildShareUrl(shareLink.token)}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {labels.expires || 'Expires'}{' '}
                    {new Date(shareLink.expiresAt).toLocaleString()}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => copyShareUrl(shareLink.token)}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      {labels.copy || 'Copy'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isRevoked}
                      onClick={() => revokeShareLink(shareLink.token)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      {isRevoked
                        ? labels.revoked || 'Revoked'
                        : labels.revoke || 'Revoke'}
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-gray-600">
              {labels.noTutorLinks || 'No tutor-ready share summaries created yet.'}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
