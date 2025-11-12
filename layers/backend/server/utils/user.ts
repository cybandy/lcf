import type { SQL } from 'drizzle-orm';
import type { UserInsert } from './drizzle';

export async function findUserById(id: string) {
  return useDrizzle()
    .select()
    .from(tables.users)
    .where(eq(tables.users.id, id))
    .get();
}

export async function findUserByGitHubId(githubId: number) {
  return useDrizzle()
    .select()
    .from(tables.users)
    .where(eq(tables.users.githubId, githubId))
    .get();
}

export async function findUserByGoogleId(googleId: string) {
  return useDrizzle()
    .select()
    .from(tables.users)
    .where(eq(tables.users.googleId, googleId))
    .get();
}

export async function findUserBy(query: SQL | undefined) {
  return useDrizzle().select().from(tables.users).where(query).get();
}

export async function createUser(user: UserInsert) {
  return useDrizzle().insert(tables.users).values(user).returning().get();
}

export async function updateUser(id: string, user: Partial<UserInsert>) {
  return useDrizzle()
    .update(tables.users)
    .set(user)
    .where(eq(tables.users.id, id))
    .returning()
    .get();
}

export async function deleteAvatar(avatar: string) {
  if (avatar.startsWith('avatars/')) {
    await hubBlob().delete(avatar);
  }
}

export function safeUserParsing(user: User) {
  const { password, githubToken, googleToken, avatar, ...safeUser } = user;

  return {
    avatar: avatar ? `/files/${avatar}` : avatar,
    ...safeUser
  }
}

/**
 * Get user by ID with their roles included
 */
export async function findUserByIdWithRoles(id: string) {
  const db = useDrizzle();

  const userWithRoles = await db
    .select({
      // User fields
      id: tables.users.id,
      firstName: tables.users.firstName,
      lastName: tables.users.lastName,
      email: tables.users.email,
      password: tables.users.password,
      phoneNumber: tables.users.phoneNumber,
      address: tables.users.address,
      bio: tables.users.bio,
      nationality: tables.users.nationality,
      dob: tables.users.dob,
      avatar: tables.users.avatar,
      status: tables.users.status,
      githubId: tables.users.githubId,
      githubToken: tables.users.githubToken,
      googleId: tables.users.googleId,
      googleToken: tables.users.googleToken,
      createdAt: tables.users.createdAt,
      updatedAt: tables.users.updatedAt,
      // Role fields
      roleId: tables.roles.id,
      roleName: tables.roles.name,
    })
    .from(tables.users)
    .leftJoin(tables.userRoles, eq(tables.users.id, tables.userRoles.userId))
    .leftJoin(tables.roles, eq(tables.userRoles.roleId, tables.roles.id))
    .where(eq(tables.users.id, id))
    .all();

  if (userWithRoles.length === 0) {
    return null;
  }

  // Get the first row for user data
  const firstRow = userWithRoles[0]!;
  
  // Collect all roles
  const roles = userWithRoles
    .filter((row) => row.roleId !== null)
    .map((row) => ({
      id: row.roleId!,
      name: row.roleName!,
    }));

  // Build user object
  return {
    id: firstRow.id,
    firstName: firstRow.firstName,
    lastName: firstRow.lastName,
    email: firstRow.email,
    password: firstRow.password,
    phoneNumber: firstRow.phoneNumber,
    address: firstRow.address,
    bio: firstRow.bio,
    nationality: firstRow.nationality,
    dob: firstRow.dob,
    avatar: firstRow.avatar,
    status: firstRow.status,
    githubId: firstRow.githubId,
    githubToken: firstRow.githubToken,
    googleId: firstRow.googleId,
    googleToken: firstRow.googleToken,
    createdAt: firstRow.createdAt,
    updatedAt: firstRow.updatedAt,
    roles: roles.length > 0 ? roles : undefined,
  };
}

/**
 * Find user by query with roles included
 */
export async function findUserByWithRoles(query: SQL | undefined) {
  const db = useDrizzle();

  const userWithRoles = await db
    .select({
      // User fields
      id: tables.users.id,
      firstName: tables.users.firstName,
      lastName: tables.users.lastName,
      email: tables.users.email,
      password: tables.users.password,
      phoneNumber: tables.users.phoneNumber,
      address: tables.users.address,
      bio: tables.users.bio,
      nationality: tables.users.nationality,
      dob: tables.users.dob,
      avatar: tables.users.avatar,
      status: tables.users.status,
      githubId: tables.users.githubId,
      githubToken: tables.users.githubToken,
      googleId: tables.users.googleId,
      googleToken: tables.users.googleToken,
      createdAt: tables.users.createdAt,
      updatedAt: tables.users.updatedAt,
      // Role fields
      roleId: tables.roles.id,
      roleName: tables.roles.name,
    })
    .from(tables.users)
    .leftJoin(tables.userRoles, eq(tables.users.id, tables.userRoles.userId))
    .leftJoin(tables.roles, eq(tables.userRoles.roleId, tables.roles.id))
    .where(query)
    .all();

  if (userWithRoles.length === 0) {
    return null;
  }

  // Get the first row for user data
  const firstRow = userWithRoles[0]!;
  
  // Collect all roles
  const roles = userWithRoles
    .filter((row) => row.roleId !== null)
    .map((row) => ({
      id: row.roleId!,
      name: row.roleName!,
    }));

  // Build user object
  return {
    id: firstRow.id,
    firstName: firstRow.firstName,
    lastName: firstRow.lastName,
    email: firstRow.email,
    password: firstRow.password,
    phoneNumber: firstRow.phoneNumber,
    address: firstRow.address,
    bio: firstRow.bio,
    nationality: firstRow.nationality,
    dob: firstRow.dob,
    avatar: firstRow.avatar,
    status: firstRow.status,
    githubId: firstRow.githubId,
    githubToken: firstRow.githubToken,
    googleId: firstRow.googleId,
    googleToken: firstRow.googleToken,
    createdAt: firstRow.createdAt,
    updatedAt: firstRow.updatedAt,
    roles: roles.length > 0 ? roles : undefined,
  };
}

/**
 * Safe user parsing that includes roles
 */
export function safeUserParsingWithRoles(user: User & { roles?: Array<{ id: number, name: string }> }) {
  const { password, githubToken, googleToken, avatar, ...safeUser } = user;

  return {
    avatar: avatar ? `/files/${avatar}` : avatar,
    ...safeUser,
    roles: user.roles || [],
  };
}