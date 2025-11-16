/**
 * DELETE /api/events/:id
 * Delete an event
 */

import { myRequireUserSession } from '../../utils/session'
import { requireFellowshipPermission } from '../../utils/authorization'
import { FellowshipPermission } from '~~/shared/utils/authorization'

export default defineEventHandler(async (event) => {
  // Require authentication and permission
  await myRequireUserSession(event)
  await requireFellowshipPermission(event, FellowshipPermission.DELETE_EVENTS)

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

    // Delete event (cascade will handle RSVPs and attendance)
    await db
      .delete(tables.events)
      .where(eq(tables.events.id, parseInt(eventId)))

    return {
      message: 'Event deleted successfully',
    }
  }
  catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    console.error('Error deleting event:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete event',
    })
  }
})
