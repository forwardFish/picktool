import { ArchiveDetailClient } from '@/components/copilot/ArchiveDetailClient';

type ArchiveDetailPageProps = { params: Promise<{ id: string }> };

export default async function ArchiveDetailPage({ params }: ArchiveDetailPageProps) {
  const { id } = await params;
  return <ArchiveDetailClient id={id} />;
}
