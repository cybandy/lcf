<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const links = [
  [
    {
      label: 'Profile',
      icon: 'i-lucide-user',
      to: '/dashboard/profile',
      exact: true
    },
    {
      label: 'Groups',
      icon: 'i-lucide-users',
      to: '#'
    },
    {
      label: 'Notification',
      icon: 'i-lucide-bell',
      to: '#'
    }
  ]
] satisfies NavigationMenuItem[][]

useSeoMeta({
  title: 'Profile',
  description: 'View and manage your profile, groups, and notification settings',
  ogTitle: 'Profile - Dashboard',
  ogDescription: 'Manage your personal information, group memberships, and notification preferences',
})
</script>

<template>
  <UDashboardPanel
    id="profile"
    :ui="{ body: 'lg:py-12' }"
  >
    <template #header>
      <UDashboardNavbar title="Profile">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>

      <UDashboardToolbar>
        <!-- NOTE: The `-mx-1` class is used to align with the `DashboardSidebarCollapse` button here. -->
        <UNavigationMenu
          :items="links"
          highlight
          class="-mx-1 flex-1"
        />
      </UDashboardToolbar>
    </template>

    <template #body>
      <div class="flex flex-col gap-4 sm:gap-6 lg:gap-12 w-full lg:max-w-2xl mx-auto">
        <NuxtPage />
      </div>
    </template>
  </UDashboardPanel>
</template>
