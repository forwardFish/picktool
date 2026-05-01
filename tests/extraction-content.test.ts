import test from 'node:test';
import assert from 'node:assert/strict';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { extractPdfText } from '../lib/ai/pdf-text.ts';
import { composeDeepResearchReport } from '../lib/family/report-composer.ts';

test('extractPdfText reads visible text from a generated worksheet pdf', async () => {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([612, 792]);
  const font = await pdf.embedFont(StandardFonts.Helvetica);

  page.drawText('12 + 7 = 19', {
    x: 72,
    y: 720,
    size: 16,
    font,
  });
  page.drawText('Teacher note: check the final addition.', {
    x: 72,
    y: 690,
    size: 12,
    font,
  });

  const bytes = await pdf.save();
  const extracted = extractPdfText(Buffer.from(bytes));

  assert.match(extracted, /12 \+ 7 = 19/i);
  assert.match(extracted, /Teacher note: check the final addition\./i);
});

test('composeDeepResearchReport stays honest when no reliable evidence was extracted', () => {
  const payload = composeDeepResearchReport({
    bundle: {
      runId: 22,
      engine: 'content-check',
      modelVersion: 'gpt-4.1-mini',
      pages: [
        {
          pageId: 1,
          pageNo: 1,
          sourceName: 'worksheet-1',
          detectedLanguage: 'en',
          pageConfidence: 0.22,
          qualityFlags: {
            blurry: false,
            rotated: false,
            dark: false,
            lowContrast: false,
          },
          items: [],
        },
      ],
      labeledItems: [],
      overallConfidence: 0.22,
      requiresReview: true,
      reviewReason:
        'Uploaded pages could not be parsed into reliable worksheet evidence. Please re-upload a clearer text-based PDF or review the run manually.',
    },
    child: {
      nickname: 'Lin',
      grade: '7th Grade',
      curriculum: 'General Math',
    },
    upload: {
      sourceType: 'worksheet',
    },
  });

  assert.match(payload.parentReportJson.summary || '', /reliable worksheet content|reliable worksheet evidence/i);
  assert.equal(payload.structured.diagnosisOutline.primaryIssue, 'Needs manual review');
  assert.match(payload.parentReportJson.doThisWeek || '', /re-upload clearer pages|text-based PDF/i);
});
