import { DecisionResultView } from '@/components/picktool/decision-result';
import type { DecisionResult } from '@/lib/schemas/toolDecision';

export function DecisionSummary({ decision }: { decision: DecisionResult }) {
  return <DecisionResultView decision={decision} />;
}

export function BestToolSetup({ decision }: { decision: DecisionResult }) {
  return <DecisionResultView decision={decision} />;
}

export function HowToUse({ decision }: { decision: DecisionResult }) {
  return <DecisionResultView decision={decision} />;
}

export function BetterOptionsAndCost({ decision }: { decision: DecisionResult }) {
  return <DecisionResultView decision={decision} />;
}
