import { useDrizzle, tables } from '../../../utils/drizzle';

export default defineEventHandler(async () => {
  const db = useDrizzle();

  // Public: return minimal group info
  const groups = await db.select({
    id: tables.groups.id,
    name: tables.groups.name,
    description: tables.groups.description,
    createdAt: tables.groups.createdAt,
  }).from(tables.groups).all();

  return { groups };
});
