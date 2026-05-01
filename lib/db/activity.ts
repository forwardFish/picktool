import { db } from './drizzle';
import {
  ActivityType,
  activityLogs,
  type NewActivityLog,
} from './schema';

export async function logActivity(
  teamId: number | null | undefined,
  userId: number,
  type: ActivityType,
  ipAddress?: string
) {
  if (teamId === null || teamId === undefined) {
    return;
  }

  const newActivity: NewActivityLog = {
    teamId,
    userId,
    action: type,
    ipAddress: ipAddress || ''
  };

  await db.insert(activityLogs).values(newActivity);
}
