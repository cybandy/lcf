import * as schema from '#layers/backend/server/database/schema';
import type * as z from 'zod/v4';
import {
  createSelectSchema,
  createInsertSchema,
  createUpdateSchema,
} from 'drizzle-zod';

export const UserSchema = {
  insert: createInsertSchema(schema.users),
  // Omit sensitive authentication tokens and password from any public API shape
  select: createSelectSchema(schema.users).omit({
    password: true,
    githubId: true,
    githubToken: true,
    googleId: true,
    googleToken: true,
    createdAt: true,
    updatedAt: true,
  }),
  update: createUpdateSchema(schema.users),
};

export type User = typeof schema.users.$inferSelect;

export const GroupApplicationsSchema = {
  insert: createInsertSchema(schema.groupApplications),
  select: createSelectSchema(schema.groupApplications),
  update: createUpdateSchema(schema.groupApplications),
};

export type GroupApplication = z.infer<typeof GroupApplicationsSchema.select>;

export const GroupSchema = {
  insert: createInsertSchema(schema.groups),
  select: createSelectSchema(schema.groups),
  update: createUpdateSchema(schema.groups),
};

export type Group = z.infer<typeof GroupSchema.select>;

export const RoleSchema = {
  insert: createInsertSchema(schema.roles),
  select: createSelectSchema(schema.roles),
  update: createUpdateSchema(schema.roles),
};

export type Role = typeof schema.roles.$inferSelect

export const TimerSchema = {
  insert: createInsertSchema(schema.timers),
  select: createSelectSchema(schema.timers),
  update: createUpdateSchema(schema.timers),
};

export type Timer = z.infer<typeof TimerSchema.select>;

export const TimerSegmentSchema = {
  insert: createInsertSchema(schema.timerSegments),
  select: createSelectSchema(schema.timerSegments),
  update: createUpdateSchema(schema.timerSegments),
};

export type TimerSegment = z.infer<typeof TimerSegmentSchema.select>;

export const MembersToGroupsSchema = {
  insert: createInsertSchema(schema.membersToGroups),
  select: createSelectSchema(schema.membersToGroups),
  update: createUpdateSchema(schema.membersToGroups),
};

export type MembersToGroups = z.infer<typeof MembersToGroupsSchema.select>;

export const UserRolesSchema = {
  insert: createInsertSchema(schema.userRoles),
  select: createSelectSchema(schema.userRoles),
  update: createUpdateSchema(schema.userRoles),
};

export type UserRole = z.infer<typeof UserRolesSchema.select>;

export const PostSchema = {
  insert: createInsertSchema(schema.posts),
  select: createSelectSchema(schema.posts),
  update: createUpdateSchema(schema.posts),
};

export type Post = z.infer<typeof PostSchema.select>;

export const EventSchema = {
  insert: createInsertSchema(schema.events),
  select: createSelectSchema(schema.events),
  update: createUpdateSchema(schema.events),
};

export type Event = Omit<typeof schema.events.$inferSelect, 'createdAt' | 'updatedAt' | 'creatorId'>;

export const AttendanceSchema = {
  insert: createInsertSchema(schema.attendance),
  select: createSelectSchema(schema.attendance),
  update: createUpdateSchema(schema.attendance),
};

export type Attendance = z.infer<typeof AttendanceSchema.select>;

export const EventRsvpSchema = {
  insert: createInsertSchema(schema.eventRsvps),
  select: createSelectSchema(schema.eventRsvps),
  update: createUpdateSchema(schema.eventRsvps),
};

export type EventRsvp = z.infer<typeof EventRsvpSchema.select>;

export const AlbumSchema = {
  insert: createInsertSchema(schema.albums),
  select: createSelectSchema(schema.albums),
  update: createUpdateSchema(schema.albums),
};

export type Album = z.infer<typeof AlbumSchema.select>;

export const ImageSchema = {
  insert: createInsertSchema(schema.images),
  select: createSelectSchema(schema.images),
  update: createUpdateSchema(schema.images),
};

export type Image = z.infer<typeof ImageSchema.select>;

export const NotificationSchema = {
  insert: createInsertSchema(schema.notifications),
  select: createSelectSchema(schema.notifications),
  update: createUpdateSchema(schema.notifications),
};

export type Notification = z.infer<typeof NotificationSchema.select>;

export const GroupInvitationSchema = {
  insert: createInsertSchema(schema.groupInvitations),
  select: createSelectSchema(schema.groupInvitations),
  update: createUpdateSchema(schema.groupInvitations),
};

export type GroupInvitation = z.infer<typeof GroupInvitationSchema.select>;

// members view (read-only)
// members view (read-only)
// members_view is used for directory lookups; avoid exposing raw email addresses by default
export const MembersViewSchema = {
  select: createSelectSchema(schema.membersView).omit({ email: true }),
};

export type MembersView = z.infer<typeof MembersViewSchema.select>;
