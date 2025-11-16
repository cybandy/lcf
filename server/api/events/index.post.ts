/**
 * POST /api/events
 * Create a new event
 */

import { z } from 'zod'
import { myRequireUserSession } from '../../utils/session'
import { requireFellowshipPermission } from '../../utils/authorization'
import { FellowshipPermission } from '~~/shared/utils/authorization'

const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  location: z.string().optional(),
})

export default defineEventHandler(async (event) => {
  // Require authentication and permission
  const session = await myRequireUserSession(event)
  await requireFellowshipPermission(event, FellowshipPermission.CREATE_EVENTS)

  const db = useDrizzle()
  const body = await readBody(event)

  // Validate input
  const validation = createEventSchema.safeParse(body)
  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: validation.error.format(),
    })
  }

  const { title, description, startTime, endTime, location } = validation.data

  // Validate dates
  const start = new Date(startTime)
  const end = endTime ? new Date(endTime) : null

  if (end && end <= start) {
    throw createError({
      statusCode: 400,
      statusMessage: 'End time must be after start time',
    })
  }

  try {
    const newEvent = await db
      .insert(tables.events)
      .values({
        title,
        description: description || null,
        startTime: start,
        endTime: end,
        location: location || null,
        creatorId: session.user.id,
      })
      .returning()
      .get()

    return {
      event: newEvent,
      message: 'Event created successfully',
    }
  }
  catch (error) {
    console.error('Error creating event:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create event',
    })
  }
})
