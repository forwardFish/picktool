import { getUser } from '@/lib/db/queries';
import { processRunForUser } from '@/lib/family/repository';

type RouteContext = {
  params: Promise<{ runId: string }>;
};

function parseBoolean(value: string | null | undefined) {
  return value === '1' || value === 'true';
}

async function handleProcess(request: Request, context: RouteContext) {
  try {
    const user = await getUser();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { runId } = await context.params;
    const requestUrl = new URL(request.url);

    let body: { force?: boolean; preferMathpix?: boolean } = {};
    if (request.method === 'POST') {
      try {
        body = await request.json();
      } catch {
        body = {};
      }
    }

    const result = await processRunForUser(user.id, Number(runId), {
      force: body.force ?? parseBoolean(requestUrl.searchParams.get('force')),
      preferMathpix:
        body.preferMathpix ?? parseBoolean(requestUrl.searchParams.get('preferMathpix')),
    });

    if (!result) {
      return Response.json({ error: 'Run not found.' }, { status: 404 });
    }

    if (!result.bundle) {
      return Response.json(
        {
          error: 'This run cannot be processed while it is still failed.',
          run: result.run,
        },
        { status: 409 }
      );
    }

    return Response.json(result);
  } catch (error) {
    console.error('[api/runs/process] failed to process run', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: Request, context: RouteContext) {
  return handleProcess(request, context);
}

export async function POST(request: Request, context: RouteContext) {
  return handleProcess(request, context);
}
