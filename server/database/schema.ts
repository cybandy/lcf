import {
  sqliteTable,
  text,
  integer,
  primaryKey,
  sqliteView,
  index,
} from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { generateId } from '../utils/misc';

// -- CORE TABLES --

/**
 * Members Table
 * This is the central table for every person in the church directory.
 * It stores personal information and status. We'll call it 'users'
 * as that is a common convention, especially when adding authentication.
 */
export const users = sqliteTable(
  'users',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => generateId('user')),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    avatar: text('avatar'),
    email: text('email').notNull().unique(),
    password: text('password'),
    phoneNumber: text('phone_number'),
    address: text('address'),
    bio: text('bio'),
    nationality: text('nationality'),
    dob: integer('dob', { mode: 'timestamp' }),
    status: text('status', { enum: ['active', 'inactive', 'visitor'] })
      .default('active')
      .notNull(),
    githubId: integer('github_id').unique(),
    githubToken: text('github_token'),
    googleId: text('google_id').unique(),
    googleToken: text('google_token'),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    index('users_first-name').on(t.firstName),
    index('users_last-name').on(t.lastName),
  ],
);

/**
 * Password Reset Tokens Table
 * Stores temporary tokens for password reset functionality
 */
export const passwordResetTokens = sqliteTable('password_reset_tokens', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => generateId('reset')),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  used: integer('used', { mode: 'boolean' }).default(false).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

/**
 * Groups Table
 * Represents small groups, ministries, committees, etc.
 */
export const groups = sqliteTable('groups', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

/**
 * Site-Wide Roles Table
 * Defines the overall leadership or permission roles within the church website.
 * e.g., 'Admin', 'Pastor', 'Editor', 'Deacon'. These are NOT group-specific.
 */
export const roles = sqliteTable('roles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(), // 'Admin', 'Pastor', 'Content Editor'
  description: text('description'),
});

// -- NEW: EVENT TIMER TABLES --

/**
 * Timers Table
 * Stores the main configuration for a specific speaker's timer at an event.
 * Accessed via a unique, shareable ID.
 */
export const timers = sqliteTable('timers', {
  // This text ID is the unique, shareable identifier for the URL parameter
  id: text('id')
    .primaryKey()
    .$defaultFn(() => generateId('timer')),
  label: text('label').notNull(), // e.g., "John Doe - Keynote"

  // Total duration in seconds. Can be set by the organizer
  // or calculated from the sum of segments.
  totalDuration: integer('total_duration').notNull(),

  // --- Relationships ---
  // Links this timer to a specific event
  eventId: integer('event_id')
    .notNull()
    .references(() => events.id, { onDelete: 'cascade' }),
  // Links this timer to the specific speaker (who is a user)
  speakerId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  // Links to the organizer (who is also a user) who created/manages this timer
  organizerId: text('organizer_id').references(() => users.id, {
    onDelete: 'set null',
  }),
  // --- Timestamps ---
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

/**
 * Timer Segments Table
 * Stores the individual segments (e.g., "Intro", "Main", "Q&A") for a timer.
 */
export const timerSegments = sqliteTable('timer_segments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  // Foreign key to the parent timer
  timerId: text('timer_id')
    .notNull()
    .references(() => timers.id, { onDelete: 'cascade' }),
  label: text('label').notNull(), // e.g., "Introduction"
  duration: integer('duration').notNull(), // Segment duration in seconds
  // Defines the sequence of this segment (e.g., 1, 2, 3...)
  order: integer('order').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

// -- JOIN TABLES (Many-to-Many Relationships) --

/**
 * Members to Groups Junction Table
 * This table links members to the groups they are a part of.
 * Crucially, it also defines the member's role WITHIN that specific group.
 * This is how we distinguish a 'Group Leader' from a regular 'Member'.
 */
export const membersToGroups = sqliteTable(
  'members_to_groups',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    groupId: integer('group_id')
      .notNull()
      .references(() => groups.id, { onDelete: 'cascade' }),
    // Role specific to the group context
    role: text('role', { enum: ['leader', 'member'] })
      .default('member')
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.groupId] })],
);

/**
 * User Roles Junction Table
 * Assigns site-wide roles to specific users. A user can have multiple roles.
 * e.g., A user can be both a 'Pastor' and an 'Admin'.
 */
export const userRoles = sqliteTable(
  'user_roles',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    roleId: integer('role_id')
      .notNull()
      .references(() => roles.id, { onDelete: 'cascade' }),
  },
  (table) => [primaryKey({ columns: [table.userId, table.roleId] })],
);

