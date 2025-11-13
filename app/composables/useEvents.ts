/**
 * Events Composable
 * 
 * Centralized state and operations for event management
 */

import { formatDistance } from 'date-fns'

export interface EventData {
  id: number
  title: string
  description?: string | null
  startTime: string
  endTime?: string
  location?: string | null
  creatorId?: string | null
  creator?: {
    id: string
    firstName: string
    lastName: string
    avatar?: string | null
  } | null
}

export interface EventDetail {
  event: EventData
  rsvpCounts: Record<string, { count: number, totalGuests: number }>
  userRsvp?: {
    status: 'attending' | 'not_attending' | 'maybe'
    guestCount: number
    createdAt: Date | string
    updatedAt: Date | string
  } | null
  attendanceCount: number
}

export interface RsvpData {
  userId: string
  status: 'attending' | 'not_attending' | 'maybe'
  guestCount: number
  createdAt: Date | string
  updatedAt: Date | string
  user?: {
    id: string
    firstName: string
    lastName: string
    email: string
    phoneNumber: string | null
    avatar?: string | null
  } | null
}

export interface RsvpSummary {
  attending: number
  attendingGuests: number
  notAttending: number
  maybe: number
  maybeGuests: number
  total: number
}

export interface AttendanceData {
  userId: string
  checkInTime: Date | string
  user?: {
    id: string
    firstName: string
    lastName: string
    email: string
    avatar?: string | null
    status: string
  } | null
}

export type EventStatus = 'upcoming' | 'past' | 'ongoing'

