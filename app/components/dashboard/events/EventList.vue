<script setup lang="ts">
import { h } from 'vue'
import type { TableColumn, TableRow, DropdownMenuItem } from '@nuxt/ui'
import { formatDistance } from 'date-fns'

interface EventData {
  id: number
  title: string
  description?: string | null
  startTime: Date
  endTime?: Date | null
  location?: string | null
  creatorId?: string | null
  creator?: {
    id: string
    firstName: string
    lastName: string
    avatar?: string | null
  } | null
}

const emit = defineEmits<{
  view: [id: number]
  edit: [event: EventData]
  delete: [id: number]
}>()

const permissions = usePermissions()
const toast = useToast()
const loading = ref(false)
const events = ref<EventData[]>([])
const filterUpcoming = ref(true)

// Fetch events
async function fetchEvents() {
  loading.value = true
  try {
    const response = await $fetch<{ events: EventData[], total: number }>('/api/events', {
      query: {
        upcoming: filterUpcoming.value ? 'true' : undefined,
        past: !filterUpcoming.value ? 'true' : undefined,
      },
    })
    events.value = response.events
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to fetch events',
      color: 'error',
    })
  } finally {
    loading.value = false
  }
}

// Initial fetch
onMounted(() => {
  fetchEvents()
})

// Watch filter changes
watch(filterUpcoming, () => {
  fetchEvents()
})

// Format date for display
function formatDate(date: Date) {
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

// Get relative time
function getRelativeTime(date: Date) {
  return formatDistance(new Date(date), new Date(), { addSuffix: true })
}

// Check if event is past
function isPastEvent(event: EventData) {
  return new Date(event.startTime) < new Date()
}

// Table columns
const columns = computed<TableColumn<EventData>[]>(() => [
  {
    accessorKey: 'title',
    header: 'Event',
    cell: ({ row }) => {
      const event = row.original
      return h('div', { class: 'flex flex-col gap-1' }, [
        h('div', { class: 'font-medium' }, event.title),
        event.location
          ? h('div', { class: 'text-sm text-muted flex items-center gap-1' }, [
              h('span', { class: 'i-lucide-map-pin', style: 'width: 14px; height: 14px;' }),
              event.location,
            ])
          : null,
      ])
    },
  },
  {
    accessorKey: 'startTime',
    header: 'Start Time',
    cell: ({ row }) => {
      const event = row.original
      return h('div', { class: 'flex flex-col gap-1' }, [
        h('div', {}, formatDate(event.startTime)),
        h('div', {
          class: isPastEvent(event) ? 'text-sm text-muted' : 'text-sm text-primary',
        }, getRelativeTime(event.startTime)),
      ])
    },
  },
  {
    accessorKey: 'creator',
    header: 'Created By',
    cell: ({ row }) => {
      const creator = row.original.creator
      if (!creator) return h('span', { class: 'text-muted' }, '—')

      return h(
        'div',
        { class: 'flex items-center gap-2' },
        [
          creator.avatar
            ? h('img', {
                src: creator.avatar,
                alt: `${creator.firstName} ${creator.lastName}`,
                class: 'w-6 h-6 rounded-full',
              })
            : h('div', {
                class: 'w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium',
              }, creator.firstName.charAt(0)),
          h('span', {}, `${creator.firstName} ${creator.lastName}`),
        ],
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const event = row.original
      const items = [
        {
          label: 'View Details',
          icon: 'i-lucide-eye',
          onSelect: () => emit('view', event.id),
        },
      ] as DropdownMenuItem[]

      if (permissions.can(permissions.FellowshipPermission.EDIT_ALL_EVENTS)) {
        items.push({
          label: 'Edit',
          icon: 'i-lucide-pencil',
          onSelect: () => emit('edit', event),
        })
      }

      if (permissions.can(permissions.FellowshipPermission.DELETE_EVENTS)) {
        items.push({
          type: 'separator' as const,
        }, {
          label: 'Delete',
          icon: 'i-lucide-trash-2',
          color: 'error' as const,
          onSelect: () => emit('delete', event.id),
        })
      }

      return h(
        'div',
        { class: 'text-right' },
        h(
          resolveComponent('UDropdownMenu'),
          {
            content: { align: 'end' },
            items: [items],
          },
          () =>
            h(resolveComponent('UButton'), {
              icon: 'i-lucide-ellipsis-vertical',
              color: 'neutral',
              variant: 'ghost',
              class: 'ml-auto',
            }),
        ),
      )
    },
  },
])

// Expose refresh method
defineExpose({
  refresh: fetchEvents,
})

const table = useTemplateRef('table')
const rowSelection = ref<Record<string, boolean>>({})
function onSelect(e: Event, row: TableRow<EventData>) {
  row.toggleSelected(!row.getIsSelected())
  setTimeout(() => {
    navigateTo(`/dashboard/events/${row.original.id}`)
  }, 500)
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <div class="flex gap-2">
        <UButton
          :color="filterUpcoming ? 'primary' : 'neutral'"
          :variant="filterUpcoming ? 'solid' : 'ghost'"
          @click="filterUpcoming = true"
        >
          Upcoming
        </UButton>
        <UButton
          :color="!filterUpcoming ? 'primary' : 'neutral'"
          :variant="!filterUpcoming ? 'solid' : 'ghost'"
          @click="filterUpcoming = false"
        >
          Past
        </UButton>
      </div>

      <UButton
        icon="i-lucide-refresh-cw"
        color="neutral"
        variant="ghost"
        :loading="loading"
        @click="fetchEvents"
      >
        Refresh
      </UButton>
    </div>

    <UTable
      ref="table"
      v-model:row-selection="rowSelection"
      :data="events"
      :columns="columns"
      :loading="loading"
      class="flex-1"
      @select="onSelect"
    >
      <template #empty>
        <div class="text-center py-12">
          <div class="i-lucide-calendar-off text-4xl text-muted mx-auto mb-2" />
          <p class="text-muted">
            {{ filterUpcoming ? 'No upcoming events' : 'No past events' }}
          </p>
        </div>
      </template>
    </UTable>
  </div>
</template>
