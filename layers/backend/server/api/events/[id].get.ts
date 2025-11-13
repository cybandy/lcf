/**
 * GET /api/events/:id
 * Get detailed information about a specific event
 */

import { myRequireUserSession } from '../../utils/session'

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
    const eventData = await db
      .select({
        id: tables.events.id,
        title: tables.events.title,
        description: tables.events.description,
        startTime: tables.events.startTime,
        endTime: tables.events.endTime,
        location: tables.events.location,
        creatorId: tables.events.creatorId,
        createdAt: tables.events.createdAt,
        updatedAt: tables.events.updatedAt,
        creator: {
          id: tables.users.id,
          firstName: tables.users.firstName,
          lastName: tables.users.lastName,
          avatar: tables.users.avatar,
        },
      })
      .from(tables.events)
      .leftJoin(tables.users, eq(tables.events.creatorId, tables.users.id))
      .where(eq(tables.events.id, parseInt(eventId)))
      .get()

    if (!eventData) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Event not found',
      })
    }

    // Get RSVP counts
    const rsvpCounts = await db
      .select({
        status: tables.eventRsvps.status,
        count: sql<number>`count(*)`.as('count'),
        totalGuests: sql<number>`sum(${tables.eventRsvps.guestCount})`.as('totalGuests'),
      })
      .from(tables.eventRsvps)
      .where(eq(tables.eventRsvps.eventId, parseInt(eventId)))
      .groupBy(tables.eventRsvps.status)
      .all()

    // Get user's RSVP status
    const userRsvp = await db
      .select()
      .from(tables.eventRsvps)
      .where(
        and(
          eq(tables.eventRsvps.eventId, parseInt(eventId)),
          eq(tables.eventRsvps.userId, session.user.id),
        ),
      )
      .get()

    // Get attendance count
    const attendanceCount = await db
      .select({ count: sql<number>`count(*)`.as('count') })
      .from(tables.attendance)
      .where(eq(tables.attendance.eventId, parseInt(eventId)))
      .get()

    return {
      event: {...eventData, creator: {...eventData.creator, avatar: eventData.creator?.avatar ? `/files/${eventData.creator?.avatar}` : undefined }},
      rsvpCounts: rsvpCounts.reduce(
        (acc, curr) => ({
          ...acc,
          [curr.status]: {
            count: curr.count,
            totalGuests: curr.totalGuests || 0,
          },
        }),
        {} as Record<string, { count: number, totalGuests: number }>,
      ),
      userRsvp: userRsvp || null,
      attendanceCount: attendanceCount?.count || 0,
    }
  }
  catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    console.error('Error fetching event:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch event',
    })
  }
})
