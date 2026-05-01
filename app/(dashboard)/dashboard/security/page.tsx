'use client';

import { useActionState } from 'react';
import { Loader2, Lock, Trash2 } from 'lucide-react';
import { deleteAccount, updatePassword } from '@/app/(login)/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type PasswordState = {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  error?: string;
  success?: string;
};

type DeleteState = {
  password?: string;
  error?: string;
  success?: string;
};

export default function SecurityPage() {
  const [passwordState, passwordAction, isPasswordPending] = useActionState<PasswordState, FormData>(
    updatePassword,
    {}
  );
  const [deleteState, deleteAction, isDeletePending] = useActionState<DeleteState, FormData>(
    deleteAccount,
    {}
  );

  return (
    <section className="space-y-6">
      <section className="pn-section-card">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--pn-muted)]">
          <span>Account</span>
          <span>/</span>
          <span className="text-[#111827]">Security</span>
        </div>
        <h1 className="pn-section-title mt-4">Security Settings</h1>
        <p className="mt-3 max-w-3xl text-lg leading-8 text-[var(--pn-muted)]">
          Manage password protection and account deletion inside the same dashboard system.
        </p>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="pn-section-card">
          <h2 className="text-[1.8rem] font-black tracking-[-0.04em] text-[#111827]">Password</h2>
          <form className="mt-6 space-y-4" action={passwordAction}>
            <div>
              <Label htmlFor="current-password" className="text-sm font-semibold text-[#111827]">
                Current Password
              </Label>
              <Input id="current-password" name="currentPassword" type="password" autoComplete="current-password" required minLength={8} maxLength={100} defaultValue={passwordState.currentPassword} className="mt-2 rounded-[1rem] border-[var(--pn-border)]" />
            </div>
            <div>
              <Label htmlFor="new-password" className="text-sm font-semibold text-[#111827]">
                New Password
              </Label>
              <Input id="new-password" name="newPassword" type="password" autoComplete="new-password" required minLength={8} maxLength={100} defaultValue={passwordState.newPassword} className="mt-2 rounded-[1rem] border-[var(--pn-border)]" />
            </div>
            <div>
              <Label htmlFor="confirm-password" className="text-sm font-semibold text-[#111827]">
                Confirm New Password
              </Label>
              <Input id="confirm-password" name="confirmPassword" type="password" required minLength={8} maxLength={100} defaultValue={passwordState.confirmPassword} className="mt-2 rounded-[1rem] border-[var(--pn-border)]" />
            </div>
            {passwordState.error ? <p className="text-sm text-red-600">{passwordState.error}</p> : null}
            {passwordState.success ? <p className="text-sm text-emerald-600">{passwordState.success}</p> : null}
            <Button type="submit" className="rounded-[1rem]" disabled={isPasswordPending}>
              {isPasswordPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Update Password
                </>
              )}
            </Button>
          </form>
        </div>

        <div className="pn-section-card">
          <h2 className="text-[1.8rem] font-black tracking-[-0.04em] text-[#111827]">Delete Account</h2>
          <p className="mt-3 text-base leading-8 text-[var(--pn-muted)]">
            Account deletion is non-reversible. Please proceed with caution.
          </p>
          <form action={deleteAction} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="delete-password" className="text-sm font-semibold text-[#111827]">
                Confirm Password
              </Label>
              <Input id="delete-password" name="password" type="password" required minLength={8} maxLength={100} defaultValue={deleteState.password} className="mt-2 rounded-[1rem] border-[var(--pn-border)]" />
            </div>
            {deleteState.error ? <p className="text-sm text-red-600">{deleteState.error}</p> : null}
            <Button type="submit" variant="destructive" className="rounded-[1rem]" disabled={isDeletePending}>
              {isDeletePending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </>
              )}
            </Button>
          </form>
        </div>
      </section>
    </section>
  );
}
