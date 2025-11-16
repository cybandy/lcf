import { FellowshipPermission, hasFellowshipPermission, isAdmin, isPastor } from '~~/shared/utils/authorization';
import { inArray } from 'drizzle-orm';

interface SanitizedMember {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
    status: string | null;
  };
  role: 'leader' | 'member';
}

interface GroupWithMembers {
  id: number;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  members: SanitizedMember[];
}

export default defineEventHandler(async (event) => {
  const session = await myRequireUserSession(event);
  const userWithRoles = {
    id: session.user.id,
    roles: (session.user.roles as Array<{ id: number; name: string }> | undefined),
  };

  const canViewAll = isAdmin(userWithRoles) || isPastor(userWithRoles) || hasFellowshipPermission(userWithRoles, FellowshipPermission.MANAGE_ALL_GROUPS);

  const db = useDrizzle();
  const g = tables.groups;
  const mg = tables.membersToGroups;
  const u = tables.users;

  let groupIds: number[] | undefined;
  if (!canViewAll) {
    // Fetch only groups current user is member of
    const membershipRows = await db.select({ groupId: mg.groupId }).from(mg).where(eq(mg.userId, session.user.id)).all();
    groupIds = membershipRows.map(r => r.groupId);
    if (groupIds.length === 0) {
      return { groups: [] };
    }
  }

  // Fetch group basic data
  const baseGroups = await db.select({
    id: g.id,
    name: g.name,
    description: g.description,
    createdAt: g.createdAt,
    updatedAt: g.updatedAt,
  }).from(g).where(groupIds ? inArray(g.id, groupIds) : undefined).all();

  if (baseGroups.length === 0) {
    return { groups: [] };
  }

  // Fetch members for these groups
  const memberRows = await db.select({
    groupId: mg.groupId,
    role: mg.role,
    userId: u.id,
    firstName: u.firstName,
    lastName: u.lastName,
    avatar: u.avatar,
    status: u.status,
  }).from(mg)
    .innerJoin(u, eq(mg.userId, u.id))
    .where(inArray(mg.groupId, baseGroups.map(bg => bg.id)))
    .all();

  const grouped: Record<number, SanitizedMember[]> = {};
  for (const row of memberRows) {
    if (!grouped[row.groupId]) grouped[row.groupId] = [];
    grouped[row.groupId]!.push({
      role: row.role as 'leader' | 'member',
      user: {
        id: row.userId,
        firstName: row.firstName || '',
        lastName: row.lastName || '',
        avatar: row.avatar ? `/files/${row.avatar}` : null,
        status: row.status || null,
      },
    });
  }

  const groups: GroupWithMembers[] = baseGroups.map(bg => ({
    ...bg,
    members: grouped[bg.id] || [],
  }));

  return { groups };
});
