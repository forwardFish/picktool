'use client';

import { ChangeEvent, DragEvent, useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AlertCircle, FileUp, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  clearIntakeDraft,
  readIntakeDraft,
} from '@/lib/intake/draft-store';
import { uploadSourceTypeOptions } from '@/lib/family/options';
import type { PageQualityFlags } from '@/lib/family/types';
import {
  ACCEPTED_INTAKE_FILE_TYPES,
  INTAKE_RESTORE_FAILED_MESSAGE,
  INTAKE_RESTORED_MESSAGE,
  buildDraftFile,
  buildPageDrafts,
  revokeDraftFileUrls,
  type DraftFile,
} from '@/components/intake/intake-file-utils';

type Props = {
  childId: number;
  childNickname: string;
  resumeDraft?: boolean;
};

function issueChips(flags: PageQualityFlags) {
  return [
    flags.blurry ? 'Blurry' : null,
    flags.rotated ? 'Rotated' : null,
    flags.dark ? 'Dark' : null,
    flags.lowContrast ? 'Low contrast' : null,
  ].filter(Boolean) as string[];
}

export function UploadWorkspace({ childId, childNickname, resumeDraft = false }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [draftFiles, setDraftFiles] = useState<DraftFile[]>([]);
  const [sourceType, setSourceType] = useState('quiz');
  const [notes, setNotes] = useState('');
  const [diagnosticGoal, setDiagnosticGoal] = useState('');
  const [recentTrend, setRecentTrend] = useState('');
  const [parentConcerns, setParentConcerns] = useState('');
  const [teacherFeedbackPresent, setTeacherFeedbackPresent] = useState(false);
  const [hasTutor, setHasTutor] = useState(false);
  const [error, setError] = useState('');
  const [restoreMessage, setRestoreMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  const totalPages = draftFiles.reduce((sum, draftFile) => sum + draftFile.pageCount, 0);
  const isPageCountInvalid = totalPages < 5 || totalPages > 10;

  useEffect(() => {
    if (!resumeDraft) {
      return;
    }

    let isActive = true;

    readIntakeDraft()
      .then(async (draft) => {
        if (!isActive || !draft) {
          setRestoreMessage(INTAKE_RESTORE_FAILED_MESSAGE);
          return;
        }

        const restoredFiles = await Promise.all(draft.files.map((file) => buildDraftFile(file)));

        if (!isActive) {
          revokeDraftFileUrls(restoredFiles);
          return;
        }

        setNotes(draft.notes);
        setSourceType(draft.sourceType);
        setDiagnosticGoal(draft.diagnosticGoal);
        setRecentTrend(draft.recentTrend);
        setParentConcerns(draft.parentConcerns);
        setTeacherFeedbackPresent(draft.teacherFeedbackPresent);
        setHasTutor(draft.hasTutor);
        setDraftFiles((current) => {
          revokeDraftFileUrls(current);
          return restoredFiles;
        });
        setRestoreMessage(INTAKE_RESTORED_MESSAGE);
      })
      .catch(() => {
        if (isActive) {
          setRestoreMessage(INTAKE_RESTORE_FAILED_MESSAGE);
        }
      });

    return () => {
      isActive = false;
    };
  }, [resumeDraft]);

  async function handleSelectedFiles(files: FileList | null) {
    if (!files || files.length === 0) {
      return;
    }

    setError('');

    try {
      const nextDrafts = await Promise.all(Array.from(files).map((file) => buildDraftFile(file)));
      setDraftFiles((current) => [...current, ...nextDrafts]);
    } catch {
      setError('We could not prepare one of the selected files. Try a different image or PDF.');
    }
  }

  function removeDraftFile(fileId: string) {
    setDraftFiles((current) => {
      const target = current.find((item) => item.id === fileId);
      target?.pages.forEach((page) => {
        if (page.previewUrl) {
          URL.revokeObjectURL(page.previewUrl);
        }
      });
      return current.filter((item) => item.id !== fileId);
    });
  }

  function onInputChange(event: ChangeEvent<HTMLInputElement>) {
    handleSelectedFiles(event.target.files);
    event.target.value = '';
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    handleSelectedFiles(event.dataTransfer.files);
  }

  function onDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
  }

  function submitUpload() {
    if (draftFiles.length === 0) {
      setError('Select at least one file before continuing.');
      return;
    }

    if (isPageCountInvalid) {
      setError('The total page count must be between 5 and 10.');
      return;
    }

    setError('');

    startTransition(async () => {
      const formData = new FormData();
      formData.append('childId', String(childId));
      formData.append('sourceType', sourceType);
      formData.append('notes', notes);
      formData.append('diagnosticGoal', diagnosticGoal);
      formData.append('recentTrend', recentTrend);
      formData.append(
        'parentConcernJson',
        JSON.stringify(
          parentConcerns
            .split(/\r?\n|,/)
            .map((value) => value.trim())
            .filter(Boolean)
            .slice(0, 6)
        )
      );
      formData.append('teacherFeedbackPresent', String(teacherFeedbackPresent));
      formData.append('hasTutor', String(hasTutor));
      formData.append(
        'pageDrafts',
        JSON.stringify(buildPageDrafts(draftFiles))
      );

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

  return (
    <div className="space-y-6">
      <section className="pn-section-card">
        <p className="pn-kicker">Upload Workspace</p>
        <h2 className="mt-2 text-[1.8rem] font-black tracking-[-0.04em] text-[#111827]">
          Upload 5-10 pages for {childNickname}
        </h2>

        <div className="mt-6 space-y-5">
          <div
            className="rounded-[1.75rem] border-2 border-dashed border-[var(--pn-soft-border)] bg-[linear-gradient(180deg,#faf8ff_0%,#ffffff_100%)] p-10 text-center"
            onDrop={onDrop}
            onDragOver={onDragOver}
          >
            <FileUp className="mx-auto h-10 w-10 text-[var(--pn-violet)]" />
            <p className="mt-4 text-lg font-bold text-gray-900">
              Drag worksheets, quiz pages, or a PDF here
            </p>
            <p className="mt-2 text-sm leading-7 text-[var(--pn-muted)]">
              Images and PDFs are supported. We recommend bright, upright, single-page photos.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-4 rounded-[1rem]"
              onClick={() => inputRef.current?.click()}
            >
              Choose Files
            </Button>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED_INTAKE_FILE_TYPES}
              multiple
              className="hidden"
              onChange={onInputChange}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-[0.9fr,1.1fr]">
            <div>
              <Label htmlFor="sourceType" className="mb-2 block text-sm font-semibold text-[#111827]">
                Source type
              </Label>
              <select
                id="sourceType"
                value={sourceType}
                onChange={(event) => setSourceType(event.target.value)}
                className="flex h-12 w-full rounded-[1rem] border border-[var(--pn-border)] bg-white px-4 py-2 text-sm text-[#111827]"
              >
                {uploadSourceTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="notes" className="mb-2 block text-sm font-semibold text-[#111827]">
                Optional context
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Add any context that will help interpret this intake, such as the topic, whether the work was timed, or whether corrections are included."
                className="min-h-28 rounded-[1rem] border-[var(--pn-border)] bg-white"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label
                htmlFor="diagnosticGoal"
                className="mb-2 block text-sm font-semibold text-[#111827]"
              >
                Diagnostic goal
              </Label>
              <Textarea
                id="diagnosticGoal"
                value={diagnosticGoal}
                onChange={(event) => setDiagnosticGoal(event.target.value)}
                placeholder="What do you most want this run to clarify?"
                className="min-h-24 rounded-[1rem] border-[var(--pn-border)] bg-white"
              />
            </div>
            <div>
              <Label
                htmlFor="recentTrend"
                className="mb-2 block text-sm font-semibold text-[#111827]"
              >
                Recent trend
              </Label>
              <Textarea
                id="recentTrend"
                value={recentTrend}
                onChange={(event) => setRecentTrend(event.target.value)}
                placeholder="What has looked easier or shakier over the last 1-2 weeks?"
                className="min-h-24 rounded-[1rem] border-[var(--pn-border)] bg-white"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-[1.2fr,0.8fr]">
            <div>
              <Label
                htmlFor="parentConcerns"
                className="mb-2 block text-sm font-semibold text-[#111827]"
              >
                Parent concerns
              </Label>
              <Textarea
                id="parentConcerns"
                value={parentConcerns}
                onChange={(event) => setParentConcerns(event.target.value)}
                placeholder="Add one concern per line, such as rushing, changed wording, or forgetting checks."
                className="min-h-24 rounded-[1rem] border-[var(--pn-border)] bg-white"
              />
            </div>
            <div className="space-y-3 rounded-[1rem] border border-[var(--pn-border)] bg-white p-4">
              <p className="text-sm font-semibold text-[#111827]">Context flags</p>
              <label className="flex items-center gap-3 text-sm text-[var(--pn-muted-2)]">
                <input
                  type="checkbox"
                  checked={teacherFeedbackPresent}
                  onChange={(event) => setTeacherFeedbackPresent(event.target.checked)}
                />
                Teacher feedback is already included in this packet
              </label>
              <label className="flex items-center gap-3 text-sm text-[var(--pn-muted-2)]">
                <input
                  type="checkbox"
                  checked={hasTutor}
                  onChange={(event) => setHasTutor(event.target.checked)}
                />
                A tutor is already supporting this learner
              </label>
            </div>
          </div>

          <div className="pn-panel-soft">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="pn-muted-label">Page count gate</p>
                <p className="text-sm text-[var(--pn-muted)]">
                  Total pages detected: <span className="font-semibold">{totalPages}</span>
                </p>
              </div>
              <div
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  isPageCountInvalid ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                {isPageCountInvalid ? 'Needs 5-10 pages' : 'Ready to submit'}
              </div>
            </div>
          </div>

          {error ? (
            <div className="rounded-[1rem] border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : null}
          {restoreMessage ? (
            <div className="rounded-[1rem] border border-[var(--pn-soft-border)] bg-white p-4 text-sm font-semibold text-[var(--pn-violet)]">
              {restoreMessage}
            </div>
          ) : null}
        </div>
      </section>

      <div className="grid gap-4">
        {draftFiles.length === 0 ? (
          <div className="pn-section-card text-sm leading-7 text-[var(--pn-muted)]">
            Add worksheet photos or a PDF bundle to begin. This page will show page count,
            previews, and quality checks before you create a diagnostic run.
          </div>
        ) : (
          draftFiles.map((draftFile) => (
            <section key={draftFile.id} className="pn-section-card">
              <div className="flex flex-row items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-[#111827]">{draftFile.file.name}</h3>
                  <p className="mt-1 text-sm text-[var(--pn-muted)]">
                    {draftFile.previewKind === 'pdf' ? 'PDF' : 'Image'} / {draftFile.pageCount}{' '}
                    page{draftFile.pageCount === 1 ? '' : 's'} /{' '}
                    {(draftFile.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  className="text-gray-500"
                  onClick={() => removeDraftFile(draftFile.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {draftFile.pages.map((page) => {
                  const chips = issueChips(page.qualityFlags);
                  return (
                    <div
                      key={`${draftFile.id}-${page.pageNumber}`}
                      className="rounded-[1.25rem] border border-[var(--pn-border)] p-4"
                    >
                      <div className="aspect-[4/5] overflow-hidden rounded-xl bg-gray-100">
                        {page.previewUrl ? (
                          <img
                            src={page.previewUrl}
                            alt={page.previewLabel}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-[linear-gradient(135deg,#fff7ed_0%,#ffedd5_48%,#ffffff_100%)] p-6 text-center text-sm text-gray-700">
                            {page.previewLabel}
                          </div>
                        )}
                      </div>
                      <p className="mt-3 text-sm font-medium text-gray-900">{page.previewLabel}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {chips.length > 0 ? (
                          chips.map((chip) => (
                            <span
                              key={chip}
                              className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800"
                            >
                              {chip}
                            </span>
                          ))
                        ) : (
                          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800">
                            Quality looks OK
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        )}
      </div>

      <section className="pn-section-card">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3 text-sm text-[var(--pn-muted)]">
            <AlertCircle className="mt-0.5 h-4 w-4 text-orange-500" />
            <p>
              If the upload is unusually dark, blurry, or rotated, the run may move into{' '}
              <span className="font-semibold text-gray-900">Needs Review</span> instead of
              producing a full report immediately.
            </p>
          </div>
          <Button
            type="button"
            className="rounded-[1rem]"
            onClick={submitUpload}
            disabled={isPending || isPageCountInvalid}
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating run...
              </>
            ) : (
              'Create Diagnostic Run'
            )}
          </Button>
        </div>
      </section>
    </div>
  );
}
