<script setup lang="ts">
import type { Role, User } from '~~/shared/utils/zod_schemas'

const toast = useToast()

// State
interface UserWithRoles {
  id: string
  firstName: string
  lastName: string
  email: string
  status: string
  //   createdAt: string
  roles: Array<{ id: number, name: string }>
}
const users = ref<UserWithRoles[]>([])
const availableRoles = ref<Role[]>([])
const loading = ref(false)
const selectedUser = ref<UserWithRoles | null>(null)
const showAssignRoleModal = ref(false)
const selectedRoleToAssign = ref<number | undefined>(undefined)
const assigningRole = ref(false)

// Fetch users with roles
async function fetchUsers() {
  loading.value = true
  try {
    const response = await $fetch('/api/admin/users', {
      method: 'GET',
    })
    users.value = response.users
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
  selectedRoleToAssign.value = undefined
  showAssignRoleModal.value = true
}

// Get roles that user doesn't have
const availableRolesToAssign = computed(() => {
  if (!selectedUser.value) return []
  const userRoleIds = selectedUser.value.roles.map(r => r.id)
  return availableRoles.value.filter(role => !userRoleIds.includes(role.id)).map(x => ({ ...x, description: x.description ? x.description : undefined }))
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

// Initialize
onMounted(() => {
  fetchUsers()
  fetchRoles()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div>
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        Role Management
      </h2>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
        Manage user roles and permissions across the fellowship
      </p>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading"
      class="flex justify-center py-12"
    >
      <UIcon
        name="i-heroicons-arrow-path"
        class="w-8 h-8 animate-spin text-primary"
      />
    </div>

    <!-- Users Table -->
    <UCard v-else>
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">
            Users & Roles
          </h3>
          <UBadge
            :label="`${users.length} users`"
            color="neutral"
            variant="subtle"
          />
        </div>
      </template>

      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th class="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                User
              </th>
              <th class="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                Email
              </th>
              <th class="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                Status
              </th>
              <th class="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                Roles
              </th>
              <th class="text-left py-3 px-4 text-sm font-semibold text-gray-900 dark:text-white">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr
              v-for="user in users"
              :key="user.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-800/50"
            >
              <!-- User Name -->
              <td class="py-4 px-4">
                <div class="flex items-center gap-3">
                  <UAvatar
                    :alt="`${user.firstName} ${user.lastName}`"
                    size="sm"
                  />
                  <div>
                    <p class="font-medium text-gray-900 dark:text-white">
                      {{ user.firstName }} {{ user.lastName }}
                    </p>
                  </div>
                </div>
              </td>

              <!-- Email -->
              <td class="py-4 px-4">
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ user.email }}
                </p>
              </td>

              <!-- Status -->
              <td class="py-4 px-4">
                <UBadge
                  :label="user.status"
                  :color="user.status === 'active' ? 'primary' : 'neutral'"
                  variant="subtle"
                  size="xs"
                />
              </td>

              <!-- Roles -->
              <td class="py-4 px-4">
                <div
                  v-if="user.roles.length > 0"
                  class="flex flex-wrap gap-2"
                >
                  <UBadge
                    v-for="role in user.roles"
                    :key="role.id"
                    :label="role.name"
                    :color="getRoleColor(role.name)"
                    variant="subtle"
                    size="xs"
                  >
                    <template #trailing>
                      <UButton
                        icon="i-heroicons-x-mark-20-solid"
                        size="sm"
                        color="neutral"
                        variant="link"
                        :padded="false"
                        @click="removeRole(user.id, role.id, role.name)"
                      />
                    </template>
                  </UBadge>
                </div>
                <p
                  v-else
                  class="text-sm text-gray-400 dark:text-gray-500"
                >
                  No roles assigned
                </p>
              </td>

              <!-- Actions -->
              <td class="py-4 px-4">
                <UButton
                  icon="i-heroicons-plus"
                  size="xs"
                  color="primary"
                  variant="soft"
                  label="Assign Role"
                  @click="openAssignRoleModal(user)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div
        v-if="users.length === 0"
        class="text-center py-12"
      >
        <UIcon
          name="i-heroicons-users"
          class="w-12 h-12 text-gray-400 mx-auto mb-4"
        />
        <p class="text-gray-500 dark:text-gray-400">
          No users found
        </p>
      </div>
    </UCard>

    <!-- Assign Role Modal -->
    <UModal v-model="showAssignRoleModal">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">
              Assign Role
            </h3>
            <UButton
              color="neutral"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              @click="showAssignRoleModal = false"
            />
          </div>
        </template>

        <div
          v-if="selectedUser"
          class="space-y-4"
        >
          <!-- User Info -->
          <div class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <UAvatar
              :alt="`${selectedUser.firstName} ${selectedUser.lastName}`"
              size="sm"
            />
            <div>
              <p class="font-medium text-gray-900 dark:text-white">
                {{ selectedUser.firstName }} {{ selectedUser.lastName }}
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ selectedUser.email }}
              </p>
            </div>
          </div>

          <!-- Current Roles -->
          <div v-if="selectedUser.roles.length > 0">
            <p class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Current Roles:
            </p>
            <div class="flex flex-wrap gap-2">
              <UBadge
                v-for="role in selectedUser.roles"
                :key="role.id"
                :label="role.name"
                :color="getRoleColor(role.name)"
                variant="subtle"
                size="xs"
              />
            </div>
          </div>

          <!-- Select Role -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Select Role to Assign
            </label>
            <USelect
              v-model="selectedRoleToAssign"
              :items="availableRolesToAssign"
              option-attribute="name"
              value-attribute="id"
              placeholder="Choose a role"
              size="lg"
            >
              <template #item="{ item: role }">
                <div>
                  <p class="font-medium">
                    {{ role.name }}
                  </p>
                  <p
                    v-if="role.description"
                    class="text-xs text-gray-500"
                  >
                    {{ role.description }}
                  </p>
                </div>
              </template>
            </USelect>
          </div>

          <!-- No Roles Available -->
          <UAlert
            v-if="availableRolesToAssign.length === 0"
            icon="i-heroicons-information-circle"
            color="secondary"
            variant="subtle"
            title="All roles assigned"
            description="This user already has all available roles."
          />
        </div>

        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton
              label="Cancel"
              color="neutral"
              variant="ghost"
              @click="showAssignRoleModal = false"
            />
            <UButton
              label="Assign Role"
              :loading="assigningRole"
              :disabled="!selectedRoleToAssign || availableRolesToAssign.length === 0"
              @click="assignRole"
            />
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>