export function useEvents() {
  const toast = useToast()
  const permissions = usePermissions()

  // ============================================================================
  // STATE
  // ============================================================================

  const loading = ref(false)
  const events = ref<EventData[]>([])
  const currentEvent = ref<EventDetail | null>(null)

  // ============================================================================
  // COMPUTED
  // ============================================================================

  /**
   * Check if user can create events
   */
  const canCreateEvents = computed(() =>
    permissions.can(permissions.FellowshipPermission.CREATE_EVENTS),
  )

  /**
   * Check if user can edit all events
   */
  const canEditAllEvents = computed(() =>
    permissions.can(permissions.FellowshipPermission.EDIT_ALL_EVENTS),
  )

  /**
   * Check if user can delete events
   */
  const canDeleteEvents = computed(() =>
    permissions.can(permissions.FellowshipPermission.DELETE_EVENTS),
  )

  /**
   * Check if user can view all RSVPs and attendance
   */
  const canViewAllRsvps = computed(() =>
    permissions.can(permissions.FellowshipPermission.VIEW_USERS),
  )

  /**
   * Check if user is owner, admin, or pastor of current event
   */
  const canManageCurrentEvent = computed(() => {
    if (!currentEvent.value) return false
    return permissions.isOwnerOrAdminOrPastorCheck(currentEvent.value.event.creatorId)
  })

  // ============================================================================
  // FETCH OPERATIONS
  // ============================================================================

  /**
   * Fetch list of events
   */
  async function fetchEvents(options?: {
    status?: EventStatus
    limit?: number
  }) {
    loading.value = true

    try {
      const response = await $fetch<{ events: EventData[], total: number }>('/api/events', {
        query: {
          ...(options?.status === 'upcoming' && { upcoming: 'true' }),
          ...(options?.status === 'past' && { past: 'true' }),
          ...(options?.limit && { limit: options.limit }),
        },
      })

      events.value = response.events
      return response
    } catch (error) {
      toast.add({
        title: 'Error',
        description: 'Failed to fetch events',
        color: 'error',
      })
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch single event details
   */
  async function fetchEventDetail(eventId: number) {
    loading.value = true

    try {
      const response = await $fetch<EventDetail>(`/api/events/${eventId}`)
      currentEvent.value = response
      return response
    } catch (error) {
      toast.add({
        title: 'Oops!',
        description: 'Failed to fetch event details',
        color: 'error',
      })
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Fetch RSVPs for an event
   */
  async function fetchEventRsvps(eventId: number) {
    try {
      const response = await $fetch<{
        rsvps: RsvpData[]
        summary: RsvpSummary
      }>(`/api/events/${eventId}/rsvps`)

      return response
    } catch (error) {
      toast.add({
        title: 'Error',
        description: 'Failed to fetch RSVPs',
        color: 'error',
      })
      throw error
    }
  }

  /**
   * Fetch attendance for an event
   */
  async function fetchEventAttendance(eventId: number) {
    try {
      const response = await $fetch<{
        attendance: AttendanceData[]
        total: number
      }>(`/api/events/${eventId}/attendance`)

      return response
    } catch (error) {
      toast.add({
        title: 'Error',
        description: 'Failed to fetch attendance',
        color: 'error',
      })
      throw error
    }
  }

  // ============================================================================
  // MUTATION OPERATIONS
  // ============================================================================

  /**
   * Create a new event
   */
  async function createEvent(data: {
    title: string
    description?: string
    startTime: string
    endTime?: string
    location?: string
  }) {
    loading.value = true

    try {
      const response = await $fetch('/api/events', {
        method: 'POST',
        body: data,
      })

      toast.add({
        title: 'Success',
        description: 'Event created successfully',
        color: 'success',
      })

      return response
    } catch (error) {
      const errorMessage
        = (error as { data?: { message?: string } }).data?.message
          || 'Failed to create event'

      toast.add({
        title: 'Error',
        description: errorMessage,
        color: 'error',
      })
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Update an existing event
   */
  async function updateEvent(eventId: number, data: {
    title?: string
    description?: string
    startTime?: string
    endTime?: string | null
    location?: string | null
  }) {
    loading.value = true

    try {
      const response = await $fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        body: data,
      })

      toast.add({
        title: 'Success',
        description: 'Event updated successfully',
        color: 'success',
      })

      return response
    } catch (error) {
      const errorMessage
        = (error as { data?: { message?: string } }).data?.message
          || 'Failed to update event'

      toast.add({
        title: 'Error',
        description: errorMessage,
        color: 'error',
      })
      throw error
    } finally {
      loading.value = false
    }
  }

  /**
   * Delete an event
   */
  async function deleteEvent(eventId: number) {
    // if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
    //   return false
    // }

    loading.value = true

    try {
      await $fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      })

      toast.add({
        title: 'Success',
        description: 'Event deleted successfully',
        color: 'success',
      })

      return true
    } catch (error) {
      const errorMessage
        = (error as { data?: { message?: string } }).data?.message
          || 'Failed to delete event'

      toast.add({
        title: 'Error',
        description: errorMessage,
        color: 'error',
      })
      throw error
    } finally {
      loading.value = false
    }
  }

  // ============================================================================
  // RSVP OPERATIONS
  // ============================================================================

  /**
   * Create or update RSVP
   */
  async function saveRsvp(eventId: number, data: {
    status: 'attending' | 'not_attending' | 'maybe'
    guestCount: number
  }) {
    try {
      const response = await $fetch(`/api/events/${eventId}/rsvp`, {
        method: 'POST',
        body: data,
      })

      toast.add({
        title: 'Success',
        description: 'RSVP saved successfully',
        color: 'success',
      })

      return response
    } catch (error) {
      const errorMessage
        = (error as { data?: { message?: string } }).data?.message
          || 'Failed to save RSVP'

      toast.add({
        title: 'Error',
        description: errorMessage,
        color: 'error',
      })
      throw error
    }
  }

  /**
   * Cancel RSVP
   */
  async function cancelRsvp(eventId: number) {
    if (!confirm('Are you sure you want to cancel your RSVP?')) {
      return false
    }

    try {
      await $fetch(`/api/events/${eventId}/rsvp`, {
        method: 'DELETE',
      })

      toast.add({
        title: 'Success',
        description: 'RSVP cancelled successfully',
        color: 'success',
      })

      return true
    } catch (error) {
      toast.add({
        title: 'Error',
        description: 'Failed to cancel RSVP',
        color: 'error',
      })
      throw error
    }
  }

  // ============================================================================
  // ATTENDANCE OPERATIONS
  // ============================================================================

  /**
   * Check in a user for an event
   */
  async function checkInUser(eventId: number, userId: string) {
    try {
      await $fetch(`/api/events/${eventId}/check-in`, {
        method: 'POST',
        body: { userId },
      })

      toast.add({
        title: 'Success',
        description: 'User checked in successfully',
        color: 'success',
      })

      return true
    } catch (error) {
      const errorMessage
        = (error as { data?: { message?: string } }).data?.message
          || 'Failed to check in user'

      toast.add({
        title: 'Error',
        description: errorMessage,
        color: 'error',
      })
      throw error
    }
  }

  /**
   * Remove check-in
   */
  async function removeCheckIn(eventId: number, userId: string, userName: string) {
    if (!confirm(`Remove check-in for ${userName}?`)) {
      return false
    }

    try {
      await $fetch(`/api/events/${eventId}/check-in/${userId}`, {
        method: 'DELETE',
      })

      toast.add({
        title: 'Success',
        description: 'Check-in removed successfully',
        color: 'success',
      })

      return true
    } catch (error) {
      toast.add({
        title: 'Error',
        description: 'Failed to remove check-in',
        color: 'error',
      })
      throw error
    }
  }
    
  async function checkUserAttended(eventId: number, userId: string) {
    const ev = await $fetch(`/api/events/${eventId}/attendance/user`, {
      method: 'get',
      query: {
        id: eventId,
        user_id: userId
      }
    })
      
    return ev as {
      status: boolean
      data: AttendanceData
    }
  }

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  /**
   * Format date for display
   */
  function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions) {
    const defaultOptions: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }

    return new Date(date).toLocaleString('en-US', options || defaultOptions)
  }

  /**
   * Format date with full details
   */
  function formatFullDate(date: Date | string) {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  /**
   * Get relative time
   */
  function getRelativeTime(date: Date | string) {
    return formatDistance(new Date(date), new Date(), { addSuffix: true })
  }

  /**
   * Check if event is past
   */
  function isPastEvent(event: EventData | Date | string) {
    const eventDate = event instanceof Date
      ? event
      : typeof event === 'string'
        ? new Date(event)
        : new Date(event.startTime)

    return eventDate < new Date()
  }

  /**
   * Check if event is ongoing
   */
  function isOngoingEvent(event: EventData) {
    const now = new Date()
    const start = new Date(event.startTime)
    const end = event.endTime ? new Date(event.endTime) : null

    if (!end)
      return false

    return start <= now && now <= end
  }

  /**
   * Get event status
   */
  function getEventStatus(event: EventData): EventStatus {
    if (isOngoingEvent(event))
      return 'ongoing'
    if (isPastEvent(event))
      return 'past'
    return 'upcoming'
  }

  /**
   * Get RSVP status color
   */
  function getRsvpStatusColor(status: string): 'success' | 'warning' | 'error' | 'neutral' {
    switch (status) {
      case 'attending':
        return 'success'
      case 'maybe':
        return 'warning'
      case 'not_attending':
        return 'error'
      default:
        return 'neutral'
    }
  }

  /**
   * Get RSVP status label
   */
  function getRsvpStatusLabel(status: string): string {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  // ============================================================================
  // RETURN API
  // ============================================================================

  return {
    // State
    loading,
    events,
    currentEvent,

    // Computed
    canCreateEvents,
    canEditAllEvents,
    canDeleteEvents,
    canViewAllRsvps,
    canManageCurrentEvent,

    // Fetch operations
    fetchEvents,
    fetchEventDetail,
    fetchEventRsvps,
    fetchEventAttendance,

    // Mutation operations
    createEvent,
    updateEvent,
    deleteEvent,

    // RSVP operations
    saveRsvp,
    cancelRsvp,

    // Attendance operations
    checkInUser,
    removeCheckIn,
    checkUserAttended,

    // Utilities
    formatDate,
    formatFullDate,
    getRelativeTime,
    isPastEvent,
    isOngoingEvent,
    getEventStatus,
    getRsvpStatusColor,
    getRsvpStatusLabel,
  }
}
