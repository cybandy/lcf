import { useDrizzle, tables, eq } from './drizzle';

export async function createTimerSegment(segment: {
  timerId: string;
  label: string;
  duration: number;
  order?: number;
}) {
  return useDrizzle()
    .insert(tables.timerSegments)
    .values(segment)
    .returning()
    .get();
}

export async function getTimerSegmentById(id: number) {
  return useDrizzle()
    .select()
    .from(tables.timerSegments)
    .where(eq(tables.timerSegments.id, id))
    .get();
}

export async function updateTimerSegment(
  id: number,
  patch: Partial<{ label: string; duration: number; order: number }>,
) {
  return useDrizzle()
    .update(tables.timerSegments)
    .set(patch)
    .where(eq(tables.timerSegments.id, id))
    .returning();
}

export async function deleteTimerSegment(id: number) {
  return useDrizzle()
    .delete(tables.timerSegments)
    .where(eq(tables.timerSegments.id, id))
    .run();
}

export async function listSegmentsForTimer(timerId: string) {
  return useDrizzle()
    .select()
    .from(tables.timerSegments)
    .where(eq(tables.timerSegments.timerId, timerId))
    .all();
}
