import { randomUUID } from 'node:crypto';
import { desc, eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  analysisRunModels,
  children,
  modelCallFailovers,
  subscriptions,
  teamMembers,
  teams,
  users,
} from '@/lib/db/schema';

const localSmokeSecret = process.env.LOCAL_SMOKE_SECRET?.trim() || '';

function isAuthorized(request: Request) {
  if (!localSmokeSecret) {
    return false;
  }

  return request.headers.get('x-local-smoke-secret') === localSmokeSecret;
}

type SeedBody = {
  action: 'seed-user';
  label: string;
};

type UnlockBody = {
  action: 'grant-single-review';
  label: string;
  userId: number;
  teamId: number;
};

type AuditBody = {
  action: 'read-model-audit';
  runId: number;
};

type LocalSmokeRequest = SeedBody | UnlockBody | AuditBody;

function isRetryableDbError(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes('connect_timeout') ||
    message.includes('fetch failed') ||
    message.includes('connection') ||
    message.includes('network') ||
    message.includes('neon')
  );
}

async function withDbRetry<T>(
  label: string,
  operation: () => Promise<T>,
  attempts = 4
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!isRetryableDbError(error) || attempt === attempts) {
        throw error;
      }

      console.warn(
        `[api/runtime/local-smoke] retrying ${label} after transient database error (${attempt}/${attempts - 1})`
      );
      await new Promise((resolve) => setTimeout(resolve, 1200 * attempt));
    }
  }

  throw lastError;
}

export async function POST(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = (await request.json()) as LocalSmokeRequest;

    if (body.action === 'seed-user') {
      const seeded = await withDbRetry(`seed-user:${body.label}`, async () =>
        db.transaction(async (tx) => {
          const suffix = `${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;
          const email = `kimi-${body.label}-${suffix}@example.com`;

          const [user] = await tx
            .insert(users)
            .values({
              name: `Kimi ${body.label} Parent`,
              email,
              passwordHash: 'not-used-for-kimi-smoke',
              role: 'owner',
              is18PlusConfirmed: true,
              country: 'US',
              timezone: 'America/Los_Angeles',
              locale: 'en-US',
            })
            .returning({ id: users.id, email: users.email });

          const [team] = await tx
            .insert(teams)
            .values({
              name: `Kimi ${body.label} Household`,
            })
            .returning({ id: teams.id });

          await tx.insert(teamMembers).values({
            userId: user.id,
            teamId: team.id,
            role: 'owner',
          });

          const [child] = await tx
            .insert(children)
            .values({
              userId: user.id,
              nickname: `KimiChild-${body.label}`,
              grade: '4th Grade',
              curriculum: 'Common Core',
            })
            .returning({ id: children.id, nickname: children.nickname });

          return {
            userId: user.id,
            email: user.email,
            teamId: team.id,
            childId: child.id,
            childNickname: child.nickname,
          };
        })
      );

      return Response.json(seeded);
    }

    if (body.action === 'grant-single-review') {
      const checkoutSessionId = `kimi_unlock_${body.label}_${randomUUID().slice(0, 8)}`;
      await withDbRetry(`grant-single-review:${body.label}`, async () =>
        db.transaction(async (tx) => {
          await tx.insert(subscriptions).values({
            teamId: body.teamId,
            userId: body.userId,
            provider: 'demo',
            planType: 'single_review',
            priceId: 'price_pathnook_single_review',
            status: 'active',
            checkoutSessionId,
            reportCredits: 1,
            unlockedReportIds: [],
          });
        })
      );

      return Response.json({
        ok: true,
        checkoutSessionId,
      });
    }

    if (body.action === 'read-model-audit') {
      const [modelRows, failoverRows] = await withDbRetry(
        `read-model-audit:${body.runId}`,
        async () =>
          Promise.all([
            db
              .select({
                runId: analysisRunModels.runId,
                attemptIndex: analysisRunModels.attemptIndex,
                providerName: analysisRunModels.providerName,
                modelName: analysisRunModels.modelName,
                status: analysisRunModels.status,
                finishReason: analysisRunModels.finishReason,
              })
              .from(analysisRunModels)
              .where(eq(analysisRunModels.runId, body.runId))
              .orderBy(analysisRunModels.attemptIndex),
            db
              .select({
                runId: modelCallFailovers.runId,
                fromProviderName: modelCallFailovers.fromProviderName,
                toProviderName: modelCallFailovers.toProviderName,
                errorType: modelCallFailovers.errorType,
              })
              .from(modelCallFailovers)
              .where(eq(modelCallFailovers.runId, body.runId))
              .orderBy(desc(modelCallFailovers.createdAt)),
          ])
      );

      return Response.json({
        modelRows,
        failoverRows,
      });
    }

    return Response.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error) {
    console.error('[api/runtime/local-smoke] failed', error);
    return Response.json(
      {
        error: error instanceof Error ? error.message : 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
