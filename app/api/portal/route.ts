import { createPortalRouteResponse } from '@/lib/payments/route-contracts';

export async function POST() {
  return createPortalRouteResponse();
}
