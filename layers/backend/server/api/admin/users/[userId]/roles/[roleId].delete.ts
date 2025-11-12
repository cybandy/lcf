import { useValidatedParams, z } from 'h3-zod';
import { FellowshipPermission } from '#layers/backend/shared/utils/authorization';
import { requireFellowshipPermission } from '#layers/backend/server/utils/authorization';

/**
 * Remove a role from a user
 * Admin only
 */
export default defineEventHandler(async (event) => {
  // Require ASSIGN_ROLES permission
  await requireFellowshipPermission(event, FellowshipPermission.ASSIGN_ROLES);

  const { userId, roleId } = await useValidatedParams(
    event,
    z.object({
      userId: z.string(),
      roleId: z.coerce.number().int().positive(),
    }),
  );

  const db = useDrizzle();

  // Check if user has this role
  const userRole = await db
    .select()
    .from(tables.userRoles)
    .where(
      and(
        eq(tables.userRoles.userId, userId),
        eq(tables.userRoles.roleId, roleId),
      ),
    )
    .get();

  if (!userRole) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User does not have this role',
    });
  }

  // Remove role from user
  await db
    .delete(tables.userRoles)
    .where(
      and(
        eq(tables.userRoles.userId, userId),
        eq(tables.userRoles.roleId, roleId),
      ),
    )
    .run();

  return {
    success: true,
    message: 'Role removed from user successfully',
  };
});
