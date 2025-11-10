import { useDrizzle, tables, eq } from './drizzle';

export async function createTimer(timer: {
  id?: string;
  label: string;
  totalDuration: number;
  eventId: number;
  speakerId: string;
  organizerId?: string;
}) {
  return useDrizzle().insert(tables.timers).values(timer).returning().get();
}

export async function getTimerById(id: string) {
  return useDrizzle()
    .select()
    .from(tables.timers)
    .where(eq(tables.timers.id, id))
    .get();
}

export async function updateTimer(
  id: string,
  patch: Partial<{ label: string; totalDuration: number }>,
) {
  return useDrizzle()
    .update(tables.timers)
    .set(patch)
    .where(eq(tables.timers.id, id))
    .returning();
}

export async function deleteTimer(id: string) {
  return useDrizzle()
    .delete(tables.timers)
    .where(eq(tables.timers.id, id))
    .run();
}

export async function listTimersForEvent(eventId: number) {
  return useDrizzle()
    .select()
    .from(tables.timers)
    .where(eq(tables.timers.eventId, eventId))
    .all();
}
