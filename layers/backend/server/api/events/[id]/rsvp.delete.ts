/**
 * DELETE /api/events/:id/rsvp
 * Cancel/delete user's RSVP for an event
 */

import { myRequireUserSession } from '../../../utils/session'

export default defineEventHandler(async (event) => {
  // Require authentication
  const session = await myRequireUserSession(event)

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

    // Check if RSVP exists
    const existingRsvp = await db
      .select()
      .from(tables.eventRsvps)
      .where(
        and(
          eq(tables.eventRsvps.eventId, parseInt(eventId)),
          eq(tables.eventRsvps.userId, session.user.id),
        ),
      )
      .get()

    if (!existingRsvp) {
      throw createError({
        statusCode: 404,
        statusMessage: 'RSVP not found',
      })
    }

    // Delete RSVP
    await db
      .delete(tables.eventRsvps)
      .where(
        and(
          eq(tables.eventRsvps.eventId, parseInt(eventId)),
          eq(tables.eventRsvps.userId, session.user.id),
        ),
      )

    return {
      message: 'RSVP cancelled successfully',
    }
  }
  catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    console.error('Error cancelling RSVP:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to cancel RSVP',
    })
  }
})
