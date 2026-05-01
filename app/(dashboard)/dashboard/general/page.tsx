'use client';

import { Suspense, useActionState } from 'react';
import useSWR from 'swr';
import { Loader2 } from 'lucide-react';
import { updateAccount } from '@/app/(login)/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User } from '@/lib/db/schema';
import { countryOptions } from '@/lib/family/options';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

type ActionState = {
  name?: string;
  email?: string;
  country?: string;
  timezone?: string;
  locale?: string;
  error?: string;
  success?: string;
};

type AccountFormProps = {
  state: ActionState;
  nameValue?: string;
  emailValue?: string;
  countryValue?: string;
  timezoneValue?: string;
  localeValue?: string;
};

const selectClassName =
  'mt-2 flex h-11 w-full rounded-[1rem] border border-[var(--pn-border)] bg-white px-3 py-2 text-sm';

function AccountForm({
  state,
  nameValue = '',
  emailValue = '',
  countryValue = 'US',
  timezoneValue = 'America/Los_Angeles',
  localeValue = 'en-US',
}: AccountFormProps) {
  return (
    <>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <Label htmlFor="name" className="text-sm font-semibold text-[#111827]">
            Name
          </Label>
          <Input
            id="name"
            name="name"
            placeholder="Enter your name"
            defaultValue={state.name || nameValue}
            required
            className="mt-2 rounded-[1rem] border-[var(--pn-border)]"
          />
        </div>
        <div>
          <Label htmlFor="email" className="text-sm font-semibold text-[#111827]">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            defaultValue={state.email || emailValue}
            required
            className="mt-2 rounded-[1rem] border-[var(--pn-border)]"
          />
        </div>
        <div>
          <Label htmlFor="country" className="text-sm font-semibold text-[#111827]">
            Country
          </Label>
          <select
            id="country"
            name="country"
            className={selectClassName}
            defaultValue={state.country || countryValue}
            required
          >
            {countryOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <input type="hidden" name="timezone" value={state.timezone || timezoneValue} />
      <input type="hidden" name="locale" value={state.locale || localeValue} />

      <div className="rounded-[1.2rem] border border-[var(--pn-border)] bg-[var(--pn-soft)] p-4 text-sm leading-7 text-[var(--pn-muted)]">
        This dashboard is only for parents or guardians aged 18 and older.
      </div>
    </>
  );
}

function AccountFormWithData({ state }: { state: ActionState }) {
  const { data: user } = useSWR<User>('/api/user', fetcher);
  return (
    <AccountForm
      state={state}
      nameValue={user?.name ?? ''}
      emailValue={user?.email ?? ''}
      countryValue={user?.country ?? 'US'}
      timezoneValue={user?.timezone ?? 'America/Los_Angeles'}
      localeValue={user?.locale ?? 'en-US'}
    />
  );
}

export default function GeneralPage() {
  const [state, formAction, isPending] = useActionState<ActionState, FormData>(updateAccount, {});

  return (
    <section className="space-y-6">
      <section className="pn-section-card">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--pn-muted)]">
          <span>Account</span>
          <span>/</span>
          <span className="text-[#111827]">Parent Account</span>
        </div>
        <h1 className="pn-section-title mt-4">Parent Profile</h1>
        <p className="mt-3 max-w-3xl text-lg leading-8 text-[var(--pn-muted)]">
          Keep the household owner profile lightweight, current, and aligned with notification and
          language preferences.
        </p>
      </section>

      <section className="pn-section-card">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-[1.8rem] font-black tracking-[-0.04em] text-[#111827]">
              Parent Account
            </h2>
            <p className="mt-2 text-base leading-8 text-[var(--pn-muted)]">
              Update the information that controls owner identity and account region.
            </p>
          </div>
        </div>

        <form className="mt-6 space-y-5" action={formAction}>
          <Suspense fallback={<AccountForm state={state} />}>
            <AccountFormWithData state={state} />
          </Suspense>
          {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
          {state.success ? <p className="text-sm text-emerald-600">{state.success}</p> : null}
          <Button type="submit" className="rounded-[1rem]" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </form>
      </section>
    </section>
  );
}
