import { z } from 'zod';
import { FellowshipPermission, hasFellowshipPermission, isAdmin, isPastor } from '~~/shared/utils/authorization';

const CreateGroupSchema = z.object({
  name: z.string().min(2, 'Name too short').max(100, 'Name too long'),
  description: z.string().max(1000).optional(),
});

export default defineEventHandler(async (event) => {
  const {user:userWithRoles} = await myRequireUserSession(event);

  const authorized =
    isAdmin(userWithRoles) ||
    isPastor(userWithRoles) ||
    hasFellowshipPermission(userWithRoles, FellowshipPermission.CREATE_GROUPS);

  if (!authorized) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: Cannot create groups' });
  }

  const body = await readBody(event);
  const parsed = CreateGroupSchema.safeParse(body);
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues.map(i => i.message).join(', ') });
  }

  const db = useDrizzle();
  const { name, description } = parsed.data;

  const result = await db.insert(tables.groups).values({ name, description }).returning();
  const created = result[0];

  return {
    group: created,
  };
});
