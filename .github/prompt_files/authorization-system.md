# Authorization System Documentation

## Overview

The authorization system implements Role-Based Access Control (RBAC) for both fellowship-wide and group-level permissions. It works isomorphically (both frontend and backend) and integrates with the existing authentication system.

## Architecture

### Three-Layer Structure

1. **Shared Utilities** (`layers/backend/shared/utils/authorization.ts`)
   - Works on both frontend and backend
   - Defines permissions, roles, and pure authorization logic
   - No dependencies on server or client-specific APIs

2. **Server Helpers** (`layers/backend/server/utils/authorization.ts`)
   - Server-side authorization guards and middleware
   - Works with H3 events and database
   - Provides `require*` functions that throw HTTP errors

3. **Frontend Composable** (`app/composables/usePermissions.ts`)
   - Reactive permission checks for UI
   - Integrates with user session
   - Provides computed properties and helper functions

## Permission Types

### Fellowship Permissions

Fellowship-wide permissions apply across the entire application:

```typescript
enum FellowshipPermission {
  // User Management
  MANAGE_USERS = 'manage_users',
  VIEW_USERS = 'view_users',
  DELETE_USERS = 'delete_users',
  
  // Role Management
  MANAGE_ROLES = 'manage_roles',
  ASSIGN_ROLES = 'assign_roles',
  
  // Group Management
  CREATE_GROUPS = 'create_groups',
  DELETE_GROUPS = 'delete_groups',
  MANAGE_ALL_GROUPS = 'manage_all_groups',
  
  // Event Management
  CREATE_EVENTS = 'create_events',
  EDIT_ALL_EVENTS = 'edit_all_events',
  DELETE_EVENTS = 'delete_events',
  
  // Content Management
  MANAGE_POSTS = 'manage_posts',
  PUBLISH_POSTS = 'publish_posts',
  DELETE_POSTS = 'delete_posts',
  
  // Application Management
  REVIEW_GROUP_APPLICATIONS = 'review_group_applications',
  MANAGE_INVITATIONS = 'manage_invitations',
  
  // System
  VIEW_ANALYTICS = 'view_analytics',
  MANAGE_SETTINGS = 'manage_settings',
}
```

### Group Permissions

Group-level permissions apply within specific groups:

```typescript
enum GroupPermission {
  // Member Management
  INVITE_MEMBERS = 'invite_members',
  REMOVE_MEMBERS = 'remove_members',
  MANAGE_MEMBERS = 'manage_members',
  
  // Group Settings
  EDIT_GROUP = 'edit_group',
  DELETE_GROUP = 'delete_group',
  
  // Applications
  REVIEW_APPLICATIONS = 'review_applications',
  APPROVE_APPLICATIONS = 'approve_applications',
  
  // Events
  CREATE_GROUP_EVENTS = 'create_group_events',
  MANAGE_GROUP_EVENTS = 'manage_group_events',
  
  // Attendance
  MARK_ATTENDANCE = 'mark_attendance',
  VIEW_ATTENDANCE = 'view_attendance',
}
```

## Role Definitions

### Fellowship Roles

- **Admin**: Full system access (all permissions)
- **Pastor**: Church leadership with broad permissions (manage groups, events, posts, view analytics)
- **Editor**: Content management (posts, events)
- **Deacon**: Ministry coordination (groups, events, applications)
- **Member**: Basic access (view users only)

### Group Roles

- **Leader**: Full group control (all group permissions)
- **Member**: Basic group access (view attendance only)

## Usage

### Backend Usage

#### Protecting API Endpoints

```typescript
// Require specific fellowship permission
export default defineEventHandler(async (event) => {
  await requireFellowshipPermission(event, FellowshipPermission.MANAGE_USERS);
  
  // Handler code here...
});

// Require admin access
export default defineEventHandler(async (event) => {
  await requireAdmin(event);
  
  // Handler code here...
});

// Require group management permission
export default defineEventHandler(async (event) => {
  const groupId = getRouterParam(event, 'groupId');
  const { user, groupRole } = await requireGroupManagement(event, Number(groupId));
  
  // Handler code here...
});

// Require specific group permission
export default defineEventHandler(async (event) => {
  const groupId = getRouterParam(event, 'groupId');
  const { user, groupRole } = await requireGroupPermission(
    event,
    Number(groupId),
    GroupPermission.INVITE_MEMBERS
  );
  
  // Handler code here...
});

// Check if user is owner or admin
export default defineEventHandler(async (event) => {
  const resourceOwnerId = 'user-id-123';
  await requireOwnerOrAdmin(event, resourceOwnerId);
  
  // Handler code here...
});
```

