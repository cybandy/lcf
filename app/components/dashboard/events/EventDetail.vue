<script setup lang="ts">
import { formatDistance } from 'date-fns'

interface Props {
  eventId: number
  loading?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  edit: []
  delete: []
  close: []
  fetch: []
}>()

const permissions = usePermissions()
const toast = useToast()
// const loading = ref(false)
const showRsvpDialog = ref(false)
 
// const event = ref<any>(null)
const event = computed(() => useNuxtData(`e-${props.eventId}`).data.value)

// Fetch event details
// async function fetchEvent() {
//   loading.value = true
//   try {
//     const response = await $fetch(`/api/events/${props.eventId}`)
//     event.value = response
//   } catch (error) {
//     toast.add({
//       title: 'Error',
//       description: 'Failed to fetch event details',
//       color: 'error',
//     })
//   } finally {
//     loading.value = false
//   }
// }

// onMounted(() => {
//   fetchEvent()
// })

function formatDate(date: Date) {
  return new Date(date).toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function getRelativeTime(date: Date) {
  return formatDistance(new Date(date), new Date(), { addSuffix: true })
}

function isPast() {
  return event.value && new Date(event.value.event.startTime) < new Date()
}

function getRsvpStatusColor(status: string) {
  switch (status) {
    case 'attending': return 'success'
    case 'maybe': return 'warning'
    case 'not_attending': return 'error'
    default: return 'neutral'
  }
}

function handleRsvpSuccess() {
  showRsvpDialog.value = false
  emit('fetch')
}
</script>

<template>
  <div
    v-if="loading"
    class="flex items-center justify-center py-12"
  >
    <div class="i-lucide-loader-circle animate-spin text-3xl text-primary" />
  </div>

  <div
    v-else-if="event"
    class="space-y-6"
  >
    <!-- Header -->
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <h2 class="text-2xl font-bold mb-2">
          {{ event.event.title }}
        </h2>
        <div class="flex items-center gap-4 text-muted">
          <div class="flex items-center gap-1">
            <div class="i-lucide-calendar" />
            <span>{{ formatDate(event.event.startTime) }}</span>
          </div>
          <div
            v-if="event.event.location"
            class="flex items-center gap-1"
          >
            <div class="i-lucide-map-pin" />
            <span>{{ event.event.location }}</span>
          </div>
        </div>
      </div>

      <UDropdownMenu
        v-if="permissions.can(permissions.FellowshipPermission.EDIT_ALL_EVENTS) || permissions.can(permissions.FellowshipPermission.DELETE_EVENTS)"
        :items="[[
          ...(permissions.can(permissions.FellowshipPermission.EDIT_ALL_EVENTS) ? [{
            label: 'Edit Event',
            icon: 'i-lucide-pencil',
            onSelect: () => emit('edit')
          }] : []),
          ...(permissions.can(permissions.FellowshipPermission.DELETE_EVENTS) ? [{
            label: 'Delete Event',
            icon: 'i-lucide-trash-2',
            color: 'error' as const,
            onSelect: () => emit('delete')
          }] : [])
        ]]"
      >
        <UButton
          icon="i-lucide-ellipsis-vertical"
          color="neutral"
          variant="ghost"
        />
      </UDropdownMenu>
    </div>

    <!-- Description -->
    <div
      v-if="event.event.description"
      class="prose dark:prose-invert max-w-none"
    >
      <p>{{ event.event.description }}</p>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <UCard>
        <div class="flex items-center gap-3">
          <div class="p-2 bg-success/10 rounded-lg">
            <UIcon
              name="i-lucide-check-circle"
              class="size-5 text-warning"
            />
          </div>
          <div>
            <div class="text-2xl font-bold">
              {{ event.rsvpCounts.attending?.count || 0 }}
            </div>
            <div class="text-sm text-muted">
              Attending
              <span v-if="event.rsvpCounts.attending?.totalGuests">
                (+{{ event.rsvpCounts.attending.totalGuests }} guests)
              </span>
            </div>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center gap-3">
          <div class="p-2 bg-warning/10 rounded-lg">
            <UIcon
              name="i-lucide-help-circle"
              class="size-5 text-warning"
            />
          </div>
          <div>
            <div class="text-2xl font-bold">
              {{ event.rsvpCounts.maybe?.count || 0 }}
            </div>
            <div class="text-sm text-muted">
              Maybe
            </div>
          </div>
        </div>
      </UCard>

      <UCard>
        <div class="flex items-center gap-3">
          <div class="p-2 bg-primary/10 rounded-lg">
            <UIcon
              name="i-lucide-users"
              class="size-5 text-primary"
            />
          </div>
          <div>
            <div class="text-2xl font-bold">
              {{ event.attendanceCount }}
            </div>
            <div class="text-sm text-muted">
              Checked In
            </div>
          </div>
        </div>
      </UCard>
    </div>

    <!-- User RSVP Status -->
    <UCard>
      <div class="flex items-center justify-between">
        <div>
          <div class="font-medium mb-1">
            Your RSVP
          </div>
          <div
            v-if="event.userRsvp"
            class="flex items-center gap-2"
          >
            <UBadge :color="getRsvpStatusColor(event.userRsvp.status)">
              {{ event.userRsvp.status.replace('_', ' ') }}
            </UBadge>
            <span
              v-if="event.userRsvp.guestCount > 0"
              class="text-sm text-muted"
            >
              +{{ event.userRsvp.guestCount }} {{ event.userRsvp.guestCount === 1 ? 'guest' : 'guests' }}
            </span>
          </div>
          <div
            v-else
            class="text-muted"
          >
            You haven't RSVP'd yet
          </div>
        </div>
        <UButton
          v-if="!isPast()"
          @click="showRsvpDialog = true"
        >
          {{ event.userRsvp ? 'Update RSVP' : 'RSVP Now' }}
        </UButton>
      </div>
    </UCard>

    <!-- Creator Info -->
    <div
      v-if="event.event.creator"
      class="flex items-center gap-3 text-sm text-muted"
    >
      <span>Created by</span>
      <div class="flex items-center gap-2">
        <img
          v-if="event.event.creator.avatar"
          :src="event.event.creator.avatar"
          :alt="`${event.event.creator.firstName} ${event.event.creator.lastName}`"
          class="w-6 h-6 rounded-full"
        >
        <div
          v-else
          class="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium"
        >
          {{ event.event.creator.firstName.charAt(0) }}
        </div>
        <span>{{ event.event.creator.firstName }} {{ event.event.creator.lastName }}</span>
      </div>
      <span>{{ getRelativeTime(event.event.createdAt) }}</span>
    </div>

    <!-- RSVP Dialog -->
    <UModal v-model="showRsvpDialog">
      <UCard>
        <template #header>
          <h3 class="text-lg font-semibold">
            RSVP for {{ event.event.title }}
          </h3>
        </template>

        <DashboardEventsEventRsvp
          :event-id="eventId"
          :initial-status="event.userRsvp?.status"
          :initial-guest-count="event.userRsvp?.guestCount"
          @success="handleRsvpSuccess"
          @cancel="showRsvpDialog = false"
        />
      </UCard>
    </UModal>
  </div>
</template>
