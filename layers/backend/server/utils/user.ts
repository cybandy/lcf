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
