import { getUser } from '@/lib/db/queries';
import {
  listReminderEventsForUser,
  scheduleWeeklyReviewReminder,
} from '@/lib/notifications/reminders';

export async function GET() {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const events = await listReminderEventsForUser(user.id);
  return Response.json({ events });
}

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body || body.kind !== 'weekly_review') {
    return Response.json(
      { error: 'Only weekly_review scheduling is supported from this route.' },
      { status: 400 }
    );
  }

  const record = await scheduleWeeklyReviewReminder({
    userId: user.id,
    childId: typeof body.childId === 'number' ? body.childId : null,
    childNickname: typeof body.childNickname === 'string' ? body.childNickname : null,
    scheduledFor: typeof body.scheduledFor === 'string' ? body.scheduledFor : undefined,
  });

  return Response.json(
    {
      event: record,
      mode: 'safe_fallback',
    },
    { status: 201 }
  );
}
