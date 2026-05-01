import { ChildForm } from '@/components/children/child-form';

type PageProps = {
  searchParams: Promise<{ resumeDraft?: string }>;
};

export default async function NewChildPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const resumeDraft = query.resumeDraft === '1';

  return (
    <section className="space-y-6">
      <section className="pn-section-card">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--pn-muted)]">
          <span>Members</span>
          <span>/</span>
          <span className="text-[#111827]">Add Member</span>
        </div>
        <h1 className="pn-section-title mt-4">Create a child learning profile</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[var(--pn-muted)]">
          {resumeDraft
            ? 'No child profile yet; create one to continue this diagnosis.'
            : 'Start with the minimum structure the dashboard needs: nickname, grade, and curriculum. This keeps future uploads and report history correctly scoped.'}
        </p>
      </section>

      <section className="pn-section-card max-w-3xl">
        <p className="pn-kicker">Child Profile</p>
        <h2 className="mt-2 text-[1.8rem] font-black tracking-[-0.04em] text-[#111827]">
          New member setup
        </h2>
        <div className="mt-6">
          <ChildForm mode="create" resumeDraft={resumeDraft} />
        </div>
      </section>
    </section>
  );
}