#### Manual Permission Checks

```typescript
import { getUserWithRoles } from '~/layers/backend/server/utils/authorization';

export default defineEventHandler(async (event) => {
  const user = await getUserWithRoles(event);
  
  if (hasFellowshipPermission(user, FellowshipPermission.MANAGE_POSTS)) {
    // User can manage posts
  }
});
```

### Frontend Usage

#### In Components

```vue
<script setup lang="ts">
const { 
  can, 
  userIsAdmin, 
  canInGroup, 
  isOwner,
  FellowshipPermission,
  GroupPermission 
} = usePermissions();

// Example: checking permissions
const canManagePosts = can(FellowshipPermission.MANAGE_POSTS);
const canCreateEvents = can(FellowshipPermission.CREATE_EVENTS);
</script>

<template>
  <!-- Show admin-only button -->
  <UButton v-if="userIsAdmin" @click="deleteAllData">
    Delete All Data (Admin Only)
  </UButton>
  
  <!-- Show based on specific permission -->
  <UButton v-if="can(FellowshipPermission.MANAGE_USERS)">
    Manage Users
  </UButton>
  
  <!-- Show if user owns resource or is admin -->
  <UButton v-if="isOwnerOrAdminCheck(post.authorId)">
    Edit Post
  </UButton>
  
  <!-- Group-level permission check -->
  <UButton v-if="canInGroup(groupRole, GroupPermission.INVITE_MEMBERS)">
    Invite Members
  </UButton>
</template>
```

#### Reactive Computed Checks

```vue
<script setup lang="ts">
const { canComputed, FellowshipPermission } = usePermissions();

// Reactive computed for better performance with v-if
const canManageUsers = canComputed(FellowshipPermission.MANAGE_USERS);
</script>

<template>
  <div v-if="canManageUsers">
    <!-- User management UI -->
  </div>
</template>
```

#### Complex Conditional Checks

```vue
<script setup lang="ts">
const { checkConditions, FellowshipPermission } = usePermissions();

const post = ref({ authorId: 'user-123' });

const canEditPost = computed(() => checkConditions({
  requireAuth: true,
  requireAnyPermission: [
    FellowshipPermission.MANAGE_POSTS,
    FellowshipPermission.EDIT_ALL_EVENTS
  ],
  requireOwnership: post.value.authorId
}));
</script>
```

## Session Integration

### User Roles in Session

All authentication and profile endpoints now automatically include user roles in the session:

- `login.post.ts` - Fetches roles on login
- `reg.post.ts` - Includes roles (empty for new users)
- `user/index.patch.ts` - Refetches roles after profile update
- `user/profile.patch.ts` - Refetches roles after profile update
- `user/profile/picture-upload.put.ts` - Refetches roles after avatar update

### Helper Functions

```typescript
// Fetch user with roles
const userWithRoles = await findUserByIdWithRoles(userId);

// Find user by query with roles
const user = await findUserByWithRoles(
  eq(tables.users.email, 'user@example.com')
);

// Safe parsing that includes roles
const safeUser = safeUserParsingWithRoles(userWithRoles);
```

## Database Schema

### Tables

- **`users`**: User accounts
- **`roles`**: Site-wide roles (admin, pastor, editor, deacon, member)
- **`userRoles`**: Junction table (userId, roleId) - assigns site-wide roles to users
- **`groups`**: Fellowship groups
- **`membersToGroups`**: Junction table (userId, groupId, role) - group membership with role

### Role Assignment

```sql
-- Assign fellowship role to user
INSERT INTO userRoles (userId, roleId) VALUES ('user-id', 1);

-- Assign group role to user
INSERT INTO membersToGroups (userId, groupId, role) 
VALUES ('user-id', 1, 'leader');
```

## API Reference

### Shared Functions

```typescript
// Check fellowship permission
hasFellowshipPermission(user, permission): boolean

// Check any/all permissions
hasAnyFellowshipPermission(user, permissions): boolean
hasAllFellowshipPermissions(user, permissions): boolean

// Check role
hasRole(user, roleName): boolean
isAdmin(user): boolean
isPastor(user): boolean

// Check group permission
hasGroupPermission(groupRole, permission): boolean
isGroupLeader(groupRole): boolean

// Check if can manage group (leader OR fellowship-wide permission)
canManageGroup(user, groupRole): boolean

// Generic resource access check
canPerformAction(user, action, resource, options): boolean
```

### Server Functions

