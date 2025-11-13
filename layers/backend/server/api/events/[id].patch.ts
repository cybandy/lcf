/**
 * PATCH /api/events/:id
 * Update an existing event
 */

import { z } from 'zod'
import { myRequireUserSession } from '../../utils/session'
import { requireFellowshipPermission } from '../../utils/authorization'
import { FellowshipPermission } from '#layers/backend/shared/utils/authorization'

const updateEventSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  startTime: z.string().datetime().optional(),
  endTime: z.string().datetime().optional().nullable(),
  location: z.string().optional().nullable(),
})

export default defineEventHandler(async (event) => {
  // Require authentication and permission
  await myRequireUserSession(event)
  await requireFellowshipPermission(event, FellowshipPermission.EDIT_ALL_EVENTS)

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
  const validation = updateEventSchema.safeParse(body)
  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: validation.error.format(),
    })
  }

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

  const updateData = validation.data

  // Validate dates if both are provided
  if (updateData.startTime && updateData.endTime) {
    const start = new Date(updateData.startTime)
    const end = new Date(updateData.endTime)

    if (end <= start) {
      throw createError({
        statusCode: 400,
        statusMessage: 'End time must be after start time',
      })
    }
  }

  try {
    const updatedEvent = await db
      .update(tables.events)
      .set({
        ...(updateData.title && { title: updateData.title }),
        ...(updateData.description !== undefined && { description: updateData.description }),
        ...(updateData.startTime && { startTime: new Date(updateData.startTime) }),
        ...(updateData.endTime !== undefined && { endTime: updateData.endTime ? new Date(updateData.endTime) : null }),
        ...(updateData.location !== undefined && { location: updateData.location }),
        updatedAt: new Date(),
      })
      .where(eq(tables.events.id, parseInt(eventId)))
      .returning()
      .get()

    return {
      event: updatedEvent,
      message: 'Event updated successfully',
    }
  }
  catch (error) {
    console.error('Error updating event:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to update event',
    })
  }
})
