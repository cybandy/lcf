import { useDrizzle, tables, eq } from './drizzle';

export async function createEvent(ev: {
  title: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  location?: string;
  creatorId?: string;
}) {
  return useDrizzle().insert(tables.events).values(ev).returning().get();
}

export async function getEventById(id: number) {
  return useDrizzle()
    .select()
    .from(tables.events)
    .where(eq(tables.events.id, id))
    .get();
}

export async function updateEvent(
  id: number,
  patch: Partial<{
    title: string;
    description?: string;
    startTime?: Date;
    endTime?: Date;
    location?: string;
  }>,
) {
  return useDrizzle()
    .update(tables.events)
    .set(patch)
    .where(eq(tables.events.id, id))
    .returning();
}

export async function deleteEvent(id: number) {
  return useDrizzle()
    .delete(tables.events)
    .where(eq(tables.events.id, id))
    .run();
}

export async function listEvents() {
  return useDrizzle()
    .select()
    .from(tables.events)
    .orderBy(tables.events.startTime)
    .all();
}
