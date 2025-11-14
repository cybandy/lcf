/**
 * GET /api/events
 * List all events with optional filtering
 */
import { useValidatedQuery, z, zh } from 'h3-zod'

export default defineEventHandler(async (event) => {
  const db = useDrizzle()

  // Optional filters
  const { status, limit, offset } = await useValidatedQuery(event, z.object({
    status: z.enum(['upcoming', 'past', 'ongoing']).optional().default('upcoming'),
    limit: zh.intAsString.optional().default('8'),
    offset: zh.intAsString.optional().default('0'),
  }))

  const now = new Date()

  try {
    // Build query with filters
    const whereConditions = []
    if (status==='upcoming') {
      whereConditions.push(gte(tables.events.startTime, now))
    }
    else if (status==='past') {
      whereConditions.push(lt(tables.events.endTime, now))
    }
    else if (status==='ongoing') {
      whereConditions.push(
        and(
          gt(tables.events.endTime, now),
          lt(tables.events.startTime, now)
        )
      )
    }

    let eventsQuery = db
      .select({
        id: tables.events.id,
        title: tables.events.title,
        description: tables.events.description,
        startTime: tables.events.startTime,
        endTime: tables.events.endTime,
        location: tables.events.location,
      })
      .from(tables.events)
      .leftJoin(tables.users, eq(tables.events.creatorId, tables.users.id))
      .$dynamic()

    // Apply where conditions
    if (whereConditions.length > 0) {
      eventsQuery = eventsQuery.where(and(...whereConditions))
    }

    // Apply order
    if (status === 'upcoming' || status === 'ongoing') {
      eventsQuery.orderBy(asc(tables.events.startTime))
    } else if (status === 'past') {
      eventsQuery = eventsQuery.orderBy(desc(tables.events.startTime),
    )
    }

    // Apply limit
      eventsQuery = eventsQuery.limit(limit)
    // Apply offset
    eventsQuery = eventsQuery.offset(limit*offset)

    const events = (await eventsQuery)

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
