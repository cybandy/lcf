/**
 * Server-side Authorization Helpers
 * 
 * These utilities extend the shared authorization system with
 * server-specific functionality for H3 events and database queries.
 */

import type { H3Event } from 'h3';
import { eq, and } from 'drizzle-orm';
import {
  FellowshipPermission,
  type GroupPermission,
  type UserWithRoles,
  type GroupRoleName,
  hasFellowshipPermission,
  hasGroupPermission,
  canManageGroup,
  isAdmin,
} from '#layers/backend/shared/utils/authorization';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface UserSessionWithRoles {
  user: UserWithRoles & {
    id: string;
    email: string;
    firstName: string | null;
    lastName: string | null;
    status: string;
  };
}

export interface GroupMembership {
  userId: string;
  groupId: number;
  role: GroupRoleName;
}

// ============================================================================
// SESSION & DATABASE HELPERS
// ============================================================================

/**
 * Get user with roles from session
 */
export async function getUserWithRoles(
  event: H3Event,
): Promise<UserWithRoles | null> {
  const session = await getUserSession(event);
  
  // @ts-expect-error - Session user has id property from auth-utils
  if (!session?.user?.id) {
    return null;
  }

  const db = useDrizzle();

  // Get user's roles from database
  // @ts-expect-error - Session user has id property from auth-utils
  const userId = session.user.id as string;
  
  const userWithRoles = await db
    .select({
      id: tables.users.id,
      roleId: tables.roles.id,
      roleName: tables.roles.name,
    })
    .from(tables.users)
    .leftJoin(tables.userRoles, eq(tables.users.id, tables.userRoles.userId))
    .leftJoin(tables.roles, eq(tables.userRoles.roleId, tables.roles.id))
    .where(eq(tables.users.id, userId))
    .all();

  if (userWithRoles.length === 0) {
    return null;
  }

  // Transform the result to include roles array
  const roles = userWithRoles
    .filter((row) => row.roleId !== null)
    .map((row) => ({
      id: row.roleId!,
      name: row.roleName!,
    }));

  return {
    id: userId,
    roles: roles.length > 0 ? roles : undefined,
  };
}

/**
 * Get user's role in a specific group
 */
export async function getUserGroupRole(
  userId: string,
  groupId: number,
): Promise<GroupRoleName | null> {
  const db = useDrizzle();

  const membership = await db
    .select({
      role: tables.membersToGroups.role,
    })
    .from(tables.membersToGroups)
    .where(
      and(
        eq(tables.membersToGroups.userId, userId),
        eq(tables.membersToGroups.groupId, groupId),
      ),
    )
    .get();

  return membership?.role as GroupRoleName | null;
}

/**
 * Check if user is a member of a specific group
 */
export async function isGroupMember(
  userId: string,
  groupId: number,
): Promise<boolean> {
  const role = await getUserGroupRole(userId, groupId);
  return role !== null;
}

// ============================================================================
// AUTHORIZATION GUARDS
// ============================================================================

/**
 * Require that the user has a specific fellowship permission
 * Throws 403 if not authorized
 */
export async function requireFellowshipPermission(
  event: H3Event,
  permission: FellowshipPermission,
): Promise<UserWithRoles> {
  const user = await getUserWithRoles(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized - Please log in',
    });
  }

  if (!hasFellowshipPermission(user, permission)) {
    throw createError({
      statusCode: 403,
      message: 'Forbidden - Insufficient permissions',
    });
  }

  return user;
}

/**
 * Require that the user is an admin
 * Throws 403 if not authorized
 */
export async function requireAdmin(event: H3Event): Promise<UserWithRoles> {
  const user = await getUserWithRoles(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized - Please log in',
    });
  }

  if (!isAdmin(user)) {
    throw createError({
      statusCode: 403,
      message: 'Forbidden - Admin access required',
    });
  }

  return user;
}

/**
 * Require that the user can manage a specific group
 * Throws 403 if not authorized
 */
