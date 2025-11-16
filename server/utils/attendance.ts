import { useDrizzle, tables, eq, and } from './drizzle';

export async function markAttendance(userId: string, eventId: number) {
  return useDrizzle()
    .insert(tables.attendance)
    .values({ userId, eventId })
    .run();
}

export async function removeAttendance(userId: string, eventId: number) {
  return useDrizzle()
    .delete(tables.attendance)
    .where(
      and(
        eq(tables.attendance.userId, userId),
        eq(tables.attendance.eventId, eventId),
      ),
    )
    .run();
}

export async function listAttendanceForEvent(eventId: number) {
  return useDrizzle()
    .select()
    .from(tables.attendance)
    .where(eq(tables.attendance.eventId, eventId))
    .all();
}

export async function listEventsForUser(userId: string) {
  return useDrizzle()
    .select()
    .from(tables.attendance)
    .where(eq(tables.attendance.userId, userId))
    .all();
}
