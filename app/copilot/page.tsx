import { Suspense } from 'react';
import { CopilotPageClient } from '@/components/copilot/CopilotPageClient';

type CopilotPageProps = {
  searchParams: Promise<{ sessionId?: string; task?: string }>;
};

export default async function CopilotPage({ searchParams }: CopilotPageProps) {
  const params = await searchParams;
  return (
    <Suspense fallback={<main className="min-h-dvh bg-slate-950 text-white">Loading...</main>}>
      <CopilotPageClient initialSessionId={params.sessionId} initialTask={params.task} />
    </Suspense>
  );
}