export async function requireGroupManagement(
  event: H3Event,
  groupId: number,
): Promise<{ user: UserWithRoles; groupRole: GroupRoleName | null }> {
  const user = await getUserWithRoles(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized - Please log in',
    });
  }

  const groupRole = await getUserGroupRole(user.id, groupId);

  if (!canManageGroup(user, groupRole)) {
    throw createError({
      statusCode: 403,
      message: 'Forbidden - You do not have permission to manage this group',
    });
  }

  return { user, groupRole };
}

/**
 * Require that the user has a specific group permission
 * Throws 403 if not authorized
 */
export async function requireGroupPermission(
  event: H3Event,
  groupId: number,
  permission: GroupPermission,
): Promise<{ user: UserWithRoles; groupRole: GroupRoleName }> {
  const user = await getUserWithRoles(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized - Please log in',
    });
  }

  const groupRole = await getUserGroupRole(user.id, groupId);

  if (!groupRole || !hasGroupPermission(groupRole, permission)) {
    throw createError({
      statusCode: 403,
      message: 'Forbidden - Insufficient group permissions',
    });
  }

  return { user, groupRole };
}

/**
 * Check if the current user is the owner of a resource
 * Returns true if user is owner OR is admin
 */
export async function isOwnerOrAdmin(
  event: H3Event,
  resourceOwnerId: string,
): Promise<boolean> {
  const session = await getUserSession(event);
  
  // @ts-expect-error - Session user has id property from auth-utils
  if (!session?.user?.id) {
    return false;
  }

  // @ts-expect-error - Session user has id property from auth-utils
  const userId = session.user.id as string;

  // Check if user is the owner
  if (userId === resourceOwnerId) {
    return true;
  }

  // Check if user is admin
  const user = await getUserWithRoles(event);
  return user ? isAdmin(user) : false;
}

/**
 * Require that the user is the owner of a resource or is an admin
 * Throws 403 if not authorized
 */
export async function requireOwnerOrAdmin(
  event: H3Event,
  resourceOwnerId: string,
): Promise<UserWithRoles> {
  const user = await getUserWithRoles(event);

  if (!user) {
    throw createError({
      statusCode: 401,
      message: 'Unauthorized - Please log in',
    });
  }

  const isOwner = user.id === resourceOwnerId;
  const userIsAdmin = isAdmin(user);

  if (!isOwner && !userIsAdmin) {
    throw createError({
      statusCode: 403,
      message: 'Forbidden - You can only modify your own resources',
    });
  }

  return user;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all groups where user is a leader
 */
export async function getUserLeaderGroups(userId: string): Promise<number[]> {
  const db = useDrizzle();

  const groups = await db
    .select({
      groupId: tables.membersToGroups.groupId,
    })
    .from(tables.membersToGroups)
    .where(
      and(
        eq(tables.membersToGroups.userId, userId),
        eq(tables.membersToGroups.role, 'leader'),
      ),
    )
    .all();

  return groups.map((g) => g.groupId);
}

/**
 * Check if user can access a specific resource
 * Useful for conditional rendering and access control
 */
export async function canAccessResource(
  event: H3Event,
  resourceType: 'group' | 'event' | 'post',
  resourceId: number,
): Promise<boolean> {
  const user = await getUserWithRoles(event);

  if (!user) {
    return false;
  }

  // Admins can access everything
  if (isAdmin(user)) {
    return true;
  }

  // Resource-specific checks
  switch (resourceType) {
    case 'group':
      return await isGroupMember(user.id, resourceId);
    
    case 'event':
      // Check if user has event management permissions
      return hasFellowshipPermission(
        user,
        FellowshipPermission.EDIT_ALL_EVENTS,
      );
    
    case 'post':
      // Check if user has post management permissions
      return hasFellowshipPermission(
        user,
        FellowshipPermission.MANAGE_POSTS,
      );
    
    default:
      return false;
  }
}
