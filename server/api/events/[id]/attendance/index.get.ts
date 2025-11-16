/**
 * GET /api/events/:id/attendance
 * Get attendance list for an event (staff/usher function)
 */

import { myRequireUserSession } from '~~/server/utils/session'
import { requireFellowshipPermission } from '~~/server/utils/authorization'
import { FellowshipPermission } from '~~/shared/utils/authorization'

export default defineEventHandler(async (event) => {
  // Require authentication and permission
  await myRequireUserSession(event)
  await requireFellowshipPermission(event, FellowshipPermission.VIEW_USERS)

  const db = useDrizzle()
  const eventId = getRouterParam(event, 'id')

  if (!eventId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Event ID is required',
    })
  }

  try {
    // Check if event exists
    const existingEvent = await db
      .select()
      .from(tables.events)
      .where(eq(tables.events.id, parseInt(eventId)))
      .get()

    if (!existingEvent) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Event not found',
      })
    }

    // Get all attendance records with user details
    let attendanceList = await db
      .select({
        userId: tables.attendance.userId,
        checkInTime: tables.attendance.checkInTime,
        user: {
          id: tables.users.id,
          firstName: tables.users.firstName,
          lastName: tables.users.lastName,
          email: tables.users.email,
          avatar: tables.users.avatar,
          status: tables.users.status,
        },
      })
      .from(tables.attendance)
      .leftJoin(tables.users, eq(tables.attendance.userId, tables.users.id))
      .where(eq(tables.attendance.eventId, parseInt(eventId)))
      .orderBy(desc(tables.attendance.checkInTime))
      .all()
    
    attendanceList = attendanceList.map(x => ({
      ...x,
      user: x.user ? {
        ...x.user,
        avatar: x.user.avatar ? `/files/${x.user.avatar}` : null
      }: null
    }))

    return {
      attendance: attendanceList,
      total: attendanceList.length,
    }
  }
  catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    console.error('Error fetching attendance:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch attendance',
    })
  }
})
