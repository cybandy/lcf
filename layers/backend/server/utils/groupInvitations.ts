import { useDrizzle, tables, eq } from './drizzle';

export async function createGroupInvitation(inv: {
  groupId: number;
  invitedUserId: string;
  inviterUserId: string;
}) {
  return useDrizzle()
    .insert(tables.groupInvitations)
    .values(inv)
    .returning()
    .get();
}

export async function respondToInvitation(
  id: number,
  status: 'accepted' | 'declined' | 'pending',
) {
  return useDrizzle()
    .update(tables.groupInvitations)
    .set({ status })
    .where(eq(tables.groupInvitations.id, id))
    .returning();
}

export async function listInvitationsForUser(userId: string) {
  return useDrizzle()
    .select()
    .from(tables.groupInvitations)
    .where(eq(tables.groupInvitations.invitedUserId, userId))
    .all();
}
