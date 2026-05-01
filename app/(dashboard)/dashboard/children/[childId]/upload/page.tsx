import { notFound } from 'next/navigation';
import { FileCheck2, Layers3, Upload } from 'lucide-react';
import { UploadWorkspace } from '@/components/uploads/upload-workspace';
import { getUser } from '@/lib/db/queries';
import { getChildForUser } from '@/lib/family/repository';

type PageProps = {
  params: Promise<{ childId: string }>;
  searchParams: Promise<{ resumeDraft?: string }>;
};

export default async function ChildUploadPage({ params, searchParams }: PageProps) {
  const [{ childId }, query, user] = await Promise.all([params, searchParams, getUser()]);

  if (!user) {
    notFound();
  }

  const child = await getChildForUser(user.id, Number(childId));
  if (!child) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div className="pn-section-card">
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="pn-kicker">Upload Intake</p>
            <h1 className="pn-section-title mt-3">Prepare a diagnosis run for {child.nickname}</h1>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--pn-muted)]">
              Upload 5-10 pages from a worksheet, quiz, test, or correction packet. The intake
              flow checks page count and quality, then stores parent context before the run enters
              the async lifecycle.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="pn-info-tile">
              <div className="flex items-start gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-[1rem] bg-[var(--pn-soft)] text-[var(--pn-violet)]">
                  <Upload className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-base font-bold text-[#111827]">What to upload</p>
                  <p className="mt-1 text-sm leading-7 text-[var(--pn-muted)]">
                    Use recent schoolwork that clearly shows the current breakdown point.
                  </p>
                </div>
              </div>
            </div>
            <div className="pn-info-tile">
              <div className="flex items-start gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-[1rem] bg-[var(--pn-soft)] text-[var(--pn-violet)]">
                  <FileCheck2 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-base font-bold text-[#111827]">What gets validated</p>
                  <p className="mt-1 text-sm leading-7 text-[var(--pn-muted)]">
                    Page count, blur, darkness, and rotation quality warnings.
                  </p>
                </div>
              </div>
            </div>
            <div className="pn-info-tile">
              <div className="flex items-start gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-[1rem] bg-[var(--pn-soft)] text-[var(--pn-violet)]">
                  <Layers3 className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-base font-bold text-[#111827]">Where it goes next</p>
                  <p className="mt-1 text-sm leading-7 text-[var(--pn-muted)]">
                    The run can move into queued, processing, needs review, or ready-for-report.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pn-section-card">
        <UploadWorkspace
          childId={child.id}
          childNickname={child.nickname}
          resumeDraft={query.resumeDraft === '1'}
        />
      </div>
    </section>
  );
}
