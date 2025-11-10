import { useDrizzle, tables, eq } from './drizzle';

// CRUD utilities for the `roles` table
export async function createRole(role: { name: string; description?: string }) {
  return useDrizzle().insert(tables.roles).values(role).returning().get();
}

export async function getRoleById(id: number) {
  return useDrizzle()
    .select()
    .from(tables.roles)
    .where(eq(tables.roles.id, id))
    .get();
}

export async function getRoleByName(name: string) {
  return useDrizzle()
    .select()
    .from(tables.roles)
    .where(eq(tables.roles.name, name))
    .get();
}

export async function listRoles() {
  return useDrizzle().select().from(tables.roles).all();
}

export async function updateRole(
  id: number,
  patch: Partial<{ name: string; description?: string }>,
) {
  return useDrizzle()
    .update(tables.roles)
    .set(patch)
    .where(eq(tables.roles.id, id))
    .returning();
}

export async function deleteRole(id: number) {
  return useDrizzle().delete(tables.roles).where(eq(tables.roles.id, id)).run();
}
