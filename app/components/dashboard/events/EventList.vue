<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn, TableRow, DropdownMenuItem, NavigationMenuItem, EmptyProps, BadgeProps } from '@nuxt/ui'
import type { EventData, EventStatus } from '~/composables/useEvents'

const emit = defineEmits<{
  view: [id: number]
  edit: [event: EventData]
  duplicate: [event: EventData]
  delete: [id: number]
}>()

const permissions = usePermissions()
const { loading, fetchEvents, events, formatDate, formatFullDate, getRelativeTime, canCreateEvents, canDeleteEvents, canEditAllEvents, getEventStatusColor, getEventStatus } = useEvents()
const fetchOptions = ref<{ limit: number, status: EventStatus }>({
  limit: 1000,
  status: 'all'
})
// type EventStatus = "past" | "ongoing" | "upcoming"

// Initial fetch
onMounted(() => {
  fetchEvents(fetchOptions.value)
})

// Check if event is past
function isPastEvent(event: EventData) {
  return new Date(event.startTime) < new Date()
}

// Table columns
const table = useTemplateRef('table')
const UCheckbox = resolveComponent('UCheckbox')
const columns = computed<TableColumn<EventData>[]>(() => [
  {
    id: 'select',
    header: ({ table }) =>
      h(UCheckbox, {
        modelValue: table.getIsSomePageRowsSelected()
          ? 'indeterminate'
          : table.getIsAllPageRowsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') =>
          table.toggleAllPageRowsSelected(!!value),
        'aria-label': 'Select all'
      }),
    cell: ({ row }) =>
      h(UCheckbox, {
        modelValue: row.getIsSelected(),
        'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
        'aria-label': 'Select row'
      })
  },
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => {
      const event = row.original
      return h('div', { class: 'flex flex-col gap-1' }, [
        h('div', { class: 'font-medium' }, event.title),
        event.location
          ? h('div', { class: 'text-sm text-muted flex items-center gap-1' }, [
            ])
          : null,
      ])
    },
  },
  {
    accessorKey: 'startTime',
    header: 'Date',
    cell: ({ row }) => {
      const event = row.original
      const status = getEventStatus(event)
      return h('div', { class: 'flex flex-col gap-1' }, [
        h('span', { class: 'text-sm' }, formatDate(event.startTime, 'en-GB', {
          hour12: true,
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })),
        h(resolveComponent('UBadge'), {
          label: getRelativeTime(event.startTime),
          color: getEventStatusColor(status),
          variant: 'soft',
          class: 'shrink-0 w-fit'
        } as BadgeProps),
      ])
    },
  },
  {
    id: 'location',
    header: 'Location',
    cell: ({ row }) => {
      const event = row.original
      return h('span', { class: 'text-muted' }, event.location || '-')
    }
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
            ? h(resolveComponent('UAvatar'), {
                src: creator.avatar,
                alt: `${creator.firstName} ${creator.lastName}`,
                size: 'sm'
                // class: 'w-6 h-6 rounded-full',
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

      if (canEditAllEvents.value) {
        items.push({
          label: 'Edit',
          icon: 'i-lucide-pencil',
          onSelect: () => emit('edit', event),
        })
      }
      if (canCreateEvents.value) {
        items.push({
          label: 'Duplicate',
          icon: 'i-lucide-copy',
          onSelect: () => emit('duplicate', event),
        })
      }

      if (canDeleteEvents.value) {
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

const rowSelection = ref<Record<string, boolean>>({})
function onSelect(e: Event, row: TableRow<EventData>) {
  row.toggleSelected(!row.getIsSelected())
  // setTimeout(() => {
  //   navigateTo(`/dashboard/events/${row.original.id}`)
  // }, 500)
}

const statusMenu = computed(() => [
  [
    {
      label: 'All',
      active: fetchOptions.value.status === 'all',
      onSelect: () => {
        fetchOptions.value.status = 'all'
        fetchEvents(fetchOptions.value)
      }
    },
    {
      label: 'Upcoming',
      active: fetchOptions.value.status === 'upcoming',
      onSelect: () => {
        fetchOptions.value.status = 'upcoming'
        fetchEvents(fetchOptions.value)
      }
    },
    {
      label: 'Past',
      active: fetchOptions.value.status === 'past',
      onSelect: () => {
        fetchOptions.value.status = 'past'
        fetchEvents(fetchOptions.value)
      }
    },
    {
      label: 'Ongoing',
      active: fetchOptions.value.status === 'ongoing',
      onSelect: () => {
        fetchOptions.value.status = 'ongoing'
        fetchEvents(fetchOptions.value)
      }
    },
  ],
  [
    {
      label: 'Refresh',
      icon: 'i-lucide-refresh-cw',
      onSelect: async () => {
        await fetchEvents(fetchOptions.value)
      }
    }
  ]
] as NavigationMenuItem[][])

const description_ = {
  upcoming: 'You are invited to all our upcoming events',
  past: 'Check our ongoing and upcoming events for a similar impactful events',
  ongoing: "Kindly join us and your life won't be the same",
  all: 'You are invited to all our upcoming events'
}

const emptyProps = computed(() => {
  return {
    icon: "i-lucide-calendar-off",
    title: `No ${fetchOptions.value.status} events found`,
    description: "It looks like you haven't added any projects. Create one to get started.",
    actions: [
      {
        icon: 'i-lucide-plus',
        label: 'Create new'
      },
      {
        icon: 'i-lucide-refresh-cw',
        label: 'Refresh',
        color: 'neutral',
        variant: 'subtle',
        onClick: () => {
          fetchEvents(fetchOptions.value)
        }
      }
    ],
  } as EmptyProps
})
</script>

<template>
  <div class="space-y-4">
    <u-dashboard-toolbar>
      <UNavigationMenu
        :items="statusMenu"
        variant="pill"
        :highlight="true"
        class="w-full"
      />
    </u-dashboard-toolbar>

    <u-page-card
      :title="fetchOptions.status"
      :description="description_[fetchOptions.status]"
      variant="outline"
      :ui="{
        title: 'uppercase'
      }"
    >
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
          <UEmpty v-bind="emptyProps" />
        </template>
      </UTable>
    </u-page-card>
  </div>
</template>
