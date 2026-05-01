import 'server-only';

import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { PDFDocument } from 'pdf-lib';
import { putFamilyArtifact } from '@/lib/family/storage';
import type {
  IncomingPageDraft,
  IncomingUploadFile,
  PageQualityFlags,
} from '@/lib/family/types';

type ClientPageDraft = Omit<IncomingPageDraft, 'storagePath'>;

type IncomingClientDraft = {
  previewKind: 'image' | 'pdf';
  pageCount: number;
  pages: ClientPageDraft[];
};

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]+/g, '-');
}

function normalizeQualityFlags(
  value: Partial<PageQualityFlags> | undefined
): PageQualityFlags {
  return {
    blurry: Boolean(value?.blurry),
    rotated: Boolean(value?.rotated),
    dark: Boolean(value?.dark),
    lowContrast: Boolean(value?.lowContrast),
    width: typeof value?.width === 'number' ? value.width : undefined,
    height: typeof value?.height === 'number' ? value.height : undefined,
  };
}

function defaultPageDraft(pageNumber: number): ClientPageDraft {
  return {
    pageNumber,
    previewLabel: `Page ${pageNumber}`,
    qualityFlags: {
      blurry: false,
      rotated: false,
      dark: false,
      lowContrast: false,
    },
  };
}

export async function persistUploadFiles(
  files: File[],
  drafts: IncomingClientDraft[]
): Promise<IncomingUploadFile[]> {
  const uploadObjectRoot = `upload-${Date.now()}-${randomUUID().slice(0, 8)}`;

  const persisted: IncomingUploadFile[] = [];

  for (const [index, file] of files.entries()) {
    const draft = drafts[index] || {
      previewKind: file.type === 'application/pdf' ? 'pdf' : 'image',
      pageCount: file.type === 'application/pdf' ? 1 : 1,
      pages: [],
    };
    const safeName = sanitizeFilename(file.name || `file-${index + 1}`);
    const fileObjectRoot = path.posix.join(
      uploadObjectRoot,
      `${String(index + 1).padStart(2, '0')}-${safeName}`
    );

    const buffer = Buffer.from(await file.arrayBuffer());
    const originalArtifact = await putFamilyArtifact({
      objectKey: path.posix.join(fileObjectRoot, safeName),
      bytes: buffer,
      contentType: file.type || (draft.previewKind === 'pdf' ? 'application/pdf' : 'image/jpeg'),
    });

    if (draft.previewKind === 'pdf' || file.type === 'application/pdf') {
      let pageCount = draft.pageCount || 1;
      const pagesDraft = draft.pages.length > 0 ? draft.pages : Array.from({ length: pageCount }, (_, pageIndex) => defaultPageDraft(pageIndex + 1));

      try {
        const sourcePdf = await PDFDocument.load(buffer);
        pageCount = sourcePdf.getPageCount();

        const splitPages: IncomingPageDraft[] = [];
        for (let pageIndex = 0; pageIndex < pageCount; pageIndex += 1) {
          const singlePage = await PDFDocument.create();
          const [copiedPage] = await singlePage.copyPages(sourcePdf, [pageIndex]);
          singlePage.addPage(copiedPage);
          const bytes = await singlePage.save();
          const pageArtifact = await putFamilyArtifact({
            objectKey: path.posix.join(
              fileObjectRoot,
              `page-${String(pageIndex + 1).padStart(3, '0')}.pdf`
            ),
            bytes: Buffer.from(bytes),
            contentType: 'application/pdf',
          });

          const sourceDraft = pagesDraft[pageIndex] || defaultPageDraft(pageIndex + 1);
          splitPages.push({
            pageNumber: pageIndex + 1,
            previewLabel: sourceDraft.previewLabel || `PDF page ${pageIndex + 1}`,
            qualityFlags: normalizeQualityFlags(sourceDraft.qualityFlags),
            storagePath: pageArtifact.storagePath,
          });
        }

        persisted.push({
          originalName: file.name,
          mimeType: file.type || 'application/pdf',
          sizeBytes: file.size,
          storagePath: originalArtifact.storagePath,
          pageCount,
          previewKind: 'pdf',
          pages: splitPages,
        });
        continue;
      } catch {
        const fallbackPages = Array.from({ length: pageCount }, (_, pageIndex) => {
          const sourceDraft = pagesDraft[pageIndex] || defaultPageDraft(pageIndex + 1);
          return {
            pageNumber: pageIndex + 1,
            previewLabel: sourceDraft.previewLabel || `PDF page ${pageIndex + 1}`,
            qualityFlags: normalizeQualityFlags(sourceDraft.qualityFlags),
            storagePath: originalArtifact.storagePath,
          };
        });

        persisted.push({
          originalName: file.name,
          mimeType: file.type || 'application/pdf',
          sizeBytes: file.size,
          storagePath: originalArtifact.storagePath,
          pageCount,
          previewKind: 'pdf',
          pages: fallbackPages,
        });
        continue;
      }
    }

    const pageDraft = draft.pages[0] || defaultPageDraft(1);
    persisted.push({
      originalName: file.name,
      mimeType: file.type || 'image/jpeg',
      sizeBytes: file.size,
      storagePath: originalArtifact.storagePath,
      pageCount: 1,
      previewKind: 'image',
      pages: [
        {
          pageNumber: 1,
          previewLabel: pageDraft.previewLabel || file.name || 'Image page',
          qualityFlags: normalizeQualityFlags(pageDraft.qualityFlags),
          storagePath: originalArtifact.storagePath,
        },
      ],
    });
  }

  return persisted;
}
