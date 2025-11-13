<!-- eslint-disable @typescript-eslint/no-explicit-any -->
<script setup lang="ts">
interface Props {
  eventId: number
}

const props = defineProps<Props>()

const permissions = usePermissions()
const toast = useToast()
const loading = ref(false)
const searchQuery = ref('')
const attendance = ref<any[]>([])
const searchResults = ref<any[]>([])
const searching = ref(false)

// Fetch attendance list
async function fetchAttendance() {
  loading.value = true
  try {
    const response = await $fetch(`/api/events/${props.eventId}/attendance`)
    attendance.value = response.attendance
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to fetch attendance',
      color: 'error',
    })
  } finally {
    loading.value = false
  }
}

// Search users for check-in
async function searchUsers() {
  if (!searchQuery.value || searchQuery.value.length < 2) {
    searchResults.value = []
    return
  }

  searching.value = true
  try {
    const response = await $fetch('/api/admin/users', {
      query: {
        search: searchQuery.value,
      },
    })
    // Filter out already checked-in users
    const checkedInIds = new Set(attendance.value.map(a => a.userId))
    searchResults.value = response.users.filter((u: any) => !checkedInIds.has(u.id))
  } catch (error) {
    console.error('Search error:', error)
  } finally {
    searching.value = false
  }
}

// Debounce search
const debouncedSearch = useDebounceFn(searchUsers, 300)

watch(searchQuery, () => {
  debouncedSearch()
})

// Check in a user
async function checkIn(userId: string) {
  try {
    await $fetch(`/api/events/${props.eventId}/check-in`, {
      method: 'POST',
      body: { userId },
    })

    toast.add({
      title: 'Success',
      description: 'User checked in successfully',
      color: 'success',
    })

    searchQuery.value = ''
    searchResults.value = []
    fetchAttendance()
  } catch (error) {
    const errorMessage = (error as { data?: { message?: string } }).data?.message
      || 'Failed to check in user'

    toast.add({
      title: 'Error',
      description: errorMessage,
      color: 'error',
    })
  }
}

// Remove check-in
async function removeCheckIn(userId: string, userName: string) {
  if (!confirm(`Remove check-in for ${userName}?`)) return

  try {
    await $fetch(`/api/events/${props.eventId}/check-in/${userId}`, {
      method: 'DELETE',
    })

    toast.add({
      title: 'Success',
      description: 'Check-in removed successfully',
      color: 'success',
    })

    fetchAttendance()
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to remove check-in',
      color: 'error',
    })
  }
}

// Format check-in time
function formatTime(date: Date) {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

onMounted(() => {
  fetchAttendance()
})
</script>

<template>
  <div class="space-y-4">
    <!-- Check if user has permission -->
    <div
      v-if="!permissions.can(permissions.FellowshipPermission.VIEW_USERS)"
      class="text-center py-8"
    >
      <div class="i-lucide-lock text-4xl text-muted mx-auto mb-2" />
      <p class="text-muted">
        You don't have permission to manage attendance
      </p>
    </div>

    <template v-else>
      <!-- Search Bar -->
      <div class="relative">
        <UInput
          v-model="searchQuery"
          placeholder="Search members to check in..."
          icon="i-lucide-search"
          :loading="searching"
        />

        <!-- Search Results Dropdown -->
        <div
          v-if="searchResults.length > 0"
          class="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg max-h-64 overflow-y-auto"
        >
          <button
            v-for="user in searchResults"
            :key="user.id"
            class="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
            @click="checkIn(user.id)"
          >
            <img
              v-if="user.avatar"
              :src="user.avatar"
              :alt="`${user.firstName} ${user.lastName}`"
              class="w-8 h-8 rounded-full"
            >
            <div
              v-else
              class="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-medium"
            >
              {{ user.firstName.charAt(0) }}
            </div>
            <div class="flex-1">
              <div class="font-medium">
                {{ user.firstName }} {{ user.lastName }}
              </div>
              <div class="text-sm text-muted">
                {{ user.email }}
              </div>
            </div>
            <div class="i-lucide-user-plus text-primary" />
          </button>
        </div>
      </div>

      <!-- Stats -->
      <div class="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div class="flex items-center gap-2">
          <div class="i-lucide-users text-xl" />
          <span class="font-medium">Total Checked In:</span>
          <span class="text-2xl font-bold text-primary">
            {{ attendance.length }}
          </span>
        </div>
        <UButton
          icon="i-lucide-refresh-cw"
          color="neutral"
          variant="ghost"
          :loading="loading"
          @click="fetchAttendance"
        >
          Refresh
        </UButton>
      </div>

      <!-- Attendance List -->
      <div
        v-if="loading"
        class="flex items-center justify-center py-12"
      >
        <div class="i-lucide-loader-circle animate-spin text-3xl text-primary" />
      </div>

      <div
        v-else-if="attendance.length === 0"
        class="text-center py-12"
      >
        <div class="i-lucide-clipboard-list text-4xl text-muted mx-auto mb-2" />
        <p class="text-muted">
          No attendees checked in yet
        </p>
      </div>

      <div
        v-else
        class="space-y-2"
      >
        <div
          v-for="record in attendance"
          :key="record.userId"
          class="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <img
            v-if="record.user?.avatar"
            :src="record.user.avatar"
            :alt="`${record.user.firstName} ${record.user.lastName}`"
            class="w-10 h-10 rounded-full"
          >
          <div
            v-else
            class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-medium"
          >
            {{ record.user?.firstName?.charAt(0) || '?' }}
          </div>
          <div class="flex-1">
            <div class="font-medium">
              {{ record.user?.firstName }} {{ record.user?.lastName }}
            </div>
            <div class="text-sm text-muted">
              Checked in at {{ formatTime(record.checkInTime) }}
            </div>
          </div>
          <UBadge
            :color="record.user?.status === 'active' ? 'success' : 'neutral'"
            variant="subtle"
          >
            {{ record.user?.status }}
          </UBadge>
          <UButton
            icon="i-lucide-x"
            color="error"
            variant="ghost"
            size="sm"
            @click="removeCheckIn(record.userId, `${record.user?.firstName} ${record.user?.lastName}`)"
          />
        </div>
      </div>
    </template>
  </div>
</template>
