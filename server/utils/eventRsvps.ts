import { useDrizzle, tables, eq, and } from './drizzle';

export async function upsertRsvp(
  userId: string,
  eventId: number,
  status: 'attending' | 'not_attending' | 'maybe',
  guestCount = 0,
) {
  // Try update first
  const updated = await useDrizzle()
    .update(tables.eventRsvps)
    .set({ status, guestCount })
    .where(
      and(
        eq(tables.eventRsvps.userId, userId),
        eq(tables.eventRsvps.eventId, eventId),
      ),
    )
    .returning()
    .get();
  if (updated) return updated;
  return useDrizzle()
    .insert(tables.eventRsvps)
    .values({ userId, eventId, status, guestCount })
    .returning()
    .get();
}

export async function deleteRsvp(userId: string, eventId: number) {
  return useDrizzle()
    .delete(tables.eventRsvps)
    .where(
      and(
        eq(tables.eventRsvps.userId, userId),
        eq(tables.eventRsvps.eventId, eventId),
      ),
    )
    .run();
}

export async function listRsvpsForEvent(eventId: number) {
  return useDrizzle()
    .select()
    .from(tables.eventRsvps)
    .where(eq(tables.eventRsvps.eventId, eventId))
    .all();
}
