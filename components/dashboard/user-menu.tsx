'use client';

import Link from 'next/link';
import { useState } from 'react';
import { ChevronDown, LogOut } from 'lucide-react';
import useSWR from 'swr';
import { signOut } from '@/app/(login)/actions';
import { User } from '@/lib/db/schema';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function getDisplayName(user: User) {
  if (user.name?.trim()) return user.name.trim();
  return user.email.split('@')[0];
}

function getInitials(user: User) {
  const source = user.name?.trim() || user.email.split('@')[0];
  const parts = source
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2);

  if (parts.length === 0) return 'P';
  return parts.map((part) => part[0]?.toUpperCase() || '').join('');
}

type DashboardUserMenuProps = {
  fullWidth?: boolean;
};

export function DashboardUserMenu({ fullWidth = false }: DashboardUserMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: user } = useSWR<User>('/api/user', fetcher);

  if (!user) {
    return (
      <Link
        href="/sign-in"
        className={cn(
          'group flex items-center gap-3 rounded-full border border-white/85 bg-white/82 px-2 py-2 pr-3 shadow-[0_14px_32px_rgba(15,23,42,0.07)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(124,58,237,0.12)]',
          fullWidth ? 'w-full justify-between rounded-[2rem]' : ''
        )}
      >
        <div className="relative">
          <Avatar className="size-11 border border-white/80 shadow-[0_10px_24px_rgba(124,58,237,0.16)]">
            <AvatarFallback className="bg-[linear-gradient(135deg,#eef2ff_0%,#ede9fe_45%,#fae8ff_100%)] text-sm font-black tracking-[0.04em] text-[var(--pn-violet)]">
              PN
            </AvatarFallback>
          </Avatar>
          <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-slate-300 shadow-[0_0_0_3px_rgba(148,163,184,0.12)]" />
        </div>

        <div className="min-w-0 flex-1 text-left">
          <div className="truncate text-[0.95rem] font-semibold tracking-[-0.01em] text-slate-900">
            Pathnook account
          </div>
          <div className="truncate text-xs font-medium text-slate-500">Sign in to continue</div>
        </div>

        <span className="rounded-full bg-[linear-gradient(135deg,#5b6df9_0%,#7c3aed_58%,#c026d3_100%)] px-5 py-2 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(124,58,237,0.28)]">
          Sign In
        </span>
      </Link>
    );
  }

  const displayName = getDisplayName(user);
  const initials = getInitials(user);
  const userMeta =
    user.role && user.role !== 'member'
      ? user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()
      : 'Family workspace';

  return (
    <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'group flex items-center gap-3 rounded-full border border-white/85 bg-white/82 px-2 py-2 pr-3 shadow-[0_14px_32px_rgba(15,23,42,0.07)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(124,58,237,0.12)]',
            fullWidth ? 'w-full justify-between rounded-[2rem]' : ''
          )}
        >
          <div className="relative">
            <Avatar className="size-11 border border-white/80 shadow-[0_10px_24px_rgba(124,58,237,0.16)]">
              <AvatarImage alt={displayName} />
              <AvatarFallback className="bg-[linear-gradient(135deg,#eef2ff_0%,#ede9fe_45%,#fae8ff_100%)] text-sm font-black tracking-[0.04em] text-[var(--pn-violet)]">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400 shadow-[0_0_0_3px_rgba(16,185,129,0.14)]" />
          </div>

          <div className="min-w-0 flex-1 text-left">
            <div className="truncate text-[0.95rem] font-semibold tracking-[-0.01em] text-slate-900">
              {displayName}
            </div>
            <div className="truncate text-xs font-medium text-slate-500">{userMeta}</div>
          </div>

          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--pn-soft)] text-[var(--pn-violet)] transition group-hover:bg-[#ece6ff]">
            <ChevronDown className="h-4 w-4" />
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={fullWidth ? 'start' : 'end'}
        className="flex min-w-60 flex-col gap-1 rounded-[1.15rem] border border-[var(--pn-soft-border)] bg-white/96 p-2 shadow-[0_24px_60px_rgba(15,23,42,0.14)] backdrop-blur-xl"
      >
        <div className="mb-1 rounded-[1rem] bg-[linear-gradient(180deg,#fcfbff_0%,#ffffff_100%)] px-3 py-3">
          <div className="text-sm font-semibold text-slate-900">{displayName}</div>
          <div className="mt-0.5 text-xs text-slate-500">{user.email}</div>
          <div className="mt-2 text-xs font-medium text-slate-500">{userMeta}</div>
        </div>
        <form action={signOut} className="w-full">
          <button
            type="submit"
            className="flex w-full items-center rounded-[0.9rem] px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sign out</span>
          </button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
