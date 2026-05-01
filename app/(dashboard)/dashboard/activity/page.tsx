import {
  AlertCircle,
  CheckCircle,
  FileUp,
  Lock,
  LogOut,
  Mail,
  RefreshCcw,
  Settings,
  UserCog,
  UserMinus,
  UserPlus,
  type LucideIcon,
} from 'lucide-react';
import { ActivityType } from '@/lib/db/schema';
import { getActivityLogs } from '@/lib/db/queries';

type ActivityLogEntry = Awaited<ReturnType<typeof getActivityLogs>>[number];

const iconMap: Record<ActivityType, LucideIcon> = {
  [ActivityType.SIGN_UP]: UserPlus,
  [ActivityType.SIGN_IN]: UserCog,
  [ActivityType.SIGN_OUT]: LogOut,
  [ActivityType.UPDATE_PASSWORD]: Lock,
  [ActivityType.DELETE_ACCOUNT]: UserMinus,
  [ActivityType.UPDATE_ACCOUNT]: Settings,
  [ActivityType.CREATE_TEAM]: UserPlus,
  [ActivityType.REMOVE_TEAM_MEMBER]: UserMinus,
  [ActivityType.INVITE_TEAM_MEMBER]: Mail,
  [ActivityType.ACCEPT_INVITATION]: CheckCircle,
  [ActivityType.CREATE_CHILD]: UserPlus,
  [ActivityType.UPDATE_CHILD]: Settings,
  [ActivityType.ARCHIVE_CHILD]: UserMinus,
  [ActivityType.CREATE_UPLOAD]: FileUp,
  [ActivityType.SUBMIT_UPLOAD]: CheckCircle,
  [ActivityType.RETRY_RUN]: RefreshCcw,
};

function getRelativeTime(date: Date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return date.toLocaleDateString();
}

function formatAction(action: ActivityType): string {
  switch (action) {
    case ActivityType.SIGN_UP:
      return 'You signed up';
    case ActivityType.SIGN_IN:
      return 'You signed in';
    case ActivityType.SIGN_OUT:
      return 'You signed out';
    case ActivityType.UPDATE_PASSWORD:
      return 'You changed your password';
    case ActivityType.DELETE_ACCOUNT:
      return 'You deleted your account';
    case ActivityType.UPDATE_ACCOUNT:
      return 'You updated your account';
    case ActivityType.CREATE_TEAM:
      return 'You created a new team';
    case ActivityType.REMOVE_TEAM_MEMBER:
      return 'You removed a team member';
    case ActivityType.INVITE_TEAM_MEMBER:
      return 'You invited a team member';
    case ActivityType.ACCEPT_INVITATION:
      return 'You accepted an invitation';
    case ActivityType.CREATE_CHILD:
      return 'You created a child profile';
    case ActivityType.UPDATE_CHILD:
      return 'You updated a child profile';
    case ActivityType.ARCHIVE_CHILD:
      return 'You archived a child profile';
    case ActivityType.CREATE_UPLOAD:
      return 'You prepared an upload';
    case ActivityType.SUBMIT_UPLOAD:
      return 'You submitted an upload for analysis';
    case ActivityType.RETRY_RUN:
      return 'You retried an analysis run';
    default:
      return 'Unknown action occurred';
  }
}

export default async function ActivityPage() {
  const logs: ActivityLogEntry[] = await getActivityLogs();

  return (
    <section className="space-y-6">
      <section className="pn-section-card">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--pn-muted)]">
          <span>Account</span>
          <span>/</span>
          <span className="text-[#111827]">Activity</span>
        </div>
        <h1 className="pn-section-title mt-4">Household Activity</h1>
        <p className="mt-3 max-w-3xl text-lg leading-8 text-[var(--pn-muted)]">
          Keep recent account, child, upload, and retry actions visible in one readable timeline.
        </p>
      </section>

      <section className="pn-section-card">
        <h2 className="text-[1.8rem] font-black tracking-[-0.04em] text-[#111827]">
          Recent Activity
        </h2>
        {logs.length > 0 ? (
          <div className="mt-6 space-y-4">
            {logs.map((log: ActivityLogEntry) => {
              const action = log.action as ActivityType;
              const Icon = iconMap[action] || Settings;
              return (
                <div key={log.id} className="rounded-[1.25rem] border border-[var(--pn-border)] bg-white p-4">
                  <div className="flex items-start gap-4">
                    <div className="grid h-11 w-11 place-items-center rounded-full bg-[var(--pn-soft)] text-[var(--pn-violet)]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#111827]">
                        {formatAction(action)}
                        {log.ipAddress ? ` from IP ${log.ipAddress}` : ''}
                      </p>
                      <p className="mt-1 text-sm text-[var(--pn-muted)]">
                        {getRelativeTime(new Date(log.timestamp))}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 rounded-[1.25rem] border border-[var(--pn-border)] bg-white p-8 text-center">
            <AlertCircle className="mx-auto h-10 w-10 text-[var(--pn-violet)]" />
            <h3 className="mt-4 text-xl font-black text-[#111827]">No activity yet</h3>
            <p className="mt-2 text-sm leading-7 text-[var(--pn-muted)]">
              When you perform actions like signing in, updating an account, or uploading work,
              they will appear here.
            </p>
          </div>
        )}
      </section>
    </section>
  );
}
