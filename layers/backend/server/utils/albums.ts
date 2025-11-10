import { useDrizzle, tables, eq } from './drizzle';

export async function createAlbum(album: {
  title: string;
  description?: string;
  creatorId?: string;
}) {
  return useDrizzle().insert(tables.albums).values(album).returning().get();
}

export async function getAlbumById(id: number) {
  return useDrizzle()
    .select()
    .from(tables.albums)
    .where(eq(tables.albums.id, id))
    .get();
}

export async function updateAlbum(
  id: number,
  patch: Partial<{ title: string; description?: string }>,
) {
  return useDrizzle()
    .update(tables.albums)
    .set(patch)
    .where(eq(tables.albums.id, id))
    .returning();
}

export async function deleteAlbum(id: number) {
  return useDrizzle()
    .delete(tables.albums)
    .where(eq(tables.albums.id, id))
    .run();
}

export async function listAlbums() {
  return useDrizzle().select().from(tables.albums).all();
}
