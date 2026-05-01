import { z } from 'zod';
import { getTeamForUser, getUser } from '@/lib/db/queries';
import { getBillingPlanByPriceId } from './catalog';
import {
  createBillingHostedCheckoutSession,
  createBillingPortalSession,
} from './service';

export const checkoutRequestSchema = z.object({
  priceId: z.string().min(1),
});

export async function createCheckoutRouteResponse(request: Request) {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const team = await getTeamForUser();
  if (!team) {
    return Response.json({ error: 'Team not found.' }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const result = checkoutRequestSchema.safeParse(body);
  if (!result.success) {
    return Response.json({ error: 'priceId is required.' }, { status: 400 });
  }

  const plan = getBillingPlanByPriceId(result.data.priceId);
  if (!plan) {
    return Response.json({ error: 'Unknown priceId.' }, { status: 400 });
  }

  try {
    const session = await createBillingHostedCheckoutSession({
      team,
      priceId: result.data.priceId,
      userEmail: user.email,
      userId: user.id,
    });

    return Response.json({
      provider: session.provider,
      checkoutUrl: session.checkoutUrl,
      sessionId: session.sessionId,
      priceId: result.data.priceId,
      planType: session.planType,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Billing checkout is unavailable.';
    return Response.json({ error: message }, { status: 400 });
  }
}

export async function createPortalRouteResponse() {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const team = await getTeamForUser();
  if (!team) {
    return Response.json({ error: 'Team not found.' }, { status: 404 });
  }

  try {
    const portal = await createBillingPortalSession({
      team: {
        id: team.id,
        stripeCustomerId: team.stripeCustomerId,
      },
      userEmail: user.email,
    });

    return Response.json({
      url: portal.url,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Billing portal is unavailable.';
    return Response.json({ error: message }, { status: 400 });
  }
}
