import { alias, type GroupApplications, type MembersToGroupsInsert } from './drizzle'

export async function listAllGroups() {
  return useDrizzle().query.groups.findMany()
}

export async function listUserGroups(user_id: string) {
  return useDrizzle()
    .select({
      id: tables.groups.id,
      name: tables.groups.name,
      description: tables.groups.description,
    })
    .from(tables.membersToGroups)
    .innerJoin(tables.users, eq(tables.membersToGroups.userId, tables.users.id))
    .innerJoin(tables.groups, eq(tables.membersToGroups.groupId, tables.groups.id))
    .where(eq(tables.users.id, user_id))
}

export async function removeFromGroup(user_id: string, group_id: number) {
  return useDrizzle().delete(tables.membersToGroups).where(
    and(
      eq(tables.membersToGroups.userId, user_id),
      eq(tables.membersToGroups.groupId, group_id)
    )
  )
}
export async function addToGroup(payload: MembersToGroupsInsert) {
  return useDrizzle().insert(tables.membersToGroups).values(payload)
}
export async function applyToGroup(payload: GroupApplications[]) {
  return useDrizzle().insert(tables.groupApplications).values(payload).onConflictDoNothing()
}

export async function GetGroupInvitations(userId: string) {
  // const inviter = alias(tables.users, 'inviter')
  const invited = alias(tables.users, 'invited')
  return useDrizzle()
    .select({
      id: tables.groupInvitations.groupId,
      name: tables.groups.name,
      description: tables.groups.description,
      // inviter_name: inviter
    })
    .from(tables.groupInvitations)
    .innerJoin(tables.groups, eq(tables.groups.id, tables.groupInvitations.groupId))
    .innerJoin(tables.users, eq(invited.id, tables.groupInvitations.invitedUserId))
    .where(eq(invited.id, userId))
}
