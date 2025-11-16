<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})
const groupsComposable = useGroups()
const { groups, loading: pending, fetchAuthorizedGroups, fetchPublicGroups, canCreateGroups, createGroup } = groupsComposable

onMounted(fetchAuthorizedGroups)

// Simple create form state (modal could be added later)
const showCreate = ref(false)
const createName = ref('')
const createDescription = ref('')

async function handleCreate() {
  if (!createName.value.trim()) return
  const created = await createGroup({ name: createName.value.trim(), description: createDescription.value.trim() || undefined })
  if (created) {
    showCreate.value = false
    createName.value = ''
    createDescription.value = ''
  }
}
</script>

<template>
  <u-dashboard-panel id="groups">
    <template #header>
      <UDashboardNavbar
        title="Groups & Ministries"
        :ui="{ right: 'gap-3' }"
      >
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="space-y-8">
        <UPageGrid>
          <DashboardGroupCard
            v-for="(group, index) in groups"
            :key="index"
            :group="group"
          />
        </UPageGrid>
      </div>
    </template>
  </u-dashboard-panel>
</template>
