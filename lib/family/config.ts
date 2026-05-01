import path from 'node:path';

export type FileStorageBackend = 'local' | 'blob';

export function isFamilyEduDemoMode() {
  return process.env['FAMILY_EDU_DEMO_MODE'] === '1';
}

export function isFamilyEduDemoAutoAuth() {
  return isFamilyEduDemoMode() && process.env['FAMILY_EDU_DEMO_AUTO_AUTH'] === '1';
}

export function isRunningOnVercel() {
  return process.env['VERCEL'] === '1' || Boolean(process.env['VERCEL_ENV']);
}

export function getFileStorageBackend(): FileStorageBackend {
  if (process.env['FILE_STORAGE_BACKEND'] === 'blob') {
    return 'blob';
  }

  if (isRunningOnVercel()) {
    return 'blob';
  }

  return 'local';
}

export function getFamilyEduRuntimeRoot() {
  return path.resolve(
    process.env.FAMILY_EDU_RUNTIME_ROOT?.trim() || path.join(process.cwd(), 'tasks', 'runtime')
  );
}

export const FAMILY_EDU_DEMO_MODE = isFamilyEduDemoMode();
export const FAMILY_EDU_DEMO_AUTO_AUTH = isFamilyEduDemoAutoAuth();
export const FAMILY_EDU_FILE_STORAGE_BACKEND = getFileStorageBackend();
export const FAMILY_EDU_RUNTIME_ROOT = getFamilyEduRuntimeRoot();
export const FAMILY_EDU_SUPPORT_EMAIL =
  process.env.SUPPORT_EMAIL?.trim() || 'support@example.com';
