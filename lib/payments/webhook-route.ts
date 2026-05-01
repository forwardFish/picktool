import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import {
  getTeamByStripeCustomerId,
  getUserByEmail,
} from '@/lib/db/queries';
import { teamMembers } from '@/lib/db/schema';
import { processBillingWebhookEvent } from '@/lib/family/billing';
import { getBillingPlanByPriceId } from '@/lib/payments/catalog';
import {
  getBillingProviderSelection,
  normalizeBillingWebhookPayload,
  verifyBillingWebhookSignature,
} from '@/lib/payments/service';

type BillingWebhookProvider = 'freemius' | 'creem';

type DemoWebhookEvent = {
  id?: string;
  eventType?: string;
  object?: Record<string, unknown>;
  userId?: number;
  priceId?: string;
};

function asObject(value: unknown) {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null;
}

function getObjectId(value: unknown) {
  const object = asObject(value);
  if (!object) {
    return typeof value === 'string' ? value : null;
  }

  return typeof object.id === 'string' || typeof object.id === 'number'
    ? String(object.id)
    : null;
}

function getMetadata(value: unknown) {
  const object = asObject(value);
  const metadata = asObject(object?.metadata);
  return metadata || {};
}

async function getTeamOwnerUserId(teamId: number) {
  const rows = await db
    .select({ userId: teamMembers.userId })
    .from(teamMembers)
    .where(eq(teamMembers.teamId, teamId))
    .limit(1);

  return rows[0]?.userId || null;
}

async function resolveCreemUserId(rawEvent: Record<string, unknown>) {
  const object = asObject(rawEvent.object) || {};
  const metadata = getMetadata(object);
  const metadataUserId = Number(
    metadata.userId || metadata.referenceId || metadata.internal_customer_id
  );

  if (Number.isInteger(metadataUserId) && metadataUserId > 0) {
    return metadataUserId;
  }

  const customerId = getObjectId(object.customer);
  if (!customerId) {
    return null;
  }

  const team = await getTeamByStripeCustomerId(customerId);
  if (!team) {
    return null;
  }

  return getTeamOwnerUserId(team.id);
}

async function resolveFreemiusUserId(rawEvent: Record<string, unknown>) {
  const objects = asObject(rawEvent.objects) || {};
  const user = asObject(objects.user);
  const email = typeof user?.email === 'string' ? user.email : null;

  if (!email) {
    return null;
  }

  const localUser = await getUserByEmail(email);
  return localUser?.id || null;
}

function getSignatureHeader(request: NextRequest, provider: BillingWebhookProvider) {
  return provider === 'freemius'
    ? request.headers.get('x-signature')
    : request.headers.get('creem-signature');
}

async function handleDemoWebhook(request: NextRequest) {
  const payload = (await request.json().catch(() => null)) as DemoWebhookEvent | null;
  const object = asObject(payload?.object) || {};
  const userId = Number(object.userId || payload?.userId);
  const priceId = String(object.priceId || payload?.priceId || '');

  if (!Number.isInteger(userId) || !getBillingPlanByPriceId(priceId)) {
    return NextResponse.json(
      { error: 'Demo webhook requires userId and a supported priceId.' },
      { status: 400 }
    );
  }

  const result = await processBillingWebhookEvent({
    source: 'demo',
    eventId: String(payload?.id || `demo_event_${Date.now()}`),
    eventType: String(payload?.eventType || 'checkout.completed'),
    payload: payload || {},
    userId,
    priceId,
    checkoutSessionId:
      typeof object.checkoutSessionId === 'string' ? object.checkoutSessionId : null,
    stripeCustomerId:
      typeof object.stripeCustomerId === 'string' ? object.stripeCustomerId : null,
    stripeSubscriptionId:
      typeof object.stripeSubscriptionId === 'string' ? object.stripeSubscriptionId : null,
    status: typeof object.status === 'string' ? object.status : 'active',
    currentPeriodEndsAt:
      typeof object.currentPeriodEndsAt === 'string' ? object.currentPeriodEndsAt : null,
  });

  return NextResponse.json({
    received: true,
    applied: result.applied,
    snapshot: result.snapshot,
  });
}

export async function handlePrimaryBillingWebhook(
  request: NextRequest,
  providerName?: BillingWebhookProvider
) {
  if (process.env['FAMILY_EDU_DEMO_MODE'] === '1') {
    return handleDemoWebhook(request);
  }

  const provider = providerName || getBillingProviderSelection().active;
  const payloadText = await request.text();
  const signature = getSignatureHeader(request, provider);

  if (!verifyBillingWebhookSignature(payloadText, signature, provider)) {
    return NextResponse.json({ error: 'Invalid billing signature.' }, { status: 401 });
  }

  let event: Record<string, unknown>;

  try {
    event = JSON.parse(payloadText) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  try {
    const normalized = normalizeBillingWebhookPayload(event, provider);
    if (!normalized.priceId || !getBillingPlanByPriceId(normalized.priceId)) {
      return NextResponse.json({ received: true, ignored: true });
    }

    const resolvedUserId =
      provider === 'freemius'
        ? await resolveFreemiusUserId(event)
        : await resolveCreemUserId(event);

    if (!resolvedUserId) {
      return NextResponse.json({ received: true, ignored: true });
    }

    const result = await processBillingWebhookEvent({
      source: provider,
      eventId: normalized.eventId,
      eventType: normalized.eventType,
      payload: event,
      userId: resolvedUserId,
      priceId: normalized.priceId,
      checkoutSessionId: normalized.checkoutSessionId,
      stripeCustomerId: normalized.providerCustomerId,
      stripeSubscriptionId: normalized.providerSubscriptionId,
      status: normalized.status,
      currentPeriodEndsAt: normalized.currentPeriodEndsAt,
    });

    return NextResponse.json({
      received: true,
      applied: result.applied,
      snapshot: result.snapshot,
    });
  } catch (error) {
    console.error('Primary billing webhook processing failed.', error);
    return NextResponse.json({ error: 'Webhook processing failed.' }, { status: 500 });
  }
}
