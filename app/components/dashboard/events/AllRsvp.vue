<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn, TableRow } from '@nuxt/ui'
import type { EventStat } from './Stats.vue';
import type { RsvpSummary } from '~/composables/useEvents';

const UBadge = resolveComponent('UBadge')
const UCheckbox = resolveComponent('UCheckbox')

const props = withDefaults(defineProps<{ id: number, title?: string, description?: string }>(), {
  title: 'Reservations',
  description: 'All event reservations'
})

const data = ref<RsvpData[]>([])
const summary = ref<RsvpSummary>()
const _ = useEvents()

await useAsyncData(`rsvp-${props.id}`, async () => {
  const d = await _.fetchEventRsvps(props.id)
  data.value = d.rsvps
  summary.value = d.summary
})

const ULink = resolveComponent('ULink')
const UUser = resolveComponent('UUser')
// const UButton = resolveComponent('UButton')
// const UIcon = resolveComponent('UIcon')
// const UDropdownMenu = resolveComponent('UDropdownMenu')
const columns: TableColumn<RsvpData>[] = [
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
    accessorKey: 'user',
    id: 'user',
    header: 'User',
    cell: ({ row }) => {
      const _u = row.original.user
      const name = `${_u?.firstName} ${_u?.lastName}`
      const ava = _u?.avatar
      return h(UUser, {
        color: 'neutral' as const,
        variant: 'ghost' as const,
        name: name,
        avatar: {
          src: ava || undefined,
          alt: name
        }
      })
    }
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const color = {
        attending: 'success' as const,
        not_attending: 'error' as const,
        maybe: 'neutral' as const
      }[row.getValue('status') as string]

      return h(UBadge, { class: 'capitalize', variant: 'subtle', color }, () =>
        row.getValue('status')
      )
    }
  },
  {
    accessorKey: 'guestCount',
    header: 'Guests'
  },
  {
    id: 'email',
    header: 'Email',
    cell: ({ row }) => row.original.user ? h(ULink, { to: `mailto:${row.original.user.email}`, target: '_blank', class: 'z-10' }, row.original.user.email) : h('span')
  },
  {
    id: 'phoneNumber',
    header: 'Phone Number',
    cell: ({ row }) => {
      return row.original.user ? row.original.user.phoneNumber : ''
    }
  },
  {
    accessorKey: 'createdAt',
    header: 'Date',
    cell: ({ row }) => {
      return new Date(row.getValue('createdAt')).toLocaleString('en-US', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      })
    }
  },
]

const table = useTemplateRef('table')

const rowSelection = ref<Record<string, boolean>>({})

function onSelect(e: Event, row: TableRow<RsvpData>) {
  /* If you decide to also select the column you can do this  */
  row.toggleSelected(!row.getIsSelected())
}

const stats = computed(() => [
  {
    title: 'Attending',
    icon: 'i-lucide-check-circle',
    value: summary.value?.attending,
    color: 'secondary',
    guests: summary.value?.attendingGuests,
  },
  {
    title: 'Maybe',
    icon: 'i-lucide-help-circle',
    value: summary.value?.maybe,
    color: 'warning',
    guests: summary.value?.maybeGuests,
  },
  // {
  //   title: 'Not Attending',
  //   icon: 'i-lucide-help-circle',
  //   value: 12,
  //   color: 'error',
  //   guests: undefined,
  // },
  {
    title: 'Total',
    icon: 'i-lucide-users',
    value: summary.value?.total,
    color: 'success',
    guests: undefined,
  },
] as EventStat[])
</script>

<template>
  <div class="space-y-8">
    <DashboardEventsStats
      v-if="summary"
      :stats="stats"
      class="lg:grid-cols-3"
    />

    <u-page-card
      :title="title"
      :description="description"
      :ui="{
        title: 'text-xl sm:text-2xl'
      }"
    >
      <div class="flex w-full flex-1 gap-1">
        <div
          v-if="data"
          class="flex-1"
        >
          <UTable
            ref="table"
            v-model:row-selection="rowSelection"
            :data="data"
            :loading="_.loading.value"
            :columns="columns"
            empty="No reservations yet"
            @select="onSelect"
          />
        </div>
      </div>
    </u-page-card>
  </div>
</template>
