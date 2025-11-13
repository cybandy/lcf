/**
 * GET /api/events
 * List all events with optional filtering
 */

import { myRequireUserSession } from '../../utils/session'

export default defineEventHandler(async (event) => {
  // Require authentication
  await myRequireUserSession(event)

  const db = useDrizzle()
  const query = getQuery(event)

  // Optional filters
  const upcoming = query.upcoming === 'true'
  const past = query.past === 'true'
  const limit = query.limit ? parseInt(query.limit as string) : undefined

  const now = new Date()

  try {
    // Build query with filters
    const whereConditions = []
    if (upcoming) {
      whereConditions.push(gte(tables.events.startTime, now))
    }
    else if (past) {
      whereConditions.push(lt(tables.events.startTime, now))
    }

    let eventsQuery = db
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
      .$dynamic()

    // Apply where conditions
    if (whereConditions.length > 0) {
      eventsQuery = eventsQuery.where(and(...whereConditions))
    }

    // Apply order
    eventsQuery = eventsQuery.orderBy(
      upcoming ? asc(tables.events.startTime) : desc(tables.events.startTime),
    )

    // Apply limit
    if (limit) {
      eventsQuery = eventsQuery.limit(limit)
    }

    const events = (await eventsQuery).map(x=>({...x, creator:{...x.creator, avatar: x.creator?.avatar ? `/files/${x.creator?.avatar}` : undefined}}))

    return {
      events,
      total: events.length,
    }
  }
  catch (error) {
    console.error('Error fetching events:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch events',
    })
  }
})
