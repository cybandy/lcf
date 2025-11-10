import * as schema from '../../server/database/schema'
import type * as z from 'zod'
import { createSelectSchema, createInsertSchema, createUpdateSchema } from 'drizzle-zod'

export const UserSchema = {
  insert: createInsertSchema(schema.users),
  select: createSelectSchema(schema.users).omit({ password: true, githubId: true, githubToken: true, googleId: true, googleToken: true, createdAt: true, updatedAt: true }),
  update: createUpdateSchema(schema.users),
}

export type User = z.infer<typeof UserSchema.select>

export const GroupApplicationsSchema = {
  insert: createInsertSchema(schema.groupApplications),
  select: createSelectSchema(schema.groupApplications),
  update: createUpdateSchema(schema.groupApplications),
}
