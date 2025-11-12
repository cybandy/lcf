<script setup lang="ts">
const { userIsAdmin } = usePermissions()

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

useSeoMeta({
  title: 'Settings - Security',
  description: 'Configuration page for security settings',
})
</script>

<template>
  <div class="space-y-8">
    <UPageCard
      title="Role Management"
      description="Manage member roles and permissions across the fellowship"
    >
      <!-- Admin Role Management (Only visible to admins) -->
      <!-- <DashboardSecurityAdminRoleManagement v-if="userIsAdmin" /> -->
      <DashboardSecurityAdminRoleManagementV2 v-if="userIsAdmin" />
    </UPageCard>
  </div>
</template>
