import { z } from 'zod';
import { getUser } from '@/lib/db/queries';
import {
  createUploadForUser,
  getChildForUser,
} from '@/lib/family/repository';
import { persistUploadFiles } from '@/lib/family/upload-storage';

const sourceTypeSchema = z.enum([
  'homework',
  'quiz',
  'test',
  'correction',
  'worksheet',
]);

const pageDraftSchema = z.object({
  previewKind: z.enum(['image', 'pdf']),
  pageCount: z.number().int().positive(),
  pages: z.array(
    z.object({
      pageNumber: z.number().int().positive(),
      previewLabel: z.string().min(1),
      qualityFlags: z.object({
        blurry: z.boolean(),
        rotated: z.boolean(),
        dark: z.boolean(),
        lowContrast: z.boolean(),
        width: z.number().optional(),
        height: z.number().optional(),
      }),
    })
  ),
});

const concernSchema = z
  .array(z.string().trim().min(1))
  .max(6)
  .default([]);

export async function POST(request: Request) {
  try {
    const user = await getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const childId = Number(formData.get('childId'));
    const sourceType = sourceTypeSchema.safeParse(formData.get('sourceType'));
    const notes = String(formData.get('notes') || '').trim();
    const diagnosticGoal = String(formData.get('diagnosticGoal') || '').trim();
    const recentTrend = String(formData.get('recentTrend') || '').trim();
    const teacherFeedbackPresent = String(formData.get('teacherFeedbackPresent') || '') === 'true';
    const hasTutor = String(formData.get('hasTutor') || '') === 'true';
    const parentConcernPayload = String(formData.get('parentConcernJson') || '[]');
    const draftPayload = String(formData.get('pageDrafts') || '[]');
    const files = formData.getAll('files').filter((entry): entry is File => entry instanceof File);

    if (!Number.isInteger(childId) || childId <= 0) {
      return Response.json({ error: 'A valid child is required.' }, { status: 400 });
    }

    if (!sourceType.success) {
      return Response.json({ error: 'A valid source type is required.' }, { status: 400 });
    }

    if (files.length === 0) {
      return Response.json({ error: 'Upload at least one file.' }, { status: 400 });
    }

    const child = await getChildForUser(user.id, childId);
    if (!child) {
      return Response.json({ error: 'Child not found.' }, { status: 404 });
    }

    let pageDrafts: z.infer<typeof pageDraftSchema>[];
    let parentConcernJson: string[];
    try {
      const parsed = JSON.parse(draftPayload);
      const result = z.array(pageDraftSchema).safeParse(parsed);
      if (!result.success) {
        return Response.json({ error: 'Upload draft metadata is invalid.' }, { status: 400 });
      }
      pageDrafts = result.data;
    } catch {
      return Response.json({ error: 'Upload draft metadata is invalid.' }, { status: 400 });
    }

    try {
      const parsedConcerns = JSON.parse(parentConcernPayload);
      const concernsResult = concernSchema.safeParse(parsedConcerns);
      if (!concernsResult.success) {
        return Response.json({ error: 'Parent concerns are invalid.' }, { status: 400 });
      }
      parentConcernJson = concernsResult.data;
    } catch {
      return Response.json({ error: 'Parent concerns are invalid.' }, { status: 400 });
    }

    const persistedFiles = await persistUploadFiles(files, pageDrafts);
    const totalPages = persistedFiles.reduce((sum, file) => sum + file.pageCount, 0);

    if (totalPages < 5) {
      return Response.json(
        { error: 'At least 5 pages are required before generating a diagnosis.' },
        { status: 400 }
      );
    }

    if (totalPages > 10) {
      return Response.json(
        { error: 'Uploads currently accept up to 10 pages at a time.' },
        { status: 400 }
      );
    }

    const result = await createUploadForUser(user.id, {
      childId,
      sourceType: sourceType.data,
      notes,
      intake: {
        diagnosticGoal: diagnosticGoal || null,
        recentTrend: recentTrend || null,
        parentConcernJson,
        teacherFeedbackPresent,
        hasTutor,
        intakeCompletedAt: new Date().toISOString(),
      },
      files: persistedFiles,
    });

    return Response.json(
      {
        upload: result.upload,
        pages: result.pages,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[api/uploads] failed to create upload', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
