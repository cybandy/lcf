/**
 * Authorization System for Church Fellowship Application
 * 
 * This file defines permissions, roles, and authorization helpers
 * that work on both frontend and backend (shared utilities).
 */

// ============================================================================
// PERMISSION DEFINITIONS
// ============================================================================

/**
 * Fellowship-wide permissions
 */
export enum FellowshipPermission {
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

/**
 * Group-level permissions
 */
export enum GroupPermission {
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

// ============================================================================
// ROLE DEFINITIONS
// ============================================================================

/**
 * Fellowship-wide role definitions with their permissions
 */
export const FELLOWSHIP_ROLES = {
  admin: {
    name: 'Admin',
    description: 'Full system access',
    permissions: Object.values(FellowshipPermission) as FellowshipPermission[],
  },
  pastor: {
    name: 'Pastor',
    description: 'Church leadership with broad permissions',
    permissions: [
      FellowshipPermission.VIEW_USERS,
      FellowshipPermission.MANAGE_ROLES,
      FellowshipPermission.ASSIGN_ROLES,
      FellowshipPermission.CREATE_GROUPS,
      FellowshipPermission.MANAGE_ALL_GROUPS,
      FellowshipPermission.CREATE_EVENTS,
      FellowshipPermission.EDIT_ALL_EVENTS,
      FellowshipPermission.DELETE_EVENTS,
      FellowshipPermission.MANAGE_POSTS,
      FellowshipPermission.PUBLISH_POSTS,
      FellowshipPermission.REVIEW_GROUP_APPLICATIONS,
      FellowshipPermission.MANAGE_INVITATIONS,
      FellowshipPermission.VIEW_ANALYTICS,
    ] as FellowshipPermission[],
  },
  editor: {
    name: 'Content Editor',
    description: 'Can manage posts and content',
    permissions: [
      FellowshipPermission.VIEW_USERS,
      FellowshipPermission.MANAGE_POSTS,
      FellowshipPermission.PUBLISH_POSTS,
      FellowshipPermission.CREATE_EVENTS,
    ] as FellowshipPermission[],
  },
  deacon: {
    name: 'Deacon',
    description: 'Ministry coordinator',
    permissions: [
      FellowshipPermission.VIEW_USERS,
      FellowshipPermission.CREATE_GROUPS,
      FellowshipPermission.CREATE_EVENTS,
      FellowshipPermission.REVIEW_GROUP_APPLICATIONS,
    ] as FellowshipPermission[],
  },
  member: {
    name: 'Member',
    description: 'Regular fellowship member',
    permissions: [
      FellowshipPermission.VIEW_USERS,
    ] as FellowshipPermission[],
  },
};

/**
 * Group role definitions with their permissions
 */
export const GROUP_ROLES = {
  leader: {
    name: 'Group Leader',
    description: 'Full control over the group',
    permissions: Object.values(GroupPermission) as GroupPermission[],
  },
  member: {
    name: 'Group Member',
    description: 'Regular group member',
    permissions: [
      GroupPermission.VIEW_ATTENDANCE,
    ] as GroupPermission[],
  },
};

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type FellowshipRoleName = keyof typeof FELLOWSHIP_ROLES;
export type GroupRoleName = keyof typeof GROUP_ROLES;

export interface UserWithRoles {
  id: string
  roles?: Array<{ id: number, name: string }>
}

export interface UserGroupMembership {
  userId: string
  groupId: number
  role: GroupRoleName
}

// ============================================================================
// AUTHORIZATION HELPERS
// ============================================================================

/**
 * Check if a user has a specific fellowship permission
 */
export function hasFellowshipPermission(
  user: UserWithRoles | null | undefined,
  permission: FellowshipPermission,
): boolean {
  if (!user || !user.roles || user.roles.length === 0) {
    return false;
  }

  // Check each role the user has
  for (const role of user.roles) {
    const roleName = role.name.toLowerCase() as FellowshipRoleName;
    const roleConfig = FELLOWSHIP_ROLES[roleName];

    if (roleConfig && roleConfig.permissions.includes(permission)) {
      return true;
    }
  }

  return false;
}

/**
 * Check if a user has ANY of the specified fellowship permissions
 */
export function hasAnyFellowshipPermission(
  user: UserWithRoles | null | undefined,
  permissions: FellowshipPermission[],
): boolean {
  return permissions.some(permission => hasFellowshipPermission(user, permission));
}

/**
 * Check if a user has ALL of the specified fellowship permissions
 */
export function hasAllFellowshipPermissions(
  user: UserWithRoles | null | undefined,
  permissions: FellowshipPermission[],
): boolean {
  return permissions.every(permission => hasFellowshipPermission(user, permission));
}

/**
 * Check if a user has a specific role
 */
export function hasRole(
  user: UserWithRoles | null | undefined,
  roleName: FellowshipRoleName,
): boolean {
  if (!user || !user.roles || user.roles.length === 0) {
    return false;
  }

  return user.roles.some(
    role => role.name.toLowerCase() === roleName.toLowerCase(),
  );
}

/**
 * Check if a user is an admin
 */
export function isAdmin(user: UserWithRoles | null | undefined): boolean {
  return hasRole(user, 'admin');
}

/**
 * Check if a user is a pastor
 */
export function isPastor(user: UserWithRoles | null | undefined): boolean {
  return hasRole(user, 'pastor');
}

/**
 * Check if a user has a specific group permission
 */
export function hasGroupPermission(
  groupRole: GroupRoleName | null | undefined,
  permission: GroupPermission,
): boolean {
  if (!groupRole) {
    return false;
  }

  const roleConfig = GROUP_ROLES[groupRole];
  return roleConfig ? roleConfig.permissions.includes(permission) : false;
}

/**
 * Check if a user is a group leader
 */
export function isGroupLeader(
  groupRole: GroupRoleName | null | undefined,
): boolean {
  return groupRole === 'leader';
}

/**
 * Check if a user can manage a specific group
 * (either they're a group leader OR they have fellowship-wide group management permission)
 */
export function canManageGroup(
  user: UserWithRoles | null | undefined,
  groupRole?: GroupRoleName | null,
): boolean {
  // Check fellowship-wide permissions first
  if (hasFellowshipPermission(user, FellowshipPermission.MANAGE_ALL_GROUPS)) {
    return true;
  }

  // Check group-specific role
  return isGroupLeader(groupRole);
}

/**
 * Get all permissions for a user (fellowship + group)
 */
export function getAllUserPermissions(
  user: UserWithRoles | null | undefined,
  groupRole?: GroupRoleName | null,
): {
  fellowship: FellowshipPermission[]
  group: GroupPermission[]
} {
  const fellowshipPermissions: FellowshipPermission[] = [];
  const groupPermissions: GroupPermission[] = [];

  // Get fellowship permissions
  if (user?.roles) {
    for (const role of user.roles) {
      const roleName = role.name.toLowerCase() as FellowshipRoleName;
      const roleConfig = FELLOWSHIP_ROLES[roleName];
      if (roleConfig) {
        fellowshipPermissions.push(...roleConfig.permissions);
      }
    }
  }

  // Get group permissions
  if (groupRole) {
    const roleConfig = GROUP_ROLES[groupRole];
    if (roleConfig) {
      groupPermissions.push(...roleConfig.permissions);
    }
  }

  // Remove duplicates
  return {
    fellowship: Array.from(new Set(fellowshipPermissions)),
    group: Array.from(new Set(groupPermissions)),
  };
}

/**
 * Check if a user can perform an action on a resource
 * This is a generic helper that can be extended
 */
export function canPerformAction(
  user: UserWithRoles | null | undefined,
  action: 'create' | 'read' | 'update' | 'delete',
  resource: string,
  options?: {
    isOwner?: boolean
    groupRole?: GroupRoleName
  },
): boolean {
  // Admin can do everything
  if (isAdmin(user)) {
    return true;
  }

  // Owner can usually update/delete their own resources
  if (options?.isOwner && (action === 'update' || action === 'delete')) {
    return true;
  }

  // Resource-specific checks
  switch (resource) {
    case 'user':
      if (action === 'create' || action === 'read') return true;
      if (action === 'update' || action === 'delete') {
        return (
          options?.isOwner
          || hasFellowshipPermission(user, FellowshipPermission.MANAGE_USERS)
        );
      }
      break;

    case 'group':
      if (action === 'read') return true;
      if (action === 'create') {
        return hasFellowshipPermission(user, FellowshipPermission.CREATE_GROUPS);
      }
      if (action === 'update' || action === 'delete') {
        return canManageGroup(user, options?.groupRole);
      }
      break;

    case 'event':
      if (action === 'read') return true;
      if (action === 'create') {
        return hasFellowshipPermission(user, FellowshipPermission.CREATE_EVENTS);
      }
      if (action === 'update' || action === 'delete') {
        return hasFellowshipPermission(user, FellowshipPermission.EDIT_ALL_EVENTS);
      }
      break;

    case 'post':
      if (action === 'read') return true;
      return hasFellowshipPermission(user, FellowshipPermission.MANAGE_POSTS);
    
    case 'gallery':
      if (action === 'read') return true
      return hasFellowshipPermission(user, FellowshipPermission.MANAGE_POSTS)
  }

  return false;
}