// -- CONTENT AND EVENTS --

/**
 * Blog Posts Table
 * Stores all blog articles, sermons, or announcements.
 */
export const posts = sqliteTable('posts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  content: text('content').notNull(),
  // The author is a member/user from the users table.
  authorId: text('author_id').references(() => users.id, {
    onDelete: 'set null',
  }),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
  status: text('status', { enum: ['draft', 'published', 'archived'] })
    .default('draft')
    .notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

/**
 * Events Table
 * Stores information about upcoming or past events.
 */
export const events = sqliteTable(
  'events',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    title: text('title').notNull(),
    description: text('description'),
    startTime: integer('start_time', { mode: 'timestamp' }).notNull(),
    endTime: integer('end_time', { mode: 'timestamp' }),
    location: text('location'),
    // The creator is a member/user from the users table.
    creatorId: text('creator_id').references(() => users.id, {
      onDelete: 'set null',
    }),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (t) => [
    index('event_start_time').on(t.startTime),
    index('event_end_time').on(t.endTime),
    index('event_location').on(t.location),
  ],
);

/**
 * Attendance Tracking Table
 * This is a join table that records which member attended which event.
 */
export const attendance = sqliteTable(
  'attendance',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    eventId: integer('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    checkInTime: integer('check_in_time', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [primaryKey({ columns: [table.userId, table.eventId] })],
);

// Event RSVP Table --
export const eventRsvps = sqliteTable(
  'event_rsvps',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    eventId: integer('event_id')
      .notNull()
      .references(() => events.id, { onDelete: 'cascade' }),
    status: text('status', {
      enum: ['attending', 'not_attending', 'maybe'],
    }).notNull(),
    guestCount: integer('guest_count').default(0).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
      .notNull()
      .$defaultFn(() => new Date()),
  },
  (table) => [primaryKey({ columns: [table.userId, table.eventId] })],
);

// -- GALLERY & NOTIFICATIONS --

/**
 * Albums Table
 * For organizing images into galleries.
 */
export const albums = sqliteTable('albums', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  description: text('description'),
  creatorId: text('creator_id').references(() => users.id, {
    onDelete: 'set null',
  }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

/**
 * Images Table
 * Stores individual image details for the gallery.
 */
export const images = sqliteTable('images', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  albumId: integer('album_id')
    .notNull()
    .references(() => albums.id, { onDelete: 'cascade' }),
  uploaderId: text('uploader_id').references(() => users.id, {
    onDelete: 'set null',
  }),
  url: text('url').notNull(), // URL to the image file, e.g., on a CDN
  caption: text('caption'),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

/**
 * Notifications Table
 * Stores notifications for users.
 */
export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }), // The recipient
  message: text('message').notNull(),
  link: text('link'), // Optional URL to the relevant item (post, event, etc.)
  isRead: integer('is_read', { mode: 'boolean' }).default(false).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

// -- NEW: Group Applications & Invitations --

export const groupApplications = sqliteTable('group_applications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  groupId: integer('group_id')
    .notNull()
    .references(() => groups.id, { onDelete: 'cascade' }),
  status: text('status', { enum: ['pending', 'approved', 'rejected'] })
    .default('pending')
    .notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
  reviewedById: text('reviewed_by_id').references(() => users.id, {
    onDelete: 'set null',
  }),
  reviewedAt: integer('reviewed_at', { mode: 'timestamp' }),
});

export const groupInvitations = sqliteTable('group_invitations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  groupId: integer('group_id')
    .notNull()
    .references(() => groups.id, { onDelete: 'cascade' }),
  invitedUserId: text('invited_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  inviterUserId: text('inviter_user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  status: text('status', { enum: ['pending', 'accepted', 'declined'] })
    .default('pending')
    .notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .$defaultFn(() => new Date()),
});

// -- DRIZZLE RELATIONS --
// Defining these makes querying related data much easier.

export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  eventsCreated: many(events),
  membersToGroups: many(membersToGroups),
  userRoles: many(userRoles),
  attendanceRecords: many(attendance),
  rsvps: many(eventRsvps),
  albumsCreated: many(albums),
  imagesUploaded: many(images),
  notifications: many(notifications),
  groupApplications: many(groupApplications, { relationName: 'applicant' }),
  applicationsReviewed: many(groupApplications, { relationName: 'reviewer' }),
  groupInvitationsSent: many(groupInvitations, { relationName: 'inviter' }),
  groupInvitationsReceived: many(groupInvitations, { relationName: 'invitee' }),
  timersAsSpeaker: many(timers, { relationName: 'timerSpeaker' }),
  timersAsOrganizer: many(timers, { relationName: 'timerOrganizer' }),
  passwordResetTokens: many(passwordResetTokens),
}));

