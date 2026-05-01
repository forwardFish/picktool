'use client';

import { PDFDocument } from 'pdf-lib';
import type { PageQualityFlags } from '@/lib/family/types';

export type DraftPage = {
  pageNumber: number;
  previewLabel: string;
  qualityFlags: PageQualityFlags;
  previewUrl: string | null;
};

export type DraftFile = {
  id: string;
  file: File;
  previewKind: 'image' | 'pdf';
  pageCount: number;
  pages: DraftPage[];
};

export const ACCEPTED_INTAKE_FILE_TYPES = 'image/*,application/pdf';
export const INTAKE_FILE_HELPER_TEXT = 'Homework, tests, corrections - PDF or photo';
export const INTAKE_RESTORED_MESSAGE =
  'We restored your upload draft. Continue from where you left off.';
export const INTAKE_RESTORE_FAILED_MESSAGE =
  'Draft could not be restored. Please reattach the files and continue.';

export function buildFileId(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function analyzeImageQuality(previewUrl: string) {
  const image = new Image();
  image.src = previewUrl;
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  });

  const canvas = document.createElement('canvas');
  const sampleWidth = 180;
  const sampleHeight = Math.max(1, Math.round((image.height / image.width) * sampleWidth));
  canvas.width = sampleWidth;
  canvas.height = sampleHeight;
  const context = canvas.getContext('2d');

  if (!context) {
    return {
      blurry: false,
      rotated: image.width > image.height,
      dark: false,
      lowContrast: false,
      width: image.width,
      height: image.height,
    } satisfies PageQualityFlags;
  }

  context.drawImage(image, 0, 0, sampleWidth, sampleHeight);
  const { data } = context.getImageData(0, 0, sampleWidth, sampleHeight);

  let brightnessTotal = 0;
  let luminanceSquares = 0;
  let contrastAccumulator = 0;

  for (let index = 0; index < data.length; index += 4) {
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
    brightnessTotal += luminance;
    luminanceSquares += luminance * luminance;

    if (index >= 8) {
      const prevLuminance =
        0.2126 * data[index - 4] + 0.7152 * data[index - 3] + 0.0722 * data[index - 2];
      contrastAccumulator += Math.abs(luminance - prevLuminance);
    }
  }

  const pixelCount = data.length / 4;
  const averageBrightness = brightnessTotal / pixelCount;
  const variance = Math.max(
    0,
    luminanceSquares / pixelCount - averageBrightness * averageBrightness
  );
  const averageContrast = contrastAccumulator / pixelCount;

  return {
    blurry: averageContrast < 14,
    rotated: image.width > image.height,
    dark: averageBrightness < 92,
    lowContrast: variance < 900,
    width: image.width,
    height: image.height,
  } satisfies PageQualityFlags;
}

export async function buildDraftFile(file: File): Promise<DraftFile> {
  if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
    const pdf = await PDFDocument.load(await file.arrayBuffer());
    const pageCount = pdf.getPageCount();
    return {
      id: buildFileId(file),
      file,
      previewKind: 'pdf',
      pageCount,
      pages: Array.from({ length: pageCount }, (_, pageIndex) => ({
        pageNumber: pageIndex + 1,
        previewLabel: `PDF page ${pageIndex + 1}`,
        qualityFlags: {
          blurry: false,
          rotated: false,
          dark: false,
          lowContrast: false,
        },
        previewUrl: null,
      })),
    };
  }

  const previewUrl = URL.createObjectURL(file);
  const qualityFlags = await analyzeImageQuality(previewUrl);
  return {
    id: buildFileId(file),
    file,
    previewKind: 'image',
    pageCount: 1,
    pages: [
      {
        pageNumber: 1,
        previewLabel: file.name,
        qualityFlags,
        previewUrl,
      },
    ],
  };
}

export function revokeDraftFileUrls(draftFiles: DraftFile[]) {
  draftFiles.forEach((draftFile) => {
    draftFile.pages.forEach((page) => {
      if (page.previewUrl) {
        URL.revokeObjectURL(page.previewUrl);
      }
    });
  });
}

export function buildPageDrafts(draftFiles: DraftFile[]) {
  return draftFiles.map((draftFile) => ({
    previewKind: draftFile.previewKind,
    pageCount: draftFile.pageCount,
    pages: draftFile.pages.map((page) => ({
      pageNumber: page.pageNumber,
      previewLabel: page.previewLabel,
      qualityFlags: page.qualityFlags,
    })),
  }));
}
