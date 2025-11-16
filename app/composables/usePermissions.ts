/**
 * Frontend Authorization Composable
 * 
 * Provides reactive authorization checks for the frontend.
 * Uses the shared authorization utilities and session data.
 */

import type { Role } from '~~/shared/utils/zod_schemas';
import {
  FellowshipPermission,
  GroupPermission,
  type UserWithRoles,
  type GroupRoleName,
  type FellowshipRoleName,
  hasFellowshipPermission,
  hasAnyFellowshipPermission,
  hasAllFellowshipPermissions,
  hasGroupPermission,
  hasRole,
  isAdmin,
  isPastor,
  isGroupLeader,
  canManageGroup,
  canPerformAction,
  getAllUserPermissions,
} from '~~/shared/utils/authorization';

// Extend the session user type to include roles
interface SessionUser {
  id: string
  roles?: Role[]
}

export function usePermissions() {
  const { user, loggedIn } = useMyUserSession();

  // ============================================================================
  // COMPUTED PROPERTIES
  // ============================================================================

  /**
   * Current user with roles (typed for authorization)
   */
  const currentUser = computed<UserWithRoles | null>(() => {
    if (!loggedIn.value || !user.value) {
      return null;
    }

    const sessionUser = user.value as unknown as SessionUser;

    return {
      id: sessionUser.id,
      roles: sessionUser.roles,
    };
  });

  /**
   * Check if current user is an admin
   */
  const userIsAdmin = computed(() => isAdmin(currentUser.value));

  /**
   * Check if current user is a pastor
   */
  const userIsPastor = computed(() => isPastor(currentUser.value));

  // ============================================================================
  // FELLOWSHIP PERMISSION CHECKS
  // ============================================================================

  /**
   * Check if user has a specific fellowship permission
   */
  function can(permission: FellowshipPermission): boolean {
    return hasFellowshipPermission(currentUser.value, permission);
  }

  /**
   * Reactive computed version of can()
   */
  function canComputed(permission: FellowshipPermission) {
    return computed(() => can(permission));
  }

  /**
   * Check if user has ANY of the specified permissions
   */
  function canAny(permissions: FellowshipPermission[]): boolean {
    return hasAnyFellowshipPermission(currentUser.value, permissions);
  }

  /**
   * Check if user has ALL of the specified permissions
   */
  function canAll(permissions: FellowshipPermission[]): boolean {
    return hasAllFellowshipPermissions(currentUser.value, permissions);
  }

  /**
   * Check if user has a specific role
   */
  function userHasRole(roleName: FellowshipRoleName): boolean {
    return hasRole(currentUser.value, roleName);
  }

  // ============================================================================
  // GROUP PERMISSION CHECKS
  // ============================================================================

  /**
   * Check if user has a group permission for their role
   */
  function canInGroup(
    groupRole: GroupRoleName | null | undefined,
    permission: GroupPermission,
  ): boolean {
    return hasGroupPermission(groupRole, permission);
  }

  /**
   * Reactive computed version of canInGroup()
   */
  function canInGroupComputed(
    groupRole: Ref<GroupRoleName | null | undefined>,
    permission: GroupPermission,
  ) {
    return computed(() => canInGroup(groupRole.value, permission));
  }

  /**
   * Check if user is a group leader
   */
  function userIsGroupLeader(
    groupRole: GroupRoleName | null | undefined,
  ): boolean {
    return isGroupLeader(groupRole);
  }

  /**
   * Check if user can manage a group (either group leader or fellowship-wide permission)
   */
  function userCanManageGroup(
    groupRole?: GroupRoleName | null,
  ): boolean {
    return canManageGroup(currentUser.value, groupRole);
  }

  // ============================================================================
  // RESOURCE-BASED CHECKS
  // ============================================================================

  /**
   * Check if user can perform an action on a resource
   */
  function canPerform(
    action: 'create' | 'read' | 'update' | 'delete',
    resource: string,
    options?: {
      isOwner?: boolean
      groupRole?: GroupRoleName
    },
  ): boolean {
    return canPerformAction(currentUser.value, action, resource, options);
  }

  /**
   * Check if user owns a resource (by comparing user IDs)
   */
  function isOwner(resourceOwnerId: string | null | undefined): boolean {
    if (!loggedIn.value || !user.value || !resourceOwnerId) {
      return false;
    }
    return user.value.id === resourceOwnerId;
  }

  /**
   * Check if user is owner OR admin
   */
  function isOwnerOrAdminCheck(resourceOwnerId: string | null | undefined): boolean {
    return isOwner(resourceOwnerId) || userIsAdmin.value;
  }
  /**
   * Check if user is owner OR admin
   */
  function isOwnerOrAdminOrPastorCheck(resourceOwnerId: string | null | undefined): boolean {
    return isOwner(resourceOwnerId) || userIsAdmin.value || userIsPastor.value;
  }

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  /**
   * Get all permissions for current user
   */
  function getUserPermissions(groupRole?: GroupRoleName | null) {
    return getAllUserPermissions(currentUser.value, groupRole);
  }

  /**
   * Check multiple conditions at once
   */
  function checkConditions(conditions: {
    requireAuth?: boolean
    requireAdmin?: boolean
    requirePermission?: FellowshipPermission
    requireAnyPermission?: FellowshipPermission[]
    requireAllPermissions?: FellowshipPermission[]
    requireOwnership?: string // resource owner ID
  }): boolean {
    // Check authentication
    if (conditions.requireAuth && !loggedIn.value) {
      return false;
    }

    // Check admin
    if (conditions.requireAdmin && !userIsAdmin.value) {
      return false;
    }

    // Check specific permission
    if (conditions.requirePermission && !can(conditions.requirePermission)) {
      return false;
    }

    // Check any permission
    if (conditions.requireAnyPermission && !canAny(conditions.requireAnyPermission)) {
      return false;
    }

    // Check all permissions
    if (conditions.requireAllPermissions && !canAll(conditions.requireAllPermissions)) {
      return false;
    }

    // Check ownership
    if (conditions.requireOwnership && !isOwnerOrAdminCheck(conditions.requireOwnership)) {
      return false;
    }

    return true;
  }

  /**
   * Reactive version of checkConditions
   */
  function checkConditionsComputed(conditions: Parameters<typeof checkConditions>[0]) {
    return computed(() => checkConditions(conditions));
  }

  // ============================================================================
  // RETURN API
  // ============================================================================

  return {
    // State
    currentUser,
    loggedIn,
    userIsAdmin,
    userIsPastor,

    // Fellowship permissions
    can,
    canComputed,
    canAny,
    canAll,
    userHasRole,

    // Group permissions
    canInGroup,
    canInGroupComputed,
    userIsGroupLeader,
    userCanManageGroup,

    // Resource checks
    canPerform,
    isOwner,
    isOwnerOrAdminCheck,
    isOwnerOrAdminOrPastorCheck,

    // Utilities
    getUserPermissions,
    checkConditions,
    checkConditionsComputed,

    // Permission enums (for convenience)
    FellowshipPermission,
    GroupPermission,
  };
}
