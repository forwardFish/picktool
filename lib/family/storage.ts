import 'server-only';

import { mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { del, get, put } from '@vercel/blob';
import { getFileStorageBackend } from '@/lib/family/config';
import { getFamilyRuntimePaths } from '@/lib/family/mock-store';

const LOCAL_STORAGE_PREFIX = 'local:';
const BLOB_STORAGE_PREFIX = 'blob:';

export type StoredArtifact = {
  storagePath: string;
  contentType: string;
  sizeBytes: number;
};

export type StoredArtifactRead = {
  body: Buffer | ReadableStream;
  contentType: string;
  cacheControl: string;
};

function normalizeObjectKey(value: string) {
  return value.replace(/\\/g, '/').replace(/^\/+/, '');
}

function buildLocalStorageLocator(relativePath: string) {
  return `${LOCAL_STORAGE_PREFIX}${normalizeObjectKey(relativePath)}`;
}

function buildBlobStorageLocator(pathname: string) {
  return `${BLOB_STORAGE_PREFIX}${normalizeObjectKey(pathname)}`;
}

function isBlobStorageLocator(storagePath: string) {
  return storagePath.startsWith(BLOB_STORAGE_PREFIX);
}

function isLocalStorageLocator(storagePath: string) {
  return storagePath.startsWith(LOCAL_STORAGE_PREFIX);
}

function inferContentType(storagePath: string) {
  const ext = path.extname(storagePath).toLowerCase();
  if (ext === '.pdf') {
    return 'application/pdf';
  }
  if (ext === '.png') {
    return 'image/png';
  }
  if (ext === '.webp') {
    return 'image/webp';
  }
  if (ext === '.gif') {
    return 'image/gif';
  }
  return 'image/jpeg';
}

function getPreferredBlobAccess() {
  return process.env.BLOB_ACCESS?.trim() === 'private' ? 'private' : 'public';
}

function shouldRetryBlobAsPublic(error: unknown) {
  return (
    error instanceof Error &&
    error.message.includes('Cannot use private access on a public store')
  );
}

async function resolveLocalFilesystemPath(storagePath: string) {
  if (path.isAbsolute(storagePath)) {
    return storagePath;
  }

  const relativePath = isLocalStorageLocator(storagePath)
    ? normalizeObjectKey(storagePath.slice(LOCAL_STORAGE_PREFIX.length))
    : normalizeObjectKey(storagePath);
  const { uploadsRoot } = await getFamilyRuntimePaths();
  return path.join(uploadsRoot, ...relativePath.split('/'));
}

export async function putFamilyArtifact(args: {
  objectKey: string;
  bytes: Buffer | Uint8Array;
  contentType: string;
  cacheControlMaxAge?: number;
}): Promise<StoredArtifact> {
  const normalizedKey = normalizeObjectKey(args.objectKey);
  const buffer = Buffer.isBuffer(args.bytes) ? args.bytes : Buffer.from(args.bytes);

  if (getFileStorageBackend() === 'blob') {
    const preferredAccess = getPreferredBlobAccess();
    let blob;

    try {
      blob = await put(normalizedKey, buffer, {
        access: preferredAccess,
        addRandomSuffix: false,
        contentType: args.contentType,
        cacheControlMaxAge: args.cacheControlMaxAge ?? 60 * 60 * 24 * 30,
      });
    } catch (error) {
      if (preferredAccess !== 'private' || !shouldRetryBlobAsPublic(error)) {
        throw error;
      }

      blob = await put(normalizedKey, buffer, {
        access: 'public',
        addRandomSuffix: false,
        contentType: args.contentType,
        cacheControlMaxAge: args.cacheControlMaxAge ?? 60 * 60 * 24 * 30,
      });
    }

    return {
      storagePath: buildBlobStorageLocator(blob.pathname),
      contentType: blob.contentType || args.contentType,
      sizeBytes: buffer.byteLength,
    };
  }

  const targetPath = await resolveLocalFilesystemPath(buildLocalStorageLocator(normalizedKey));
  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, buffer);
  return {
    storagePath: buildLocalStorageLocator(normalizedKey),
    contentType: args.contentType,
    sizeBytes: buffer.byteLength,
  };
}

export async function readFamilyArtifact(storagePath: string): Promise<StoredArtifactRead> {
  if (isBlobStorageLocator(storagePath)) {
    const pathname = normalizeObjectKey(storagePath.slice(BLOB_STORAGE_PREFIX.length));
    const preferredAccess = getPreferredBlobAccess();
    let result;

    try {
      result = await get(pathname, { access: preferredAccess });
    } catch (error) {
      if (preferredAccess !== 'private' || !shouldRetryBlobAsPublic(error)) {
        throw error;
      }

      result = await get(pathname, { access: 'public' });
    }

    if (!result || result.statusCode !== 200) {
      throw new Error(`Blob artifact not found: ${pathname}`);
    }

    return {
      body: result.stream,
      contentType: result.blob.contentType || inferContentType(pathname),
      cacheControl: 'private, no-cache',
    };
  }

  const filesystemPath = await resolveLocalFilesystemPath(storagePath);
  const buffer = await readFile(filesystemPath);
  return {
    body: buffer,
    contentType: inferContentType(filesystemPath),
    cacheControl: 'private, max-age=60',
  };
}

export async function deleteFamilyArtifact(storagePath: string) {
  if (isBlobStorageLocator(storagePath)) {
    const pathname = normalizeObjectKey(storagePath.slice(BLOB_STORAGE_PREFIX.length));

    try {
      await del(pathname);
      return true;
    } catch {
      return false;
    }
  }

  try {
    const filesystemPath = await resolveLocalFilesystemPath(storagePath);
    await unlink(filesystemPath);
    return true;
  } catch {
    return false;
  }
}