export const passwordResetTokensRelations = relations(
  passwordResetTokens,
  ({ one }) => ({
    user: one(users, {
      fields: [passwordResetTokens.userId],
      references: [users.id],
    }),
  }),
);

export const groupsRelations = relations(groups, ({ many }) => ({
  membersToGroups: many(membersToGroups),
  applications: many(groupApplications),
  invitations: many(groupInvitations),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRoles),
}));

export const membersToGroupsRelations = relations(
  membersToGroups,
  ({ one }) => ({
    group: one(groups, {
      fields: [membersToGroups.groupId],
      references: [groups.id],
    }),
    user: one(users, {
      fields: [membersToGroups.userId],
      references: [users.id],
    }),
  }),
);

export const userRolesRelations = relations(userRoles, ({ one }) => ({
  role: one(roles, { fields: [userRoles.roleId], references: [roles.id] }),
  user: one(users, { fields: [userRoles.userId], references: [users.id] }),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, { fields: [posts.authorId], references: [users.id] }),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  creator: one(users, { fields: [events.creatorId], references: [users.id] }),
  attendees: many(attendance),
  rsvps: many(eventRsvps),
  timers: many(timers),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  user: one(users, { fields: [attendance.userId], references: [users.id] }),
  event: one(events, { fields: [attendance.eventId], references: [events.id] }),
}));

export const eventRsvpsRelations = relations(eventRsvps, ({ one }) => ({
  user: one(users, { fields: [eventRsvps.userId], references: [users.id] }),
  event: one(events, { fields: [eventRsvps.eventId], references: [events.id] }),
}));

export const albumsRelations = relations(albums, ({ one, many }) => ({
  creator: one(users, { fields: [albums.creatorId], references: [users.id] }),
  images: many(images),
}));

export const imagesRelations = relations(images, ({ one }) => ({
  album: one(albums, { fields: [images.albumId], references: [albums.id] }),
  uploader: one(users, { fields: [images.uploaderId], references: [users.id] }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
}));

export const groupApplicationsRelations = relations(
  groupApplications,
  ({ one }) => ({
    applicant: one(users, {
      fields: [groupApplications.userId],
      references: [users.id],
      relationName: 'applicant',
    }),
    group: one(groups, {
      fields: [groupApplications.groupId],
      references: [groups.id],
    }),
    reviewer: one(users, {
      fields: [groupApplications.reviewedById],
      references: [users.id],
      relationName: 'reviewer',
    }),
  }),
);

export const groupInvitationsRelations = relations(
  groupInvitations,
  ({ one }) => ({
    group: one(groups, {
      fields: [groupInvitations.groupId],
      references: [groups.id],
    }),
    invitee: one(users, {
      fields: [groupInvitations.invitedUserId],
      references: [users.id],
      relationName: 'invitee',
    }),
    inviter: one(users, {
      fields: [groupInvitations.inviterUserId],
      references: [users.id],
      relationName: 'inviter',
    }),
  }),
);

// -- Timer Relations --
export const timersRelations = relations(timers, ({ one, many }) => ({
  // Each timer belongs to one event
  event: one(events, {
    fields: [timers.eventId],
    references: [events.id],
  }),

  // Each timer is assigned to one speaker (a user)
  speaker: one(users, {
    fields: [timers.speakerId],
    references: [users.id],
    relationName: 'timerSpeaker', // Use a relationName to avoid conflicts
  }),

  // Each timer was created by one organizer (a user)
  organizer: one(users, {
    fields: [timers.organizerId],
    references: [users.id],
    relationName: 'timerOrganizer', // Use a relationName to avoid conflicts
  }),

  // Each timer can have many segments
  segments: many(timerSegments),
}));

export const timerSegmentsRelations = relations(timerSegments, ({ one }) => ({
  // Each segment belongs to one timer
  timer: one(timers, {
    fields: [timerSegments.timerId],
    references: [timers.id],
  }),
}));

// views
export const membersView = sqliteView('members_view', {
  id: text('user_id').notNull(),
  name: text('name').notNull(),
  search_term: text('search_term').notNull(),
  email: text('email').notNull(),
  nationality: text('nationality'),
  avatar: text('avatar'),
  status: text('status', { enum: ['active', 'inactive', 'visitor'] }).notNull(),
  role_id: integer('role_id'),
  role_name: text('role_name'),
  group_id: integer('group_id'),
  group_name: text('group_name'),
}).existing();
