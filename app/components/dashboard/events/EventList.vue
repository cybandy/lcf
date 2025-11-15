<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn, TableRow, DropdownMenuItem, NavigationMenuItem, EmptyProps, BadgeProps } from '@nuxt/ui'
import type { EventData, EventStatus } from '~/composables/useEvents'
import { upperFirst } from 'es-toolkit'
import { getPaginationRowModel } from '@tanstack/vue-table'

const emit = defineEmits<{
  view: [id: number]
  edit: [event: EventData & { id?: number | undefined }]
  duplicate: [event: EventData & { id?: number }]
  delete: [event: EventData]
}>()

const { isOwner } = usePermissions()

const { loading, fetchEvents, events, formatDate, deleteEvent, getRelativeTime, canCreateEvents, canDeleteEvents, canEditAllEvents, getEventStatusColor, getEventStatus } = useEvents()
const fetchOptions = ref<{ limit: number, status: EventStatus }>({
  limit: 1000,
  status: 'all'
})
// type EventStatus = "past" | "ongoing" | "upcoming"

// Initial fetch
onMounted(() => {
  fetchEvents(fetchOptions.value)
})

// deleting Event
const selectedEvent = ref<EventData | null>(null)
// call delete
const deleteOpen = ref(false)

const onDeleteEvent = async (event: EventData) => {
  selectedEvent.value = event
  deleteOpen.value = true
}

async function confirmDelete() {  
  if (!selectedEvent.value) return
  try {
    await deleteEvent(selectedEvent.value.id)
    await fetchEvents(fetchOptions.value)
    cancelDelete()
  } catch (error) {
    //
  }
}
function cancelDelete() {
  deleteOpen.value = !deleteOpen.value
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
    id: 'title',
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

      if (canEditAllEvents.value || isOwner(event.creatorId)) {
        items.push({
          label: 'Edit',
          icon: 'i-lucide-pencil',
          onSelect: () => emit('edit', event),
        })
      }
      if (canCreateEvents.value) {
        const { id, startTime, ...ev } = event
        items.push({
          label: 'Duplicate',
          icon: 'i-lucide-copy',
          onSelect: () => emit('duplicate', {
            ...ev,
            startTime: (new Date()).toISOString()
          } as EventData & { id?: number }),
        })
      }

      if (canDeleteEvents.value) {
        items.push({
          type: 'separator' as const,
        }, {
          label: 'Delete',
          icon: 'i-lucide-trash-2',
          color: 'error' as const,
          onSelect: async () => {
            emit('delete', event)
            await onDeleteEvent(event)
          },
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
const pagination = ref({
  pageIndex: 0,
  pageSize: 5
})
// columnVisibility
const columnVisibility = ref({
  id: false
})

const rowSelection = ref<Record<string, boolean>>({})
function onSelect(e: Event, row: TableRow<EventData>) {
  row.toggleSelected(!row.getIsSelected())
  // setTimeout(() => {
  //   navigateTo(`/dashboard/events/${row.original.id}`)
  // }, 500)
}

async function localFetch(status: EventStatus) {
  fetchOptions.value.status = status
  try {
    await fetchEvents(fetchOptions.value)
    table.value?.tableApi.setPageIndex(1)
  } catch (error) {
    //
  }
}

const statusMenu = computed(() => [
  [
    {
      label: 'All',
      active: fetchOptions.value.status === 'all',
      onSelect: async () => {
        await localFetch('all')
      }
    },
    {
      label: 'Upcoming',
      active: fetchOptions.value.status === 'upcoming',
      onSelect: async () => {
        await localFetch('upcoming')
      }
    },
    {
      label: 'Past',
      active: fetchOptions.value.status === 'past',
      onSelect: async () => {
        await localFetch('past')
      }
    },
    {
      label: 'Ongoing',
      active: fetchOptions.value.status === 'ongoing',
      onSelect: async () => {
        await localFetch('ongoing')
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

const columnFilters = ref([
  {
    id: 'title',
    value: ''
  }
])
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
      <u-page-card
        variant="naked"
        class="w-full flex-1"
        :ui="{
          body: 'w-full',
          header: 'w-full flex items-center justify-between',
          footer: 'w-full'
        }"
      >
        <template #header>
          <UInput
            :model-value="table?.tableApi?.getColumn('title')?.getFilterValue() as string"
            class="max-w-sm"
            placeholder="Filter title..."
            @update:model-value="table?.tableApi?.getColumn('title')?.setFilterValue($event)"
          />
          <UDropdownMenu
            :items="
              table?.tableApi
                ?.getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => ({
                  label: upperFirst(column.id),
                  type: 'checkbox' as const,
                  checked: column.getIsVisible(),
                  onUpdateChecked(checked: boolean) {
                    table?.tableApi?.getColumn(column.id)?.toggleVisibility(!!checked)
                  },
                  onSelect(e: Event) {
                    e.preventDefault()
                  }
                }))
            "
            :content="{ align: 'end' }"
          >
            <UButton
              label="Columns"
              color="neutral"
              variant="outline"
              trailing-icon="i-lucide-chevron-down"
            />
          </UDropdownMenu>
        </template>

        <template #body>
          <UTable
            ref="table"
            v-model:row-selection="rowSelection"
            v-model:column-visibility="columnVisibility"
            v-model:column-filters="columnFilters"
            v-model:pagination="pagination"
            :pagination-options="{
              getPaginationRowModel: getPaginationRowModel()
            }"
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
        </template>

        <template #footer>
          <UPagination
            :default-page="(table?.tableApi.getState().pagination.pageIndex || 0) + 1"
            :items-per-page="table?.tableApi?.getState().pagination.pageSize"
            :total="table?.tableApi?.getFilteredRowModel().rows.length"
            @update:page="(p) => table?.tableApi?.setPageIndex(p - 1)"
          />
        </template>
      </u-page-card>
    </u-page-card>

    <ConfirmDialog
      v-bind="{
        title: 'Delete Event',
        open: deleteOpen,
        description: 'Note that all information related to the event will be deleted completely. This action is irreversible',
        confirmColor: 'error',
        confirmText: 'Delete' }"
      @cancel="cancelDelete"
      @confirm="confirmDelete"
    >
      <div class="space-y-1 5 text-center">
        <p class="text-highlighted text-lg">
          {{ selectedEvent?.title }}
        </p>
        <p
          v-if="selectedEvent?.description"
          class="text-sm text-muted"
        >
          {{ selectedEvent?.description }}
        </p>
      </div>
    </ConfirmDialog>
  </div>
</template>
