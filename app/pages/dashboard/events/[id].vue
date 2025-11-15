<script setup lang='ts'>
import type { EventStat } from '~/components/dashboard/events/Stats.vue'
import type { NavigationMenuItem } from '@nuxt/ui'
import type { DashboardEventForm } from '~/components/dashboard/events/EventForm.vue'

definePageMeta({
  middleware: 'auth',
  layout: 'dashboard',
})

const id = computed(() => Number(useRoute().params.id))
if (!id.value) {
  navigateTo('/dashboard/events')
}
const events = useEvents()
const { user } = useMyUserSession()
const permissions = usePermissions()
const data = ref<EventDetail>()
const editData = ref<DashboardEventForm>()

const pastData = ref({
  attendance: {

  }
} as {
  attendance: {
    status: boolean
    data?: AttendanceData
  }
})

// data fetching
const { execute: fetchData } = await useAsyncData(`ev-${id.value}`, async () => {
  const _d = await events.fetchEventDetail(id.value)
  if (_d) {
    data.value = _d

    // check past data status
    if (events.isPastEvent(_d.event)) {
      const _at = await events.checkUserAttended(id.value, user.value.id)
      pastData.value.attendance = _at

      // data for editing: since it is a past event, this will just be re-copying the details for a new event.
      editData.value = {
        // eventId: id.value,
        initialData: {
          title: _d.event.title,
          description: _d.event.description,
          startTime: new Date(),
          // endTime: new Date(_d.event.endTime!),
          location: _d.event.location,
        }
      }
      return {
        data: _d,
        pastData: {
          attendance: _at
        }
      }
    }
  }

  // data for editing
  editData.value = {
    eventId: id.value,
    initialData: {
      title: _d.event.title,
      description: _d.event.description,
      startTime: new Date(_d.event.startTime),
      endTime: new Date(_d.event.endTime!),
      location: _d.event.location,
    }
  }
  return _d
}, {
  immediate: false,
  server: false
})
onBeforeMount(async () => {
  await fetchData()
})

// permissions
const canViewAllRsvp = events.canViewAllRsvps
// menu
const current_menu = ref<'view' | 'edit' | 'all'>('view')

const menu = computed(() => {
  if (!data.value) return []
  const _m: NavigationMenuItem[] = [
    {
      label: 'View',
      icon: 'i-lucide-eye',
      active: current_menu.value === 'view',
      onSelect: () => {
        if (current_menu.value === 'view') return
        current_menu.value = 'view'
      }
    },
  ]

  if (events.canEditAllEvents.value) {
    _m.push(
      {
        label: events.isPastEvent(data.value.event) ? 'Duplicate' : 'Edit',
        icon: events.isPastEvent(data.value.event) ? 'i-lucide-copy' : 'i-lucide-pencil',
        active: current_menu.value === 'edit',
        onSelect: () => {
          if (current_menu.value === 'edit') return
          current_menu.value = 'edit'
        },
      },
    )
  }

  if (canViewAllRsvp.value) {
    _m.push(
      {
        label: 'All reservations',
        icon: 'i-lucide-users',
        active: current_menu.value === 'all',
        onSelect: () => {
          // if (current_menu.value === 'all') return
          current_menu.value = 'all'
        },
      },
    )
  }

  return _m
})

// stats
const stats = computed(() => [
  {
    title: 'Attending',
    icon: 'i-lucide-check-circle',
    value: data.value?.rsvpCounts.attending?.count || 0,
    color: 'bg-secondary/10 ring ring-secondary/25',
    guests: data.value?.rsvpCounts.attending?.totalGuests || undefined,
    iconColor: 'text-secondary' as const
  },
  {
    title: 'Maybe',
    icon: 'i-lucide-help-circle',
    value: data.value?.rsvpCounts.maybe?.count || 0,
    color: 'bg-warning/10 ring ring-warning/25',
    guests: data.value?.rsvpCounts.maybe?.totalGuests || undefined,
    iconColor: 'text-warning' as const
  },
  {
    title: 'Not Attending',
    icon: 'i-lucide-help-circle',
    value: data.value?.rsvpCounts.not_attending?.count || 0,
    color: 'bg-error/10 ring ring-error/25',
    guests: undefined,
    iconColor: 'text-error' as const
  },
  {
    title: 'Checked In',
    icon: 'i-lucide-users',
    value: data.value?.attendanceCount || 0,
    color: 'bg-success/10 ring ring-success/25',
    guests: undefined,
    iconColor: 'text-success' as const
  },
])

