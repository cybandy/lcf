import { useDrizzle, tables, eq, and } from './drizzle';

export async function assignRoleToUser(userId: string, roleId: number) {
  return useDrizzle().insert(tables.userRoles).values({ userId, roleId }).run();
}

export async function removeRoleFromUser(userId: string, roleId: number) {
  return useDrizzle()
    .delete(tables.userRoles)
    .where(
      and(
        eq(tables.userRoles.userId, userId),
        eq(tables.userRoles.roleId, roleId),
      ),
    )
    .run();
}

export async function listRolesForUser(userId: string) {
  return useDrizzle()
    .select()
    .from(tables.userRoles)
    .where(eq(tables.userRoles.userId, userId))
    .all();
}
