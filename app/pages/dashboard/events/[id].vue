<script setup lang='ts'>
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard',
})

const id = computed(() => Number(useRoute().params.id))
const permissions = usePermissions()
const loading = ref(false)
const toast = useToast()
// data fetching
const { data, execute: fetchData, } = useFetch(`/api/events/${id.value}`, {
  method: 'get',
  key: `e-${id.value}`,
  onRequest() {
    loading.value = true
  },
  onResponse({ response }) {
    loading.value = false
    if (!response.ok) {
      toast.add({
        title: 'Oops!!!',
        description: 'Failed to load event',
        color: 'error',
      })
    }
  }
})
// permissions
const canViewAllRsvp = computed(() => permissions.isOwnerOrAdminOrPastorCheck(data.value?.event.creatorId))
// menu
const current_menu = ref<'view' | 'edit' | 'all'>('view')
const menu = [
  {
    label: 'View',
    icon: 'i-lucide-eye',
    onSelect: () => {
      if (current_menu.value === 'view') return
      current_menu.value = 'view'
    }
  },
]

// menus to include based on your permissions
onMounted(() => {
  if (permissions.can(permissions.FellowshipPermission.EDIT_ALL_EVENTS)) {
    menu.push(
      {
        label: 'Edit',
        icon: 'i-lucide-pencil',
        onSelect: () => {
          if (current_menu.value === 'edit') return
          current_menu.value = 'edit'
        },
      },
    )
  }

  if (canViewAllRsvp.value) {
    menu.push(
      {
        label: 'All reservations',
        icon: 'i-lucide-users',
        onSelect: () => {
          if (current_menu.value === 'all') return
          current_menu.value = 'all'
        },
      },
    )
  }
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
          <UDropdownMenu
            v-if="permissions.can(permissions.FellowshipPermission.EDIT_ALL_EVENTS) || permissions.can(permissions.FellowshipPermission.DELETE_EVENTS)"
            :items="[[
              ...(permissions.can(permissions.FellowshipPermission.EDIT_ALL_EVENTS) ? [{
                label: 'Edit Event',
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
        </template>
      </u-dashboard-navbar>

      <u-dashboard-toolbar v-if="menu.length>1">
        <template #left>
          <u-navigation-menu :items="menu" />
        </template>
      </u-dashboard-toolbar>
    </template>

    <template #body>
      <Motion
        v-if="current_menu==='view'"
        :initial="{ opacity: 0, scale: 1.2 }"
        :animate="{ opacity: 1, scale: 1 }"
        :transition="{
          duration: 0.4,
          scale: { type: 'spring', visualDuration: 0.4, bounce: 0.5 }
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

        <!-- general information -->
        <u-page-card
          v-if="data"
          :title="data.event.title"
          :description="data.event.description || undefined"
          :ui="{
            title: 'text-xl sm:text-2xl'
          }"
        >
          <div class="flex-1 gap-1.5">
            <u-button
              variant="ghost"
              color="neutral"
              icon="i-lucide-calendar"
              :label="data.event.startTime"
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
              :name="data.event.creator.firstName + ' ' + data.event.creator.lastName"
              :avatar="{ src: data.event.creator.avatar || undefined, alt: `${data.event.creator.firstName} ${data.event.creator.lastName}` }"
            />
          </div>
        </u-page-card>

        <u-page-card
          v-if="data"
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
        
        <!-- <dashboard-events-event-detail
          :event-id="id"
          @fetch="fetchData"
        /> -->
      </Motion>
      <Motion
        v-else-if="current_menu==='edit'"
        :initial="{ opacity: 0, scale: 0 }"
        :animate="{ opacity: 1, scale: 1 }"
        :transition="{
          duration: 0.4,
          scale: { type: 'spring', visualDuration: 0.4, bounce: 0.5 }
        }"
      >
        // edit
      </Motion>
      <Motion
        v-else-if="current_menu==='all'"
        :initial="{ opacity: 0, scale: 0 }"
        :animate="{ opacity: 1, scale: 1 }"
        :transition="{
          duration: 0.4,
          scale: { type: 'spring', visualDuration: 0.4, bounce: 0.5 }
        }"
        class="space-y-8"
      >
        <u-page-card
          v-if="data?.rsvpCounts"
          title="Reservations"
          description="All event reservations"
          :ui="{
            title: 'text-xl sm:text-2xl'
          }"
        >
          <dashboard-events-all-rsvp :id="id" />
        </u-page-card>
      </Motion>
    </template>
  </u-dashboard-panel>
</template>