function formatDate(date: string) {
  return new Date(date).toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

// call delete
const deleteOpen = ref(false)
const onDeleteEvent = async () => {
  try {
    await events.deleteEvent(id.value)
    cancelDelete()
    setTimeout(() => { 
      navigateTo('/dashboard/events')
    }, 1000)
  } catch (error) {
    //
  }
}

function cancelDelete() {
  //
  deleteOpen.value = !deleteOpen.value
}
</script>

<template>
  <u-dashboard-panel :id="`e-${id}`">
    <template #header>
      <u-dashboard-navbar :title="data?.event.title">
        <template #leading>
          <u-dashboard-sidebar-collapse />
        </template>
        <template #right>
          <UButton
            v-if="permissions.can(permissions.FellowshipPermission.VIEW_USERS)"
            icon="i-lucide-clipboard-check"
            color="primary"
            variant="ghost"
            label="Check-In"
          />
          <ClientOnly>
            <UDropdownMenu
              v-if="permissions.can(permissions.FellowshipPermission.EDIT_ALL_EVENTS) || permissions.can(permissions.FellowshipPermission.DELETE_EVENTS)"
              :items="[[
                ...(permissions.can(permissions.FellowshipPermission.EDIT_ALL_EVENTS) ? [{
                  label: 'Edit',
                  icon: 'i-lucide-pencil',
                  onSelect: () => {
                    current_menu = 'edit'
                  }
                }] : []),
                ...(permissions.can(permissions.FellowshipPermission.DELETE_EVENTS) ? [{
                  label: 'Delete Event',
                  icon: 'i-lucide-trash-2',
                  color: 'error' as const,
                  onSelect: () => {
                    deleteOpen = true
                  }
                }] : [])
              ]]"
            >
              <UButton
                icon="i-lucide-ellipsis-vertical"
                color="neutral"
                variant="ghost"
              />
            </UDropdownMenu>
          </ClientOnly>
        </template>
      </u-dashboard-navbar>

      <u-dashboard-toolbar v-if="menu.length>1">
        <template #left>
          <u-navigation-menu
            :items="menu"
            highlight
          />
        </template>
      </u-dashboard-toolbar>
    </template>

    <template #body>
      <div v-if="data">
        <Motion
          v-if="current_menu==='view'"
          :initial="{ opacity: 0, scale: 0.9, filter: 'blur(20px)' }"
          :animate="{ opacity: 1, scale: 1, filter: 'blur(0px)' }"
          :transition="{
            duration: 0.2,
            ease: ['easeInOut']
          }"
          class="space-y-8"
        >
          <!-- Stats Card -->
          <u-page-grid class="lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-px">
            <u-page-card
              v-for="(stat, ind) of stats"
              :key="ind"
              :title="stat.title"
              :icon="stat.icon"
              variant="subtle"
              orientation="horizontal"
              :ui="{
                container: 'gap-y-1.5',
                wrapper: 'items-start',
                leading: ['p-2.5 rounded-full ring ring-inset flex-col', stat.color].join(' '),
                title: 'font-normal text-muted text-xs uppercase',
                leadingIcon: stat.iconColor
              }"
              class="lg:rounded-none first:rounded-l-lg last:rounded-r-lg hover:z-1"
            >
              <div class="flex flex-col items-center gap-2">
                <span class="text-2xl font-semibold text-highlighted">
                  {{ stat.value }}
                </span>

              <!-- <UBadge
                v-if="stat.guests"
                :color="'neutral'"
                variant="subtle"
                size="xs"
                class="text-xs shrink"
              >
                Guest: #{{ stat.guests }}
              </UBadge> -->
              </div>
            </u-page-card>
          </u-page-grid>
          <!-- <DashboardEventsStats
            v-if="stats"
            :stat="stats"
          /> -->

          <!-- general information -->
          <u-page-card
            v-if="data.event"
            :title="data.event.title"
            :description="data.event.description || undefined"
            :ui="{
              title: 'text-xl sm:text-2xl'
            }"
          >
            <template #title>
              <div class="flex items-center gap-1.5">
                <p>{{ data.event.title }}</p>
                <UBadge
                  size="sm"
                  variant="subtle"
                  :label="events.isPastEvent(data.event) ? 'Past': (events.isOngoingEvent(data.event) ? 'Ongoing' : 'Incoming')"
                  :color="events.isPastEvent(data.event) ? 'error': (events.isOngoingEvent(data.event) ? 'success' : 'secondary')"
                />
              </div>
            </template>
            <div class="flex-1 gap-1.5">
              <u-button
                variant="ghost"
                color="neutral"
                icon="i-lucide-calendar"
                :label="formatDate(data.event.startTime)"
              />
              <u-button
                v-if="data.event.location"
                variant="ghost"
                color="neutral"
                icon="i-lucide-map"
                :label="data.event.location"
              />
            </div>

            <div class="mt-4 flex items-center gap-1">
              <span class="text-dimmed">
                Created by: 
              </span>

              <u-user
                :name="data.event.creator?.firstName + ' ' + data.event.creator?.lastName"
                :avatar="{ src: data.event.creator?.avatar || undefined, alt: `${data.event.creator?.firstName} ${data.event.creator?.lastName}` }"
              />
            </div>
          </u-page-card>

          <u-page-card
            v-if="data && !events.isPastEvent(data.event)"
            title="My reservation"
            :ui="{
              title: 'text-xl sm:text-2xl'
            }"
          >
            <DashboardEventsEventRsvp
              :event-id="id"
              :initial-status="data.userRsvp?.status"
              :initial-guest-count="data.userRsvp?.guestCount"
              @cancel="fetchData"
              @success="fetchData"
            />
          </u-page-card>

          <u-page-card
            v-else-if="pastData.attendance && events.isPastEvent(data.event)"
            :title="pastData.attendance.status ? 'Thank you for attending' : 'You couldn\'t make it'"
            :ui="{
              title: ' text-xl'
            }"
          >
            <div
              v-if="!pastData.attendance.status"
              class="space-y-2"
            >
              <p class="text-dimmed">
                We hope to see you in our upcoming events
              </p>
              <UButton
                to="/dashboard/events"
                label="Go to Events"
                color="neutral"
              />
            </div>

            <div
              v-else-if="pastData.attendance.data"
              class="space-y-2"
            >
              <UAvatar
                :src="user.avatar || undefined"
                :alt="`${user.firstName} ${user.lastName}`.trim()"
                class="size-20"
              />
              <p class="text-base">
                {{ user.firstName }} {{ user.lastName }}
              </p>

              <div class="flex items-center gap-0.5 text-muted">
                <span>You checked in on</span>
                <u-button
                  variant="ghost"
                  color="neutral"
                  icon="i-lucide-calendar"
                  :label="events.formatDate(pastData.attendance.data.checkInTime)"
                  :ui="{ label: 'text-muted' }"
                />
                <span>at the venue</span>
                <u-button
                  v-if="data.event.location"
                  variant="ghost"
                  color="neutral"
                  icon="i-lucide-map"
                  :label="data.event.location"
                  :ui="{ label: 'text-muted' }"
                />
              </div>
            
              <p class="text-dimmed">
                It was an exciting time in the presence of the LORD and we hope you enjoyed it. We have a few events coming up soon check them out.
              </p>
              <UButton
                to="/dashboard/events"
                label="Go to Events"
                color="neutral"
              />
            </div>
          </u-page-card>
        
        <!-- <dashboard-events-event-detail
          :event-id="id"
          @fetch="fetchData"
        /> -->
        </Motion>
        <Motion
          v-else-if="current_menu==='edit'"
          :initial="{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }"
          :animate="{ opacity: 1, scale: 1, filter: 'blur(0px)' }"
          :transition="{
            duration: 0.2,
            ease: ['easeInOut']
          }"
        >
          <UPageCard
            title="Edit event"
            description="Enter the details in the form below"
          >
            <DashboardEventsEventForm
              v-bind="editData"
              @success="() => {
                fetchData()
                current_menu = 'view'
              }"
            />
          </UPageCard>
        </Motion>
        <Motion
          v-else-if="current_menu==='all'"
          :initial="{ opacity: 0, scale: 0.9, filter: 'blur(20px)' }"
          :animate="{ opacity: 1, scale: 1, filter: 'blur(0px)' }"
          :transition="{
            duration: 0.2,
            ease: ['easeInOut']
          }"
          class="space-y-8"
        >
          <!-- <u-page-card
            v-if="data?.rsvpCounts"
            title="Reservations"
            description="All event reservations"
            :ui="{
              title: 'text-xl sm:text-2xl'
            }"
          > -->
          <dashboard-events-all-rsvp
            v-if="data.rsvpCounts"
            :id="id"
          />
          <!-- </u-page-card> -->
        </Motion>
      </div>
      <div v-else>
      </div>
      <ConfirmDialog
        v-bind="{
          title: 'Delete Event',
          open: deleteOpen,
          description: 'Note that all information related to the event will be deleted completely. This action is irreversible',
          confirmColor: 'error',
          confirmText: 'Delete' }"
        @cancel="cancelDelete"
        @confirm="onDeleteEvent"
      >
        <div class="space-y-1 5 text-center">
          <p class="text-highlighted text-lg">
            {{ data?.event.title }}
          </p>
          <p
            v-if="data?.event.description"
            class="text-sm text-muted"
          >
            {{ data.event.description }}
          </p>
        </div>
      </ConfirmDialog>
    </template>
  </u-dashboard-panel>
</template>
