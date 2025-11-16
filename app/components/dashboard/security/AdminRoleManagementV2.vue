<script setup lang="ts">
import { h, resolveComponent } from 'vue'
import type { Row } from '@tanstack/vue-table'
import type { TableColumn, SelectProps } from '@nuxt/ui'
import type { Role, User } from '~~/shared/utils/zod_schemas'

const toast = useToast()

// State
interface UserWithRoles {
  id: string
  firstName: string
  lastName: string
  email: string
  status: string
  avatar?: string | null
  roles: Array<{ id: number, name: string }>
}
const users = ref<UserWithRoles[]>([])
const availableRoles = ref<Role[]>([])
const loading = ref(false)
const selectedUser = ref<UserWithRoles | null>(null)
const showAssignRoleModal = ref(false)
const selectedRoleToAssign = ref<number | null>(null)
const assigningRole = ref(false)

// Fetch users with roles
async function fetchUsers() {
  loading.value = true
  try {
    const response = await $fetch('/api/admin/users', {
      method: 'GET',
    })
    users.value = response.users
    trackingRoles.value = users.value.map(x => x.roles)
  } catch (error) {
    toast.add({
      title: 'Error',
      description: (error as { data?: { message?: string } }).data?.message || 'Failed to fetch users',
      color: 'error',
    })
  } finally {
    loading.value = false
  }
}

// Fetch available roles
async function fetchRoles() {
  try {
    const response = await $fetch('/api/admin/roles', {
      method: 'GET',
    })
    availableRoles.value = response.roles
  } catch (error) {
    toast.add({
      title: 'Error',
      description: (error as { data?: { message?: string } }).data?.message || 'Failed to fetch roles',
      color: 'error',
    })
  }
}

// Open assign role modal
function openAssignRoleModal(user: UserWithRoles) {
  selectedUser.value = user
  selectedRoleToAssign.value = null
  showAssignRoleModal.value = true
}

// Get roles that user doesn't have
const availableRolesToAssign = computed(() => {
  if (!selectedUser.value) return []
  const userRoleIds = selectedUser.value.roles.map(r => r.id)
  return availableRoles.value.filter(role => !userRoleIds.includes(role.id))
})

// Assign role to user
async function assignRole() {
  if (!selectedUser.value || !selectedRoleToAssign.value) return

  assigningRole.value = true
  try {
    await $fetch(`/api/admin/users/${selectedUser.value.id}/roles`, {
      method: 'POST',
      body: {
        roleId: selectedRoleToAssign.value,
      },
    })

    toast.add({
      title: 'Success',
      description: 'Role assigned successfully',
      color: 'success',
    })

    showAssignRoleModal.value = false
    await fetchUsers()
  } catch (error) {
    toast.add({
      title: 'Error',
      description: (error as { data?: { message?: string } }).data?.message || 'Failed to assign role',
      color: 'error',
    })
  } finally {
    assigningRole.value = false
  }
}

// Remove role from user
async function removeRole(userId: string, roleId: number, roleName: string) {
  if (!confirm(`Are you sure you want to remove the "${roleName}" role from this user?`)) {
    return
  }

  try {
    await $fetch(`/api/admin/users/${userId}/roles/${roleId}`, {
      method: 'DELETE' as const,
    })

    toast.add({
      title: 'Success',
      description: 'Role removed successfully',
      color: 'success',
    })

    await fetchUsers()
  } catch (error) {
    toast.add({
      title: 'Error',
      description: (error as { data?: { message?: string } }).data?.message || 'Failed to remove role',
      color: 'error',
    })
  }
}

// Get role color
function getRoleColor(roleName: string) {
  const colors = {
    admin: 'error',
    pastor: 'primary',
    editor: 'info',
    deacon: 'success',
    member: 'neutral',
  } as const
  return colors[roleName.toLowerCase() as keyof typeof colors] || 'neutral'
}

onBeforeMount(async () => {
  // Initialize
  await fetchUsers()
  await fetchRoles()
})

// table
const USelect = resolveComponent('USelect')
const UUser = resolveComponent('UUser')
const UButton = resolveComponent('UButton')
const UBadge = resolveComponent('UBadge')
const UIcon = resolveComponent('UIcon')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const trackingRoles = ref<Array<{ id: number, name: string }[]>>([])

async function onSelectedRole(user: UserWithRoles, r: Role, ind: number) {
  selectedUser.value = user
  selectedRoleToAssign.value = r.id
  const trackRole = trackingRoles.value[ind]
  // no role is being tracked
  if (!trackRole || trackRole.length == 0) {
    await assignRole()
    // trackingRoles.value[ind] = [r]
    return
  }
  const pres = trackRole.filter(x => x.id === r.id)
  // means it is not the user's role so we add it
  if (pres.length === 0) {
    await assignRole()
    // trackingRoles.value[ind]?.push(r)
    return
  } else {
    // meaning that is already a role the user has so delete
    await removeRole(user.id, r.id, r.name)
    // trackingRoles.value[ind] = trackingRoles.value[ind]!.filter(x => x.id !== r.id)
    return
  }
}
// const columns: TableColumn<UserWithRoles>[] = 
const columns = computed(() => [
  {
    // accessorKey: 'id',
    id: 'user',
    header: 'User',
    cell: ({ row }) => {
      const _r = row.original
      const name = `${row.original.firstName} ${row.original.lastName}`
      const ava = row.original.avatar
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
    accessorKey: 'email',
    header: 'Email'
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const col = {
        active: 'success',
        inactive: 'error',
        visitor: 'primary'
      } as const
      return h(UBadge, {
        label: row.original.status,
        color: col[row.original.status as keyof typeof col],
        variant: 'subtle'
      })
    }
  },
  {
    accessorKey: 'roles',
    header: 'Roles',
    cell: ({ row }) => {
      const _roles = row.original.roles.map(x => x.id)
      //   trackingRoles.value.push(_roles)
      //   const t_role = toRef()
      return h(USelect,
        {
          modelValue: trackingRoles.value[row.index],
          items: availableRoles.value.map(x => ({
            id: x.id,
            name: x.name,
            onSelect: async () => {
              console.log(row.original, x, row.index)
              onSelectedRole(row.original, x, row.index)
            },
          })),
          multiple: true,
          valueKey: 'id',
          labelKey: 'name',
          selectedIcon: 'i-lucide-check',
          class: 'w-full',
          ui: {
            itemDescription: ''
          }
        },
        {
        //   'item-label': (item: { id: number, name: string }) => ([
        //     h('span', item.name),
        //     h(UIcon, { name: 'i-lucide-check', class: ['pl-1.5 size-4', _roles.includes(item.id) ? '' : 'hidden'].join(' ') })
        //   ])
        }
      )
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      return h(
        'div',
        { class: 'text-right' },
        h(
          UDropdownMenu,
          {
            content: {
              align: 'end'
            },
            items: getRowItems(row),
            'aria-label': 'Actions dropdown'
          },
          () =>
            h(UButton, {
              icon: 'i-lucide-ellipsis-vertical',
              color: 'neutral',
              variant: 'ghost',
              class: 'ml-auto',
              'aria-label': 'Actions dropdown'
            })
        )
      )
    }
  }
] as TableColumn<UserWithRoles>[])

function getRowItems(row: Row<UserWithRoles>) {
  return [
    {
      type: 'label',
      label: 'Actions',
    },

    {
      label: 'Manage Roles',
      onSelect: () => {
        console.log(row)
      }
    }
  ]
}
</script>

<template>
  <UTable
    :data="users"
    :columns="columns"
    :loading="loading"
    class="flex-1"
  />
</template>
