/**
 * DELETE /api/events/:id/check-in/:userId
 * Remove attendance record (undo check-in)
 */

import { myRequireUserSession } from '../../../../utils/session'
import { requireFellowshipPermission } from '../../../../utils/authorization'
import { FellowshipPermission } from '#layers/backend/shared/utils/authorization'

export default defineEventHandler(async (event) => {
  // Require authentication and permission
  await myRequireUserSession(event)
  await requireFellowshipPermission(event, FellowshipPermission.VIEW_USERS)

  const db = useDrizzle()
  const eventId = getRouterParam(event, 'id')
  const userId = getRouterParam(event, 'userId')

  if (!eventId || !userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Event ID and User ID are required',
    })
  }

  try {
    // Check if attendance exists
    const existingAttendance = await db
      .select()
      .from(tables.attendance)
      .where(
        and(
          eq(tables.attendance.eventId, parseInt(eventId)),
          eq(tables.attendance.userId, userId),
        ),
      )
      .get()

    if (!existingAttendance) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Attendance record not found',
      })
    }

    // Delete attendance
    await db
      .delete(tables.attendance)
      .where(
        and(
          eq(tables.attendance.eventId, parseInt(eventId)),
          eq(tables.attendance.userId, userId),
        ),
      )

    return {
      message: 'Attendance record removed successfully',
    }
  }
  catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    console.error('Error removing attendance:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to remove attendance',
    })
  }
})
