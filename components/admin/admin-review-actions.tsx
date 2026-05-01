'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

type Props = {
  runId: number;
  runStatus: string;
  initialSummary: string;
  initialDoThisWeek: string;
  initialNotNow: string;
  initialReviewBanner: string;
  initialRequestMessage: string;
};

export function AdminReviewActions({
  runId,
  runStatus,
  initialSummary,
  initialDoThisWeek,
  initialNotNow,
  initialReviewBanner,
  initialRequestMessage,
}: Props) {
  const router = useRouter();
  const [summary, setSummary] = useState(initialSummary);
  const [doThisWeek, setDoThisWeek] = useState(initialDoThisWeek);
  const [notNow, setNotNow] = useState(initialNotNow);
  const [reviewBanner, setReviewBanner] = useState(initialReviewBanner);
  const [requestMessage, setRequestMessage] = useState(initialRequestMessage);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [pendingAction, setPendingAction] = useState<
    '' | 'save' | 'approve' | 'request'
  >('');

  async function saveDisplayCopy() {
    setPendingAction('save');
    setStatusMessage('');
    setErrorMessage('');

    try {
      const response = await fetch(`/api/admin/review/${runId}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          summary,
          doThisWeek,
          notNow,
          reviewBanner,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setErrorMessage(payload.error || 'Unable to save review copy.');
        return;
      }

      setStatusMessage('Display copy saved without changing structured findings.');
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to save review copy.');
    } finally {
      setPendingAction('');
    }
  }

  async function approveReview() {
    setPendingAction('approve');
    setStatusMessage('');
    setErrorMessage('');

    try {
      const response = await fetch(`/api/admin/review/${runId}/approve`, {
        method: 'POST',
      });
      const payload = await response.json();

      if (!response.ok) {
        setErrorMessage(payload.error || 'Unable to approve this review.');
        return;
      }

      router.push('/admin/review');
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to approve this review.');
    } finally {
      setPendingAction('');
    }
  }

  async function requestMorePhotos() {
    setPendingAction('request');
    setStatusMessage('');
    setErrorMessage('');

    try {
      const response = await fetch(`/api/admin/review/${runId}/request-more-photos`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          message: requestMessage,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        setErrorMessage(payload.error || 'Unable to request more photos.');
        return;
      }

      setReviewBanner(`Draft report only: ${requestMessage.trim()}`);
      setStatusMessage('The parent-facing draft now asks for more photos before release.');
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to request more photos.'
      );
    } finally {
      setPendingAction('');
    }
  }

  const reviewLocked = runStatus !== 'needs_review';

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="review-banner">Parent review banner</Label>
        <Input
          id="review-banner"
          value={reviewBanner}
          onChange={(event) => setReviewBanner(event.target.value)}
          placeholder="Draft report only: Manual review copy goes here."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="summary">Summary copy</Label>
        <Textarea
          id="summary"
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="do-this-week">Do this week</Label>
        <Textarea
          id="do-this-week"
          value={doThisWeek}
          onChange={(event) => setDoThisWeek(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="not-now">Not now</Label>
        <Textarea
          id="not-now"
          value={notNow}
          onChange={(event) => setNotNow(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="request-more-photos">Request more photos message</Label>
        <Textarea
          id="request-more-photos"
          value={requestMessage}
          onChange={(event) => setRequestMessage(event.target.value)}
          placeholder="Please re-upload two brighter, straight-on pages so we can confirm the diagnosis."
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={saveDisplayCopy} disabled={pendingAction !== ''}>
          {pendingAction === 'save' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Display Copy'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={requestMorePhotos}
          disabled={pendingAction !== '' || reviewLocked}
        >
          {pendingAction === 'request' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Requesting...
            </>
          ) : (
            'Request More Photos'
          )}
        </Button>
        <Button
          type="button"
          onClick={approveReview}
          disabled={pendingAction !== '' || reviewLocked}
        >
          {pendingAction === 'approve' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Approving...
            </>
          ) : (
            'Approve Review'
          )}
        </Button>
      </div>

      {statusMessage ? <p className="text-sm text-emerald-700">{statusMessage}</p> : null}
      {errorMessage ? <p className="text-sm text-red-700">{errorMessage}</p> : null}
      {reviewLocked ? (
        <p className="text-sm text-gray-600">
          This run is no longer waiting for review, so queue actions are disabled.
        </p>
      ) : null}
    </div>
  );
}
