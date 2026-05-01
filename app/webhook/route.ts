import { NextRequest } from 'next/server';
import { handlePrimaryBillingWebhook } from '@/lib/payments/webhook-route';

export async function POST(request: NextRequest) {
  return handlePrimaryBillingWebhook(request);
}
