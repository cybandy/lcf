import { eq, useDrizzle, tables } from '../../../utils/drizzle';
import { getRouterParam } from 'h3';

interface SanitizedMember {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
    // status: string | null;
  };
  role: 'leader' | 'member';
}

export default defineEventHandler(async (event) => {
  const idParam = getRouterParam(event, 'id');
  if (!idParam) {
    throw createError({ statusCode: 400, statusMessage: 'Group id is required' });
  }
  const groupId = Number(idParam);
  if (Number.isNaN(groupId)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid group id' });
  }

  const db = useDrizzle();
  const g = tables.groups;
  const mg = tables.membersToGroups;
  const u = tables.users;

  const group = await db.select({
    id: g.id,
    name: g.name,
    description: g.description,
    createdAt: g.createdAt,
    updatedAt: g.updatedAt,
  }).from(g).where(eq(g.id, groupId)).get();

  if (!group) {
    throw createError({ statusCode: 404, statusMessage: 'Group not found' });
  }

  const memberRows = await db.select({
    role: mg.role,
    userId: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    avatar: u.avatar,
    // status: u.status,
  }).from(mg)
    .innerJoin(u, eq(mg.userId, u.id))
    .where(eq(mg.groupId, group.id))
    .all();

  const members: SanitizedMember[] = memberRows.map(m => ({
    role: m.role as 'leader' | 'member',
    user: {
      id: m.userId,
      firstName: m.firstName || '',
      lastName: m.lastName || '',
       avatar: m.avatar ? `/files/${m.avatar}` : null,
      // status: m.status || null,
    },
  }));

  return { group: { ...group, members } };
});
