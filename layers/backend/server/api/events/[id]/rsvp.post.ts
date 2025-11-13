/**
 * POST /api/events/:id/rsvp
 * Create or update RSVP for an event
 */

import { z } from 'zod'
import { myRequireUserSession } from '../../../utils/session'

const rsvpSchema = z.object({
  status: z.enum(['attending', 'not_attending', 'maybe']),
  guestCount: z.number().int().min(0).max(50).default(0),
})

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

  const body = await readBody(event)

  // Validate input
  const validation = rsvpSchema.safeParse(body)
  if (!validation.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: validation.error.format(),
    })
  }

  const { status, guestCount } = validation.data

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

    // Check if RSVP already exists
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

    let rsvp

    if (existingRsvp) {
      // Update existing RSVP
      rsvp = await db
        .update(tables.eventRsvps)
        .set({
          status,
          guestCount,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(tables.eventRsvps.eventId, parseInt(eventId)),
            eq(tables.eventRsvps.userId, session.user.id),
          ),
        )
        .returning()
        .get()
    }
    else {
      // Create new RSVP
      rsvp = await db
        .insert(tables.eventRsvps)
        .values({
          eventId: parseInt(eventId),
          userId: session.user.id,
          status,
          guestCount,
        })
        .returning()
        .get()
    }

    return {
      rsvp,
      message: 'RSVP saved successfully',
    }
  }
  catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      throw error
    }

    console.error('Error saving RSVP:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to save RSVP',
    })
  }
})
