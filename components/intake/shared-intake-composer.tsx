'use client';

import { ChangeEvent, useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2, Paperclip, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { clearIntakeDraft, readIntakeDraft, saveIntakeDraft } from '@/lib/intake/draft-store';
import {
  ACCEPTED_INTAKE_FILE_TYPES,
  INTAKE_FILE_HELPER_TEXT,
  INTAKE_RESTORE_FAILED_MESSAGE,
  INTAKE_RESTORED_MESSAGE,
  buildDraftFile,
  buildPageDrafts,
  revokeDraftFileUrls,
  type DraftFile,
} from '@/components/intake/intake-file-utils';

type Props = {
  childId?: number;
  childNickname?: string;
  resumeDraft?: boolean;
  variant: 'landing' | 'overview';
};

export function SharedIntakeComposer({ childId, childNickname, resumeDraft = false, variant }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [notes, setNotes] = useState('');
  const [draftFiles, setDraftFiles] = useState<DraftFile[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  const helperLabel = useMemo(() => {
    if (draftFiles.length === 0) {
      return INTAKE_FILE_HELPER_TEXT;
    }
    if (draftFiles.length === 1) {
      return draftFiles[0].file.name;
    }
    return `${draftFiles.length} files selected`;
  }, [draftFiles]);

  const totalPages = draftFiles.reduce((sum, draftFile) => sum + draftFile.pageCount, 0);
  const isAuthenticated = typeof childId === 'number';

  useEffect(() => {
    if (!resumeDraft) {
      return;
    }

    let isActive = true;

    readIntakeDraft()
      .then(async (draft) => {
        if (!isActive || !draft) {
          setError(INTAKE_RESTORE_FAILED_MESSAGE);
          return;
        }

        const restoredFiles = await Promise.all(draft.files.map((file) => buildDraftFile(file)));

        if (!isActive) {
          revokeDraftFileUrls(restoredFiles);
          return;
        }

        setNotes(draft.notes);
        setDraftFiles((current) => {
          revokeDraftFileUrls(current);
          return restoredFiles;
        });
        setMessage(INTAKE_RESTORED_MESSAGE);
      })
      .catch(() => {
        if (isActive) {
          setError(INTAKE_RESTORE_FAILED_MESSAGE);
        }
      });

    return () => {
      isActive = false;
    };
  }, [resumeDraft]);

  function openFilePicker() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files || []);
    event.target.value = '';

    if (selectedFiles.length === 0) {
      return;
    }

    setError('');

    try {
      const nextDrafts = await Promise.all(selectedFiles.map((file) => buildDraftFile(file)));
      setDraftFiles(nextDrafts);
    } catch {
      setError('We could not prepare one of the selected files. Try a different image or PDF.');
    }
  }

  async function persistDraft() {
    await saveIntakeDraft({
      notes,
      sourceType: 'quiz',
      diagnosticGoal: notes,
      recentTrend: '',
      parentConcerns: '',
      teacherFeedbackPresent: false,
      hasTutor: false,
      files: draftFiles.map((draftFile) => draftFile.file),
    });
  }

  async function submitAuthenticatedDraft() {
    if (!childId) {
      return;
    }

    if (draftFiles.length === 0) {
      setError('Select at least one file before continuing.');
      return;
    }

    if (totalPages < 5 || totalPages > 10) {
      setError('The total page count must be between 5 and 10.');
      return;
    }

    setError('');

    startTransition(async () => {
      const formData = new FormData();
      formData.append('childId', String(childId));
      formData.append('sourceType', 'quiz');
      formData.append('notes', notes);
      formData.append('diagnosticGoal', notes);
      formData.append('recentTrend', '');
      formData.append('parentConcernJson', JSON.stringify([]));
      formData.append('teacherFeedbackPresent', 'false');
      formData.append('hasTutor', 'false');
      formData.append('pageDrafts', JSON.stringify(buildPageDrafts(draftFiles)));

      draftFiles.forEach((draftFile) => {
        formData.append('files', draftFile.file);
      });

      const uploadResponse = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      });
      const uploadPayload = await uploadResponse.json();

      if (!uploadResponse.ok) {
        setError(uploadPayload.error || 'Upload creation failed.');
        return;
      }

      const submitResponse = await fetch(`/api/uploads/${uploadPayload.upload.id}/start-diagnosis`, {
        method: 'POST',
      });
      const submitPayload = await submitResponse.json();

      if (!submitResponse.ok) {
        setError(submitPayload.error || 'Run creation failed.');
        return;
      }

      await clearIntakeDraft();
      router.push(`/dashboard/runs/${submitPayload.runId}`);
      router.refresh();
    });
  }

  function handleAnalyze() {
    startTransition(async () => {
      if (!isAuthenticated) {
        await persistDraft();
        setMessage('Login required to continue diagnosis.');
        router.push('/sign-up?redirect=/dashboard%3FresumeDraft%3D1');
        return;
      }

      await submitAuthenticatedDraft();
    });
  }

  return (
    <div className="rounded-[1.7rem] border border-[#dfe4ec] bg-[#fcfcfe] px-6 py-7 sm:px-8 sm:py-8">
      <textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        className="min-h-[150px] w-full resize-none rounded-[1.45rem] border border-[#dfe4ec] bg-white px-5 py-5 font-mono text-[1rem] leading-[2] tracking-[0.01em] text-[#334155] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] outline-none transition focus:border-[var(--pn-violet)] focus:ring-4 focus:ring-[rgba(124,58,237,0.10)] sm:text-[1.08rem]"
        placeholder={`Example: ${
          childNickname || 'My child'
        } understands the ideas in class, but still breaks down on mixed schoolwork. I want to know the real bottleneck and what we should focus on this week.`}
      />

      <div className="mt-8 border-t border-[#e4e7ee] pt-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={openFilePicker}
              className="flex items-center gap-4 rounded-[1.35rem] border border-[var(--pn-soft-border)] bg-[linear-gradient(180deg,#f2efff_0%,#f8f7ff_100%)] px-5 py-5 text-left shadow-[0_12px_30px_rgba(124,58,237,0.08)] transition hover:-translate-y-0.5"
            >
              <div className="grid h-16 w-16 place-items-center rounded-[1.15rem] bg-white text-[var(--pn-violet)] shadow-[0_10px_24px_rgba(124,58,237,0.14)]">
                <Upload className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[1.02rem] font-black tracking-[-0.02em] text-[#111827]">
                  Upload Files
                </p>
                <p className="mt-1 text-sm leading-7 text-[var(--pn-muted)] sm:text-base">
                  {helperLabel}
                </p>
              </div>
            </button>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={openFilePicker}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--pn-soft-border)] bg-white px-4 py-2 text-sm font-semibold text-[var(--pn-violet)]"
              >
                <Paperclip className="h-4 w-4" />
                Attach image or PDF
              </button>
              {draftFiles.length > 0 ? (
                <span className="inline-flex items-center rounded-full bg-[var(--pn-soft)] px-4 py-2 text-sm font-semibold text-[var(--pn-muted-2)]">
                  {draftFiles.length} file{draftFiles.length === 1 ? '' : 's'} ready
                </span>
              ) : null}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPTED_INTAKE_FILE_TYPES}
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <Button
            type="button"
            size="lg"
            className="h-14 rounded-[1.2rem] px-8 text-[1.05rem]"
            onClick={handleAnalyze}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Continuing...
              </>
            ) : variant === 'overview' ? (
              'Continue Diagnosis'
            ) : (
              'Analyze & Get Plan'
            )}
            {!isPending ? <ArrowRight className="h-4 w-4" /> : null}
          </Button>
        </div>
      </div>

      {message ? (
        <div className="mt-4 rounded-[1rem] border border-[var(--pn-soft-border)] bg-white p-4 text-sm font-semibold text-[var(--pn-violet)]">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="mt-4 rounded-[1rem] border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}
    </div>
  );
}
