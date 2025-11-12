import { useValidatedBody, useValidatedParams, z } from 'h3-zod';
import { FellowshipPermission } from '#layers/backend/shared/utils/authorization';
import { requireFellowshipPermission } from '#layers/backend/server/utils/authorization';

/**
 * Assign a role to a user
 * Admin only
 */
export default defineEventHandler(async (event) => {
  // Require ASSIGN_ROLES permission
  await requireFellowshipPermission(event, FellowshipPermission.ASSIGN_ROLES);

  const { userId } = await useValidatedParams(
    event,
    z.object({
      userId: z.string(),
    }),
  );

  const body = await useValidatedBody(
    event,
    z.object({
      roleId: z.number().int().positive(),
    }),
  );

  const db = useDrizzle();

  // Check if user exists
  const user = await db
    .select()
    .from(tables.users)
    .where(eq(tables.users.id, userId))
    .get();

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found',
    });
  }

  // Check if role exists
  const role = await db
    .select()
    .from(tables.roles)
    .where(eq(tables.roles.id, body.roleId))
    .get();

  if (!role) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Role not found',
    });
  }

  // Check if user already has this role
  const existingUserRole = await db
    .select()
    .from(tables.userRoles)
    .where(
      and(
        eq(tables.userRoles.userId, userId),
        eq(tables.userRoles.roleId, body.roleId),
      ),
    )
    .get();

  if (existingUserRole) {
    throw createError({
      statusCode: 409,
      statusMessage: 'User already has this role',
    });
  }

  // Assign role to user
  await db
    .insert(tables.userRoles)
    .values({
      userId,
      roleId: body.roleId,
    })
    .run();

  return {
    success: true,
    message: `Role "${role.name}" assigned to user successfully`,
  };
});