```typescript
// Get user with roles from session
getUserWithRoles(event): Promise<UserWithRoles | null>

// Get user's group role
getUserGroupRole(userId, groupId): Promise<GroupRoleName | null>

// Check group membership
isGroupMember(userId, groupId): Promise<boolean>

// Authorization guards (throw errors)
requireFellowshipPermission(event, permission): Promise<UserWithRoles>
requireAdmin(event): Promise<UserWithRoles>
requireGroupManagement(event, groupId): Promise<{ user, groupRole }>
requireGroupPermission(event, groupId, permission): Promise<{ user, groupRole }>
requireOwnerOrAdmin(event, resourceOwnerId): Promise<UserWithRoles>

// Check functions (return boolean)
isOwnerOrAdmin(event, resourceOwnerId): Promise<boolean>
canAccessResource(event, resourceType, resourceId): Promise<boolean>
```

### Frontend Composable API

```typescript
const {
  // State
  currentUser,        // Ref<UserWithRoles | null>
  loggedIn,          // Ref<boolean>
  userIsAdmin,       // ComputedRef<boolean>
  userIsPastor,      // ComputedRef<boolean>

  // Fellowship permissions
  can,               // (permission) => boolean
  canComputed,       // (permission) => ComputedRef<boolean>
  canAny,            // (permissions[]) => boolean
  canAll,            // (permissions[]) => boolean
  userHasRole,       // (roleName) => boolean

  // Group permissions
  canInGroup,        // (groupRole, permission) => boolean
  canInGroupComputed,// (groupRole, permission) => ComputedRef<boolean>
  userIsGroupLeader, // (groupRole) => boolean
  userCanManageGroup,// (groupRole?) => boolean

  // Resource checks
  canPerform,        // (action, resource, options) => boolean
  isOwner,           // (resourceOwnerId) => boolean
  isOwnerOrAdminCheck,// (resourceOwnerId) => boolean

  // Utilities
  getUserPermissions,// (groupRole?) => { fellowship[], group[] }
  checkConditions,   // (conditions) => boolean
  checkConditionsComputed, // (conditions) => ComputedRef<boolean>

  // Enums
  FellowshipPermission,
  GroupPermission,
} = usePermissions();
```

## Best Practices

### 1. Always Protect Server Endpoints

Never rely on frontend checks alone. Always use server-side guards:

```typescript
// ❌ BAD - No server protection
export default defineEventHandler(async (event) => {
  // Anyone can call this!
  await deleteAllUsers();
});

// ✅ GOOD - Protected with permission check
export default defineEventHandler(async (event) => {
  await requireFellowshipPermission(event, FellowshipPermission.MANAGE_USERS);
  await deleteAllUsers();
});
```

### 2. Use Frontend Checks for UI Only

Frontend checks improve UX but don't provide security:

```vue
<!-- Hide button if user can't access feature -->
<UButton v-if="can(FellowshipPermission.DELETE_USERS)" @click="deleteUser">
  Delete User
</UButton>
```

### 3. Prefer Specific Permissions Over Roles

```typescript
// ❌ Less maintainable
if (userHasRole('admin') || userHasRole('pastor')) {
  // Do something
}

// ✅ More maintainable
if (can(FellowshipPermission.MANAGE_GROUPS)) {
  // Do something
}
```

### 4. Use Helper Functions for Complex Logic

```typescript
// ❌ Complex inline logic
const canEdit = computed(() => 
  isAdmin.value || 
  (groupRole.value === 'leader' && can(FellowshipPermission.MANAGE_ALL_GROUPS))
);

// ✅ Use built-in helper
const canEdit = computed(() => userCanManageGroup(groupRole.value));
```

### 5. Consistent Error Handling

```typescript
// Server guards throw consistent errors
try {
  await requireFellowshipPermission(event, FellowshipPermission.MANAGE_USERS);
} catch (error) {
  // Returns 401 (not logged in) or 403 (insufficient permissions)
  // with generic error messages
}
```

## Migration Guide

### Adding New Permissions

1. Add permission to enum in `shared/utils/authorization.ts`
2. Add permission to appropriate role definitions
3. Update API endpoints to check new permission
4. Update frontend components to use new permission

### Adding New Roles

1. Add role to `FELLOWSHIP_ROLES` or `GROUP_ROLES`
2. Define permissions for the role
3. Insert role into database (for fellowship roles)
4. Update session type if needed

### Checking User Roles

Users can have multiple fellowship roles, and one role per group. The system will check if ANY of their roles have the required permission.

## Future Enhancements

- [ ] Permission caching for better performance
- [ ] Audit logging for permission checks
- [ ] Dynamic permission loading from database
- [ ] Permission delegation/temporary permissions
- [ ] Resource-level permissions (e.g., can only edit own posts)
