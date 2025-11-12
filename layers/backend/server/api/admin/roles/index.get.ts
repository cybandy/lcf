import { FellowshipPermission } from '#layers/backend/shared/utils/authorization';
import { requireFellowshipPermission } from '#layers/backend/server/utils/authorization';

/**
 * Get all available roles
 * Admin only
 */
export default defineEventHandler(async (event) => {
  // Require admin or MANAGE_ROLES permission
  await requireFellowshipPermission(event, FellowshipPermission.MANAGE_ROLES);

  const db = useDrizzle();

  const roles = await db
    .select({
      id: tables.roles.id,
      name: tables.roles.name,
      description: tables.roles.description,
    })
    .from(tables.roles)
    .all();

  return {
    success: true,
    roles,
  };
});
