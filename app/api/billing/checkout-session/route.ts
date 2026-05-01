import { createCheckoutRouteResponse } from '@/lib/payments/route-contracts';

export async function POST(request: Request) {
  return createCheckoutRouteResponse(request);
}
