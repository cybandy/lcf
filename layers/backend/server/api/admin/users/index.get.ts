import { FellowshipPermission } from '#layers/backend/shared/utils/authorization';
import { requireFellowshipPermission } from '#layers/backend/server/utils/authorization';

/**
 * Get all users with their roles
 * Admin only
 */
export default defineEventHandler(async (event) => {
  // Require VIEW_USERS permission
  await requireFellowshipPermission(event, FellowshipPermission.VIEW_USERS);

  const db = useDrizzle();

  // Get all users with their roles
  const usersWithRoles = await db
    .select({
      // User fields
      id: tables.users.id,
      firstName: tables.users.firstName,
      lastName: tables.users.lastName,
      email: tables.users.email,
      status: tables.users.status,
      avatar: tables.users.avatar,
      // createdAt: tables.users.createdAt,
      // Role fields
      roleId: tables.roles.id,
      roleName: tables.roles.name,
    })
    .from(tables.users)
    .leftJoin(tables.userRoles, eq(tables.users.id, tables.userRoles.userId))
    .leftJoin(tables.roles, eq(tables.userRoles.roleId, tables.roles.id))
    .orderBy(tables.users.firstName, tables.users.lastName)
    .all();

  // Group roles by user
  interface UserWithRoles {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    status: string;
    avatar?: string | null;
    // createdAt: Date;
    roles: Array<{ id: number; name: string }>;
  }

  const usersMap = new Map<string, UserWithRoles>();

  for (const row of usersWithRoles) {
    if (!usersMap.has(row.id)) {
      usersMap.set(row.id, {
        id: row.id,
        firstName: row.firstName,
        lastName: row.lastName,
        email: row.email,
        status: row.status,
        avatar: !row.avatar ? null : `/files/${row.avatar}`,
        // createdAt: row.createdAt,
        roles: [],
      });
    }

    if (row.roleId !== null) {
      usersMap.get(row.id)!.roles.push({
        id: row.roleId,
        name: row.roleName!,
      });
    }
  }

  const users = Array.from(usersMap.values());

  return {
    success: true,
    users,
  };
});
