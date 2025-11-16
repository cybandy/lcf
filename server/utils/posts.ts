import { useDrizzle, tables, eq, desc } from './drizzle';
import type { Post } from '~~/shared/utils/zod_schemas';

export async function createPost(post: {
  title: string;
  content: string;
  authorId?: string;
  publishedAt?: Date;
  status?: Post['status'];
}) {
  return useDrizzle().insert(tables.posts).values(post).returning().get();
}

export async function getPostById(id: number) {
  return useDrizzle()
    .select()
    .from(tables.posts)
    .where(eq(tables.posts.id, id))
    .get();
}

export async function updatePost(
  id: number,
  patch: Partial<{
    title: string;
    content: string;
    status: Post['status'];
    publishedAt: Date;
  }>,
) {
  return useDrizzle()
    .update(tables.posts)
    .set(patch)
    .where(eq(tables.posts.id, id))
    .returning();
}

export async function deletePost(id: number) {
  return useDrizzle().delete(tables.posts).where(eq(tables.posts.id, id)).run();
}

export async function listPosts() {
  return useDrizzle()
    .select()
    .from(tables.posts)
    .orderBy(desc(tables.posts.createdAt))
    .all();
}
