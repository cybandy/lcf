import { useDrizzle, tables, eq, and } from './drizzle';

export async function addMemberToGroup(
  userId: string,
  groupId: number,
  role: 'leader' | 'member' = 'member',
) {
  return useDrizzle()
    .insert(tables.membersToGroups)
    .values({ userId, groupId, role })
    .run();
}

export async function removeMemberFromGroup(userId: string, groupId: number) {
  return useDrizzle()
    .delete(tables.membersToGroups)
    .where(
      and(
        eq(tables.membersToGroups.userId, userId),
        eq(tables.membersToGroups.groupId, groupId),
      ),
    )
    .run();
}

export async function listGroupsForUser(userId: string) {
  return useDrizzle()
    .select()
    .from(tables.membersToGroups)
    .where(eq(tables.membersToGroups.userId, userId))
    .all();
}

export async function listMembersForGroup(groupId: number) {
  return useDrizzle()
    .select()
    .from(tables.membersToGroups)
    .where(eq(tables.membersToGroups.groupId, groupId))
    .all();
}

export async function updateMemberRole(
  userId: string,
  groupId: number,
  role: 'leader' | 'member',
) {
  return useDrizzle()
    .update(tables.membersToGroups)
    .set({ role })
    .where(
      and(
        eq(tables.membersToGroups.userId, userId),
        eq(tables.membersToGroups.groupId, groupId),
      ),
    )
    .returning();
}
