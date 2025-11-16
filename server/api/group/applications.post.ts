import { useValidatedBody, z } from 'h3-zod'

export default defineEventHandler(async (event) => {
  // Require authenticated user
  const { user } = await myRequireUserSession(event)

  // Validate input - array of group IDs
  const groupIds = await useValidatedBody(
    event,
    z
      .array(z.number().int().positive(), {
        message: 'Group IDs must be an array of positive numbers',
      })
      .min(1, 'At least one group must be selected'),
  )

  // Validate that groups exist and get existing applications
  try {
    const db = useDrizzle()

    // Check which groups exist
    const existingGroups = await db
      .select({ id: tables.groups.id })
      .from(tables.groups)
      .where(
        groupIds.length === 1
          ? eq(tables.groups.id, groupIds[0])
          : or(...groupIds.map((id: number) => eq(tables.groups.id, id))),
      )
      .all()

    const existingGroupIds = new Set(existingGroups.map((g) => g.id))
    const invalidGroupIds = groupIds.filter((id: number) => !existingGroupIds.has(id))

    if (invalidGroupIds.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid group IDs: ${invalidGroupIds.join(', ')}`,
      })
    }

    // Check for existing applications or memberships
    const existingApplications = await db
      .select({ groupId: tables.groupApplications.groupId })
      .from(tables.groupApplications)
      .where(
        and(
          eq(tables.groupApplications.userId, user.id),
          or(...groupIds.map((id: number) => eq(tables.groupApplications.groupId, id))),
        ),
      )
      .all()

    const existingMemberships = await db
      .select({ groupId: tables.membersToGroups.groupId })
      .from(tables.membersToGroups)
      .where(
        and(
          eq(tables.membersToGroups.userId, user.id),
          or(...groupIds.map((id: number) => eq(tables.membersToGroups.groupId, id))),
        ),
      )
      .all()

    const alreadyAppliedIds = new Set(existingApplications.map((a) => a.groupId))
    const alreadyMemberIds = new Set(existingMemberships.map((m) => m.groupId))

    // Filter to only new applications
    const newApplicationGroupIds = groupIds.filter(
      (id: number) => !alreadyAppliedIds.has(id) && !alreadyMemberIds.has(id),
    )

    // If no new applications to create
    if (newApplicationGroupIds.length === 0) {
      return {
        success: true,
        message: 'You have already applied to or are a member of all selected groups',
        applicationsCreated: 0,
        alreadyApplied: Array.from(alreadyAppliedIds),
        alreadyMember: Array.from(alreadyMemberIds),
      }
    }

    // Create applications
    const applications = newApplicationGroupIds.map((groupId: number) => ({
      groupId,
      userId: user.id,
    }))

    await applyToGroup(applications)

    return {
      success: true,
      message: `Successfully applied to ${newApplicationGroupIds.length} group(s)`,
      applicationsCreated: newApplicationGroupIds.length,
      alreadyApplied: Array.from(alreadyAppliedIds),
      alreadyMember: Array.from(alreadyMemberIds),
    }
  } catch (error) {
    // If it's already our thrown error, re-throw it
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    console.error('Group application error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to submit applications. Please try again later.',
    })
  }
})
