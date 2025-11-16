/**
 * POST /api/events/:id/check-in
 * Mark attendance for an event (staff/usher function)
 */

import { z } from 'zod'
import { myRequireUserSession } from '../../../utils/session'
import { requireFellowshipPermission } from '../../../utils/authorization'
import { FellowshipPermission } from '~~/shared/utils/authorization'

const checkInSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
})

export default defineEventHandler(async (event) => {
  // Require authentication and permission
  await myRequireUserSession(event)
  // Require VIEW_USERS permission (staff/ushers should have this)
  await requireFellowshipPermission(event, FellowshipPermission.VIEW_USERS)

  const db = useDrizzle()
  const eventId = getRouterParam(event, 'id')

  if (!eventId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Event ID is required',
    })
  }

  const body = await readBody(event)

  // Validate input
  const validation = checkInSchema.safeParse(body)
  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: validation.error.format(),
    })
  }

  const { userId } = validation.data

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

    // Check if user exists
    const existingUser = await db
      .select()
      .from(tables.users)
      .where(eq(tables.users.id, userId))
      .get()

    if (!existingUser) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found',
      })
    }

    // Check if already checked in
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

    if (existingAttendance) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User already checked in for this event',
      })
    }

    // Mark attendance
    const attendance = await db
      .insert(tables.attendance)
      .values({
        eventId: parseInt(eventId),
        userId,
      })
      .returning()
      .get()

    return {
      attendance,
      message: 'Attendance marked successfully',
    }
  }
  catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    console.error('Error marking attendance:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to mark attendance',
    })
  }
})
