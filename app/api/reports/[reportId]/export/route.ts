import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { getUser } from '@/lib/db/queries';
import { isReportUnlockedForUser } from '@/lib/family/billing';
import { getReportForUser } from '@/lib/family/repository';
import { localizeParentReport, resolveReportLocale } from '@/lib/reports/localize';

type RouteContext = {
  params: Promise<{ reportId: string }>;
};

function drawParagraph(
  page: import('pdf-lib').PDFPage,
  font: import('pdf-lib').PDFFont,
  text: string,
  x: number,
  startY: number,
  size = 12,
  lineGap = 16
) {
  let y = startY;
  const words = text.split(/\s+/);
  let line = '';

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > 470) {
      page.drawText(line, { x, y, size, font, color: rgb(0.18, 0.2, 0.24) });
      line = word;
      y -= lineGap;
    } else {
      line = candidate;
    }
  }

  if (line) {
    page.drawText(line, { x, y, size, font, color: rgb(0.18, 0.2, 0.24) });
    y -= lineGap;
  }

  return y;
}

export async function GET(request: Request, context: RouteContext) {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { reportId } = await context.params;
  const numericReportId = Number(reportId);
  const report = await getReportForUser(user.id, numericReportId);
  if (!report) {
    return Response.json({ error: 'Report not found.' }, { status: 404 });
  }

  const isUnlocked = await isReportUnlockedForUser(user.id, numericReportId);
  if (!isUnlocked) {
    return Response.json({ error: 'Report is locked until payment is completed.' }, { status: 402 });
  }

  const locale = resolveReportLocale(
    new URL(request.url).searchParams.get('locale'),
    user.locale || 'en-US'
  );
  const parentReport = localizeParentReport(
    ((report as any).parentReportJson || {}) as any,
    locale
  );
  const pdf = await PDFDocument.create();
  const titleFont = await pdf.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await pdf.embedFont(StandardFonts.Helvetica);
  let page = pdf.addPage([612, 792]);
  let y = 730;

  page.drawText(parentReport.labels?.parentReport || 'Parent Report', {
    x: 48,
    y,
    size: 11,
    font: titleFont,
    color: rgb(0.91, 0.38, 0.1),
  });
  y -= 28;
  page.drawText(parentReport.labels?.diagnosisHeadline || 'Diagnosis, evidence, and next steps', {
    x: 48,
    y,
    size: 22,
    font: titleFont,
    color: rgb(0.12, 0.14, 0.18),
  });
  y -= 34;

  const summaryLines = [
    `${parentReport.labels?.child || 'Child'}: ${parentReport.childNickname || 'Unknown child'}`,
    `${parentReport.labels?.grade || 'Grade'}: ${parentReport.grade || 'Not provided'}`,
    `${parentReport.labels?.sourceType || 'Source type'}: ${parentReport.sourceType || 'Upload'}`,
    `${parentReport.labels?.confidence || 'Confidence'}: ${
      typeof parentReport.confidence === 'number'
        ? `${Math.round(parentReport.confidence * 100)}%`
        : 'Unavailable'
    }`,
  ];

  for (const line of summaryLines) {
    page.drawText(line, {
      x: 48,
      y,
      size: 12,
      font: bodyFont,
      color: rgb(0.18, 0.2, 0.24),
    });
    y -= 18;
  }

  y -= 8;
  y = drawParagraph(page, bodyFont, parentReport.summary || '', 48, y, 12, 17);
  y -= 10;

  for (const finding of parentReport.topFindings || []) {
    if (y < 160) {
      page = pdf.addPage([612, 792]);
      y = 730;
    }
    page.drawText(finding.title || 'Finding', {
      x: 48,
      y,
      size: 14,
      font: titleFont,
      color: rgb(0.12, 0.14, 0.18),
    });
    y -= 18;
    y = drawParagraph(page, bodyFont, finding.whatToDo || '', 48, y, 12, 16);
    y = drawParagraph(page, bodyFont, finding.rationale || '', 48, y, 11, 15);
    y -= 8;
  }

  page = pdf.addPage([612, 792]);
  y = 730;
  page.drawText(parentReport.labels?.sevenDayPlan || '7-Day Plan', {
    x: 48,
    y,
    size: 18,
    font: titleFont,
    color: rgb(0.12, 0.14, 0.18),
  });
  y -= 28;

  for (const day of parentReport.sevenDayPlan || []) {
    if (y < 140) {
      page = pdf.addPage([612, 792]);
      y = 730;
    }
    page.drawText(`${parentReport.labels?.day || 'Day'} ${day.day}: ${day.goal || ''}`, {
      x: 48,
      y,
      size: 13,
      font: titleFont,
      color: rgb(0.12, 0.14, 0.18),
    });
    y -= 18;
    y = drawParagraph(page, bodyFont, day.practice || '', 48, y, 11, 15);
    y = drawParagraph(page, bodyFont, day.parentPrompt || '', 48, y, 11, 15);
    y = drawParagraph(page, bodyFont, day.successSignal || '', 48, y, 11, 15);
    y -= 10;
  }

  const bytes = await pdf.save();
  return new Response(Buffer.from(bytes), {
    status: 200,
    headers: {
      'content-type': 'application/pdf',
      'content-disposition': `attachment; filename="pathnook-report-${numericReportId}.pdf"`,
    },
  });
}
