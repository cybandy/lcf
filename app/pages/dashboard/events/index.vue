<script lang="ts" setup>
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard',
})

const permissions = usePermissions()
const toast = useToast()
const route = useRoute()
const router = useRouter()

// Active tab
const activeTab = ref('list')

// Modals
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDetailModal = ref(false)
const showCheckInModal = ref(false)

// Selected event
const selectedEvent = ref<Record<string, unknown> | null>(null)
const selectedEventId = ref<number | null>(null)

// List ref
const eventListRef = ref<{ refresh: () => void } | null>(null)

// Open detail modal
function viewEventDetail(id: number) {
  // selectedEventId.value = id
  // showDetailModal.value = true
  navigateTo(`/dashboard/events/${id}`)
}

// Open edit modal
function editEvent(event: unknown) {
  selectedEvent.value = event as Record<string, unknown>
  showEditModal.value = true
}

// Delete event
async function deleteEvent(id: number) {
  if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
    return
  }

  try {
    await $fetch(`/api/events/${id}`, {
      method: 'DELETE',
    })

    toast.add({
      title: 'Success',
      description: 'Event deleted successfully',
      color: 'success',
    })

    // Refresh list
    eventListRef.value?.refresh()
    showDetailModal.value = false
  } catch (error) {
    const errorMessage = (error as { data?: { message?: string } }).data?.message
      || 'Failed to delete event'

    toast.add({
      title: 'Error',
      description: errorMessage,
      color: 'error',
    })
  }
}

// Handle successful create/edit
function handleEventSuccess(_d: { id: number }) {
  if (_d && !_d.id) return

  setTimeout(() => {
    navigateTo(`/dashboard/events/${_d.id}`)
  }, 300)
}

// Handle edit from detail modal
function handleEditFromDetail() {
  showDetailModal.value = false
  selectedEvent.value = null
  // Fetch full event data for editing
  if (selectedEventId.value) {
    $fetch(`/api/events/${selectedEventId.value}`)
      .then((response: { event: Record<string, unknown> }) => {
        selectedEvent.value = response.event
        showEditModal.value = true
      })
      .catch(() => {
        toast.add({
          title: 'Error',
          description: 'Failed to load event for editing',
          color: 'error',
        })
      })
  }
}

// Handle delete from detail modal
function handleDeleteFromDetail() {
  if (selectedEventId.value) {
    deleteEvent(selectedEventId.value)
  }
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

  if (permissions.can(permissions.FellowshipPermission.CREATE_EVENTS)) {
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
          v-model="activeTab"
          :items="tabs"
        >
          <!-- Events List Tab -->
          <template #list>
            <DashboardEventsEventList
              ref="eventListRef"
              @view="viewEventDetail"
              @edit="editEvent"
              @delete="deleteEvent"
            />
          </template>

          <!-- Create Event Tab -->
          <template #create>
            <UPageCard
              title="Add a new event"
              description="Enter the details in the form below"
            >
              <DashboardEventsEventForm
                @success="(ev:{id:number}) => { handleEventSuccess(ev) }"
                @cancel="activeTab = 'list'"
              />
            </UPageCard>
          </template>
        </UTabs>

        <!-- Event Detail Modal -->
        <!-- <UModal
          v-model:open="showDetailModal"
          class="max-w-3xl"
        >
          <template #content>
            <UCard>
              <template #header>
                <div class="flex items-center justify-between">
                  <h3 class="text-lg font-semibold">
                    Event Details
                  </h3>
                  <div class="flex gap-2">
                    <UButton
                      v-if="permissions.can(permissions.FellowshipPermission.VIEW_USERS)"
                      icon="i-lucide-clipboard-check"
                      color="primary"
                      variant="ghost"
                      @click="selectedEventId && openCheckIn(selectedEventId)"
                    >
                      Check-In
                    </UButton>
                    <UButton
                      icon="i-lucide-x"
                      color="neutral"
                      variant="ghost"
                      @click="showDetailModal = false"
                    />
                  </div>
                </div>
              </template>

              <DashboardEventsEventDetail
                v-if="selectedEventId"
                :event-id="selectedEventId"
                @edit="handleEditFromDetail"
                @delete="handleDeleteFromDetail"
                @close="showDetailModal = false"
              />
            </UCard>
          </template>
        </UModal> -->

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
                :event-id="(selectedEvent.id as number)"
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
