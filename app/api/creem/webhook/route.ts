import { NextRequest, NextResponse } from 'next/server';
import { handlePrimaryBillingWebhook } from '@/lib/payments/webhook-route';
import { isCreemRoutesEnabled } from '@/lib/payments/service';

export async function POST(request: NextRequest) {
  if (!isCreemRoutesEnabled()) {
    return NextResponse.json({ error: 'Creem webhook route is disabled.' }, { status: 404 });
  }

  return handlePrimaryBillingWebhook(request, 'creem');
}
