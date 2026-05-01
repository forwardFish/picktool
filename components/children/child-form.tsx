'use client';

import { useActionState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Child } from '@/lib/db/schema';
import { curriculumOptions, gradeOptions } from '@/lib/family/options';
import {
  archiveChild,
  createChild,
  updateChild
} from '@/app/(dashboard)/dashboard/children/actions';

type ChildFormState = {
  nickname?: string;
  grade?: string;
  curriculum?: string;
  error?: string;
  success?: string;
};

type Props = {
  mode: 'create' | 'edit';
  child?: Pick<Child, 'id' | 'nickname' | 'grade' | 'curriculum'>;
  resumeDraft?: boolean;
};

const selectClassName =
  'mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm';

export function ChildForm({ mode, child, resumeDraft = false }: Props) {
  const [state, formAction, isPending] = useActionState<ChildFormState, FormData>(
    mode === 'create' ? createChild : updateChild,
    {}
  );
  const [archiveState, archiveAction, isArchivePending] = useActionState<
    { error?: string },
    FormData
  >(archiveChild, {});

  return (
    <div className="space-y-6">
      <form className="space-y-4" action={formAction}>
        {mode === 'edit' && child ? (
          <input type="hidden" name="childId" value={child.id} />
        ) : null}
        {mode === 'create' && resumeDraft ? (
          <input type="hidden" name="resumeDraft" value="1" />
        ) : null}

        <div>
          <Label htmlFor="nickname" className="mb-2">
            Child nickname
          </Label>
          <Input
            id="nickname"
            name="nickname"
            placeholder="How should this child appear in the dashboard?"
            defaultValue={state.nickname || child?.nickname || ''}
            required
            maxLength={100}
          />
        </div>

        <div>
          <Label htmlFor="grade" className="mb-2">
            Grade
          </Label>
          <select
            id="grade"
            name="grade"
            className={selectClassName}
            defaultValue={state.grade || child?.grade || ''}
            required
          >
            <option value="" disabled>
              Select a grade
            </option>
            {gradeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="curriculum" className="mb-2">
            Curriculum
          </Label>
          <select
            id="curriculum"
            name="curriculum"
            className={selectClassName}
            defaultValue={state.curriculum || child?.curriculum || ''}
            required
          >
            <option value="" disabled>
              Select a curriculum
            </option>
            {curriculumOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {state.error ? (
          <p className="text-sm text-red-500">{state.error}</p>
        ) : null}
        {state.success ? (
          <p className="text-sm text-green-600">{state.success}</p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : mode === 'create' ? (
              'Create Child Profile'
            ) : (
              'Save Child Profile'
            )}
          </Button>
          {mode === 'edit' ? (
            <Button asChild variant="outline">
              <a href="/dashboard/children">Back to Children</a>
            </Button>
          ) : null}
        </div>
      </form>

      {mode === 'edit' && child ? (
        <form action={archiveAction} className="rounded-xl border border-red-100 bg-red-50 p-4">
          <input type="hidden" name="childId" value={child.id} />
          <p className="text-sm text-gray-700">
            Delete this profile to hide it immediately and remove linked uploads, runs, reports,
            and share links from the household workspace.
          </p>
          <p className="mt-2 text-xs text-gray-500">
            Retention cleanup will later purge any archived child metadata from the local runtime
            audit store.
          </p>
          {archiveState.error ? (
            <p className="mt-2 text-sm text-red-500">{archiveState.error}</p>
          ) : null}
          <Button type="submit" variant="destructive" className="mt-4" disabled={isArchivePending}>
            {isArchivePending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Child Profile'
            )}
          </Button>
        </form>
      ) : null}
    </div>
  );
}
