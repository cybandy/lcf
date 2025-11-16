import * as schema from '~~/server/database/schema';
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

export type GroupApplication = typeof schema.groupApplications.$inferSelect;

export const GroupSchema = {
  insert: createInsertSchema(schema.groups),
  select: createSelectSchema(schema.groups),
  update: createUpdateSchema(schema.groups),
};

export type Group = typeof schema.groups.$inferSelect;

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

export type Timer = typeof schema.timers.$inferSelect;

export const TimerSegmentSchema = {
  insert: createInsertSchema(schema.timerSegments),
  select: createSelectSchema(schema.timerSegments),
  update: createUpdateSchema(schema.timerSegments),
};

export type TimerSegment = typeof schema.timerSegments.$inferSelect;

export const MembersToGroupsSchema = {
  insert: createInsertSchema(schema.membersToGroups),
  select: createSelectSchema(schema.membersToGroups),
  update: createUpdateSchema(schema.membersToGroups),
};

export type MembersToGroups = typeof schema.membersToGroups.$inferSelect;

export const UserRolesSchema = {
  insert: createInsertSchema(schema.userRoles),
  select: createSelectSchema(schema.userRoles),
  update: createUpdateSchema(schema.userRoles),
};

export type UserRole = typeof schema.userRoles.$inferSelect;

export const PostSchema = {
  insert: createInsertSchema(schema.posts),
  select: createSelectSchema(schema.posts),
  update: createUpdateSchema(schema.posts),
};

export type Post = typeof schema.posts.$inferSelect;

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

export type Attendance = typeof schema.attendance.$inferSelect;

export const EventRsvpSchema = {
  insert: createInsertSchema(schema.eventRsvps),
  select: createSelectSchema(schema.eventRsvps),
  update: createUpdateSchema(schema.eventRsvps),
};

export type EventRsvp = typeof schema.eventRsvps.$inferSelect;

export const AlbumSchema = {
  insert: createInsertSchema(schema.albums),
  select: createSelectSchema(schema.albums),
  update: createUpdateSchema(schema.albums),
};

export type Album = typeof schema.albums.$inferSelect;

export const ImageSchema = {
  insert: createInsertSchema(schema.images),
  select: createSelectSchema(schema.images),
  update: createUpdateSchema(schema.images),
};

export type Image = typeof schema.images.$inferSelect;

export const NotificationSchema = {
  insert: createInsertSchema(schema.notifications),
  select: createSelectSchema(schema.notifications),
  update: createUpdateSchema(schema.notifications),
};

export type Notification = typeof schema.notifications.$inferSelect;

export const GroupInvitationSchema = {
  insert: createInsertSchema(schema.groupInvitations),
  select: createSelectSchema(schema.groupInvitations),
  update: createUpdateSchema(schema.groupInvitations),
};

export type GroupInvitation = typeof schema.groupInvitations.$inferSelect;

// members view (read-only)
// members view (read-only)
// members_view is used for directory lookups; avoid exposing raw email addresses by default
export const MembersViewSchema = {
  select: createSelectSchema(schema.membersView).omit({ email: true }),
};

export type MembersView = typeof schema.membersView.$inferSelect;
