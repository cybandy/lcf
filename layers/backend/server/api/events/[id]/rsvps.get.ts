/**
 * GET /api/events/:id/rsvps
 * Get all RSVPs for an event (for organizers)
 */

import { myRequireUserSession } from '../../../utils/session'
import { requireFellowshipPermission } from '../../../utils/authorization'
import { FellowshipPermission } from '#layers/backend/shared/utils/authorization'

export default defineEventHandler(async (event) => {
  // Require authentication and permission to view users
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

    // Get all RSVPs with user details
    const rsvps = await db
      .select({
        userId: tables.eventRsvps.userId,
        status: tables.eventRsvps.status,
        guestCount: tables.eventRsvps.guestCount,
        createdAt: tables.eventRsvps.createdAt,
        updatedAt: tables.eventRsvps.updatedAt,
        user: {
          id: tables.users.id,
          firstName: tables.users.firstName,
          lastName: tables.users.lastName,
          email: tables.users.email,
          phoneNumber: tables.users.phoneNumber,
          avatar: tables.users.avatar,
        },
      })
      .from(tables.eventRsvps)
      .leftJoin(tables.users, eq(tables.eventRsvps.userId, tables.users.id))
      .where(eq(tables.eventRsvps.eventId, parseInt(eventId)))
      .orderBy(desc(tables.eventRsvps.createdAt))
      .all()

    // Calculate summary
    const summary = {
      attending: 0,
      attendingGuests: 0,
      notAttending: 0,
      maybe: 0,
      maybeGuests: 0,
      total: rsvps.length,
    }

    rsvps.forEach((rsvp, ind) => {
      if (rsvp.status === 'attending') {
        summary.attending++
        summary.attendingGuests += rsvp.guestCount
      }
      else if (rsvp.status === 'not_attending') {
        summary.notAttending++
      }
      else if (rsvp.status === 'maybe') {
        summary.maybe++
        summary.maybeGuests += rsvp.guestCount
      }
      
      //
      if (rsvp.user) {
        rsvps[ind] = {...rsvp, user: {...rsvp.user, avatar: rsvp.user.avatar ? `/files/${rsvp.user.avatar}` : null}}
      }
    })

    return {
      rsvps,
      summary,
    }
  }
  catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    console.error('Error fetching RSVPs:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch RSVPs',
    })
  }
})
