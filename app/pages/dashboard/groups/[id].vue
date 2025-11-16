<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard',
})

const route = useRoute()
const groupId = computed(() => Number(route.params.id))

const { currentGroup, fetchAuthGroup, loading } = useGroups()

onMounted(async () => {
  if (groupId.value) {
    await fetchAuthGroup(groupId.value)
  }
})

// Set SEO meta
useSeoMeta({
  title: computed(() => currentGroup.value?.name ? `${currentGroup.value.name} - Groups` : 'Group Details'),
  description: computed(() => currentGroup.value?.description || 'View group information, members, and activities'),
  ogTitle: computed(() => currentGroup.value?.name || 'Group Details'),
  ogDescription: computed(() => currentGroup.value?.description || 'Fellowship group details and member information'),
})
</script>

<template>
  <UDashboardPanel id="group-detail">
    <template #header>
      <UDashboardNavbar :title="currentGroup?.name || 'Group'">
        <template #leading>
          <UDashboardSidebarCollapse />
          <UButton
            icon="i-lucide-arrow-left"
            color="neutral"
            variant="ghost"
            to="/dashboard/groups"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div
        v-if="loading"
        class="space-y-4"
      >
        <USkeleton class="h-8 w-1/2" />
        <USkeleton class="h-20 w-full" />
        <USkeleton class="h-40 w-full" />
      </div>

      <div
        v-else-if="currentGroup"
        class="space-y-8"
      >
        <div>
          <h1 class="text-3xl font-bold">
            {{ currentGroup.name }}
          </h1>
          <p
            v-if="currentGroup.description"
            class="mt-2 text-sm text-neutral-600"
          >
            {{ currentGroup.description }}
          </p>
        </div>

        <div>
          <h2 class="text-xl font-semibold mb-4">
            Members
          </h2>
          <UPageGrid v-if="currentGroup.members && currentGroup.members.length">
            <DashboardGroupMemberCard
              v-for="m in currentGroup.members"
              :key="m.user.id"
              :member="m"
            />
          </UPageGrid>
          <div
            v-else
            class="py-8 text-center text-sm text-neutral-500"
          >
            No members yet.
          </div>
        </div>
      </div>

      <div
        v-else
        class="py-8 text-center text-sm text-neutral-500"
      >
        Group not found.
      </div>
    </template>
  </UDashboardPanel>
</template>
