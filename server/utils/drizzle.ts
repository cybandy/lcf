import { drizzle } from 'drizzle-orm/d1';

import * as schema from '../database/schema';
import type { AnySQLiteColumn } from 'drizzle-orm/sqlite-core';
import { type SQL, sql } from 'drizzle-orm';

export { alias } from 'drizzle-orm/sqlite-core';
export {
  sql,
  eq,
  and,
  or,
  isNull,
  isNotNull,
  gt,
  gte,
  lt,
  lte,
  between,
  asc,
  desc,
  inArray
} from 'drizzle-orm';

export const tables = schema;

export function useDrizzle() {
  return drizzle(hubDatabase(), { schema });
}

// custom lower function
export function lower(txt: AnySQLiteColumn): SQL {
  return sql`lower(${txt})`;
}

// export type Member = typeof schema.users.$inferSelect;
export type UserInsert = typeof schema.users.$inferInsert;

export type MembersToGroupsInsert = typeof schema.membersToGroups.$inferInsert;
export type GroupApplications = typeof schema.groupApplications.$inferInsert;
export type GroupInvitations = typeof schema.groupInvitations.$inferInsert;
