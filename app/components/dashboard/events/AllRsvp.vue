<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { TableColumn, TableRow } from '@nuxt/ui'

const UBadge = resolveComponent('UBadge')
const UCheckbox = resolveComponent('UCheckbox')

const props = defineProps<{ id: number }>()
const loading = ref(false)

type Rsvps = {
  userId: string
  status: "attending" | "not_attending" | "maybe"
  guestCount: number
  createdAt: string
  updatedAt: string
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    phoneNumber: string | null
    avatar: string | null
  } | null
}

const data = ref<Rsvps[]>([])
const toast = useToast()
// const { data, execute: fetchRsvps } = useFetch(`/api/events/${props.id}/rsvps`, {
//   key: `rsvps-${props.id}`,
//   method: 'get'
// })

async function fetchRsvps() {
  loading.value = true
  try {
    const response = await $fetch(`/api/events/${props.id}/rsvps`, {
      method: 'GET',
    })
    data.value = response.rsvps
  } catch (error) {
    toast.add({
      title: 'Error',
      description: (error as { data?: { message?: string } }).data?.message || 'Failed to fetch rsvps',
      color: 'error',
    })
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchRsvps()
})

const ULink = resolveComponent('ULink')
const UUser = resolveComponent('UUser')
// const UButton = resolveComponent('UButton')
// const UIcon = resolveComponent('UIcon')
// const UDropdownMenu = resolveComponent('UDropdownMenu')
const columns: TableColumn<Rsvps>[] = [
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

function onSelect(e: Event, row: TableRow<Rsvps>) {
  /* If you decide to also select the column you can do this  */
  row.toggleSelected(!row.getIsSelected())
}
</script>

<template>
  <div class="flex w-full flex-1 gap-1">
    <div
      v-if="data"
      class="flex-1"
    >
      <UTable
        ref="table"
        v-model:row-selection="rowSelection"
        :data="data"
        :columns="columns"
        @select="onSelect"
      />
    </div>
  </div>
</template>
