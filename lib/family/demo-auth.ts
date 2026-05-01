import 'server-only';

import {
  readFamilyMockState,
  updateFamilyMockState,
} from '@/lib/family/mock-store';
import type { DemoParentProfile } from '@/lib/family/types';

function nowIso() {
  return new Date().toISOString();
}

export function getDefaultDemoParentProfile(): DemoParentProfile {
  const now = nowIso();
  return {
    id: 1,
    name: 'Demo Parent',
    email: 'demo-parent@pathnook.local',
    googleSub: null,
    password: 'DemoParent123',
    role: 'owner',
    is18PlusConfirmed: true,
    country: 'US',
    timezone: 'America/Los_Angeles',
    locale: 'en-US',
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  };
}

export function toDemoUser(profile: DemoParentProfile) {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    googleSub: profile.googleSub,
    passwordHash: 'demo-password-hash',
    role: profile.role,
    is18PlusConfirmed: profile.is18PlusConfirmed,
    country: profile.country,
    timezone: profile.timezone,
    locale: profile.locale,
    createdAt: new Date(profile.createdAt),
    updatedAt: new Date(profile.updatedAt),
    deletedAt: profile.deletedAt ? new Date(profile.deletedAt) : null,
  };
}

export async function getStoredDemoParentProfile() {
  const state = await readFamilyMockState();
  return state.auth.parentProfile || getDefaultDemoParentProfile();
}

export async function registerDemoParent(input: {
  name: string;
  email: string;
  password: string;
  country: string;
  timezone: string;
  locale: string;
  is18PlusConfirmed: boolean;
}) {
  return updateFamilyMockState((state) => {
    const existing = state.auth.parentProfile;
    if (existing && existing.email.toLowerCase() === input.email.toLowerCase()) {
      return { ok: false as const, reason: 'duplicate_email' as const };
    }

    const createdAt = existing?.createdAt || nowIso();
    const profile: DemoParentProfile = {
      id: 1,
      name: input.name || 'Demo Parent',
      email: input.email,
      googleSub: existing?.googleSub || null,
      password: input.password,
      role: 'owner',
      is18PlusConfirmed: input.is18PlusConfirmed,
      country: input.country,
      timezone: input.timezone,
      locale: input.locale,
      createdAt,
      updatedAt: nowIso(),
      deletedAt: null,
    };

    state.auth.parentProfile = profile;
    return { ok: true as const, profile };
  });
}

export async function upsertDemoParentFromGoogle(input: {
  sub: string;
  email: string;
  name: string | null;
}) {
  return updateFamilyMockState((state) => {
    const existing = state.auth.parentProfile || getDefaultDemoParentProfile();
    const createdAt = existing.createdAt || nowIso();

    const profile: DemoParentProfile = {
      ...existing,
      id: 1,
      name: input.name?.trim() || existing.name || input.email.split('@')[0],
      email: input.email,
      googleSub: input.sub,
      password: existing.password || 'DemoParent123',
      role: 'owner',
      is18PlusConfirmed: true,
      createdAt,
      updatedAt: nowIso(),
      deletedAt: null,
    };

    state.auth.parentProfile = profile;
    return profile;
  });
}

export async function authenticateDemoParent(input: {
  email: string;
  password: string;
}) {
  const profile = await getStoredDemoParentProfile();
  if (
    profile.deletedAt ||
    profile.email.toLowerCase() !== input.email.toLowerCase() ||
    profile.password !== input.password
  ) {
    return null;
  }
  return profile;
}

export async function updateDemoParentProfile(input: {
  name: string;
  email: string;
  country: string;
  timezone: string;
  locale: string;
}) {
  return updateFamilyMockState((state) => {
    const existing = state.auth.parentProfile || getDefaultDemoParentProfile();
    state.auth.parentProfile = {
      ...existing,
      name: input.name,
      email: input.email,
      country: input.country,
      timezone: input.timezone,
      locale: input.locale,
      updatedAt: nowIso(),
    };
    return state.auth.parentProfile;
  });
}

export async function updateDemoParentPassword(input: {
  currentPassword: string;
  newPassword: string;
}) {
  return updateFamilyMockState((state) => {
    const existing = state.auth.parentProfile || getDefaultDemoParentProfile();
    if (existing.password !== input.currentPassword) {
      return { ok: false as const, reason: 'invalid_password' as const };
    }

    state.auth.parentProfile = {
      ...existing,
      password: input.newPassword,
      updatedAt: nowIso(),
    };
    return { ok: true as const, profile: state.auth.parentProfile };
  });
}

export async function deleteDemoParentAccount() {
  return updateFamilyMockState((state) => {
    const existing = state.auth.parentProfile || getDefaultDemoParentProfile();
    const deletedAt = nowIso();

    state.auth.parentProfile = {
      ...existing,
      email: `${existing.email}.deleted.${Date.now()}`,
      deletedAt,
      updatedAt: deletedAt,
    };
    state.children = [];
    state.uploads = [];
    state.uploadFiles = [];
    state.pages = [];
    state.runs = [];
    state.reports = [];
    state.problemItems = [];
    state.errorLabels = [];
    state.itemErrors = [];
    state.shareLinks = [];
    state.subscriptions = [];
    state.billingEvents = [];
    state.activityLogs = [];

    return state.auth.parentProfile;
  });
}
