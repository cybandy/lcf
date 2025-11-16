import { useDrizzle, tables, eq } from './drizzle';

export async function addImage(image: {
  albumId: number;
  uploaderId?: string;
  url: string;
  caption?: string;
}) {
  return useDrizzle().insert(tables.images).values(image).returning().get();
}

export async function getImageById(id: number) {
  return useDrizzle()
    .select()
    .from(tables.images)
    .where(eq(tables.images.id, id))
    .get();
}

export async function deleteImage(id: number) {
  return useDrizzle()
    .delete(tables.images)
    .where(eq(tables.images.id, id))
    .run();
}

export async function listImagesForAlbum(albumId: number) {
  return useDrizzle()
    .select()
    .from(tables.images)
    .where(eq(tables.images.albumId, albumId))
    .all();
}
