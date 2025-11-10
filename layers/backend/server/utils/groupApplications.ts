import { useDrizzle, tables, eq } from './drizzle';

export async function createGroupApplication(app: {
  userId: string;
  groupId: number;
}) {
  return useDrizzle()
    .insert(tables.groupApplications)
    .values(app)
    .returning()
    .get();
}

export async function reviewGroupApplication(
  id: number,
  reviewerId: string | null,
  status: 'approved' | 'rejected',
) {
  return useDrizzle()
    .update(tables.groupApplications)
    .set({ reviewedById: reviewerId, status, reviewedAt: new Date() })
    .where(eq(tables.groupApplications.id, id))
    .returning();
}

export async function listApplicationsForGroup(groupId: number) {
  return useDrizzle()
    .select()
    .from(tables.groupApplications)
    .where(eq(tables.groupApplications.groupId, groupId))
    .all();
}
