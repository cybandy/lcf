<script lang="ts" setup>
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard',
})

useSeoMeta({
  title: 'Events',
  description: 'View, manage, and RSVP to upcoming fellowship events and activities',
  ogTitle: 'Events - Dashboard',
  ogDescription: 'Manage church events, track RSVPs, and monitor attendance',
})

const { canCreateEvents } = useEvents()
// Active tab
const activeTab = ref('list')

// Modals
const showEditModal = ref(false)
const showCheckInModal = ref(false)

// Selected event
const selectedEvent = ref<EventData & { id?: number } | null>(null)
const selectedEventId = ref<number | null>(null)

// List ref
const eventListRef = ref<{ refresh: () => void } | null>(null)

// Open detail modal
function viewEventDetail(id: number) {
  navigateTo(`/dashboard/events/${id}`)
}

// Open edit modal
function editEvent(event: EventData & { id?: number }) {
  selectedEvent.value = event
  showEditModal.value = true
}

// Handle successful create/edit
function handleEventSuccess(_d: { id: number }) {
  if (_d && !_d.id) return

  setTimeout(() => {
    navigateTo(`/dashboard/events/${_d.id}`)
  }, 300)
}

// Open check-in modal
function openCheckIn(id: number) {
  selectedEventId.value = id
  showCheckInModal.value = true
}

// Tabs configuration
const tabs = computed(() => {
  const baseTabs = [
    { label: 'Events List', value: 'list', icon: 'i-lucide-list', slot: 'list' },
  ]

  if (canCreateEvents.value) {
    baseTabs.push({ label: 'Create Event', value: 'create', icon: 'i-lucide-plus', slot: 'create' })
  }

  return baseTabs
})
</script>

<template>
  <UDashboardPanel id="events">
    <!-- Header -->
    <template #header>
      <UDashboardNavbar
        title="Events"
        :ui="{ right: 'gap-3' }"
      >
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <!-- <template #right>
          <UTooltip
            text="Notifications"
            :shortcuts="['N']"
          >
            <UButton
              color="neutral"
              variant="ghost"
              square
              @click="isNotificationsSlideoverOpen = true"
            >
              <UChip
                color="error"
                inset
              >
                <UIcon
                  name="i-lucide-bell"
                  class="size-5 shrink-0"
                />
              </UChip>
            </UButton>
          </UTooltip>

          <UDropdownMenu :items="items">
            <UButton
              icon="i-lucide-plus"
              size="md"
              class="rounded-full"
            />
          </UDropdownMenu>
        </template> -->
      </UDashboardNavbar>
      <!-- <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold">
            Events
          </h1>
          <p class="text-muted mt-1">
            Manage church events, RSVPs, and attendance
          </p>
        </div>
      </div> -->
    </template>
    <template #body>
      <div class="space-y-6">
        <!-- Tabs -->
        <UTabs
          v-if="tabs.length > 1"
          v-model="activeTab"
          :items="tabs"
          :content="false"
        />

        <!-- Event list -->
        <DashboardEventsEventList
          v-if="activeTab==='list'"
          ref="eventListRef"
          @view="viewEventDetail"
          @edit="editEvent"
          @duplicate="editEvent"
        />

        <!-- Create Event Tab -->
        <div v-if="activeTab==='create'">
          <UPageCard
            title="Add a new event"
            description="Enter the details in the form below"
          >
            <DashboardEventsEventForm
              @success="(ev:{id:number}) => { handleEventSuccess(ev) }"
              @cancel="activeTab = 'list'"
            />
          </UPageCard>
        </div>

        <!-- Edit Event Modal -->
        <UModal
          v-model:open="showEditModal"
          title="Edit Event"
          class="max-w-2xl"
        >
          <template #content>
            <UCard>
              <template #header>
                <h3 class="text-lg font-semibold">
                  Edit Event
                </h3>
              </template>

              <DashboardEventsEventForm
                v-if="selectedEvent"
                :event-id="(selectedEvent.id)"
                :initial-data="(selectedEvent as any)"
                @success="handleEventSuccess"
                @cancel="showEditModal = false"
              />
            </UCard>
          </template>
        </UModal>

        <!-- Check-In Modal -->
        <UModal
          v-model:open="showCheckInModal"
          title="Event Check-In"
          class="max-w-2xl"
        >
          <template #content>
            <UCard>
              <template #header>
                <div class="flex items-center justify-between">
                  <h3 class="text-lg font-semibold">
                    Event Check-In
                  </h3>
                  <UButton
                    icon="i-lucide-x"
                    color="neutral"
                    variant="ghost"
                    @click="showCheckInModal = false"
                  />
                </div>
              </template>

              <DashboardEventsEventCheckIn
                v-if="selectedEventId"
                :event-id="selectedEventId"
              />
            </UCard>
          </template>
        </UModal>
      </div>
    </template>
  </UDashboardPanel>
</template>
