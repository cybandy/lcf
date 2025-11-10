import { useDrizzle, tables, eq, desc } from './drizzle';

export async function createNotification(notification: {
  userId: string;
  message: string;
  link?: string;
}) {
  return useDrizzle()
    .insert(tables.notifications)
    .values(notification)
    .returning()
    .get();
}

export async function listNotificationsForUser(userId: string) {
  return useDrizzle()
    .select()
    .from(tables.notifications)
    .where(eq(tables.notifications.userId, userId))
    .orderBy(desc(tables.notifications.createdAt))
    .all();
}

export async function markAsRead(id: number) {
  return useDrizzle()
    .update(tables.notifications)
    .set({ isRead: true })
    .where(eq(tables.notifications.id, id))
    .returning();
}

export async function deleteNotification(id: number) {
  return useDrizzle()
    .delete(tables.notifications)
    .where(eq(tables.notifications.id, id))
    .run();
}
