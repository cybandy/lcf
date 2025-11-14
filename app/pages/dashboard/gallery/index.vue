<script lang="ts" setup>
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard',
})
</script>

<template>
  <u-dashboard-panel id="gallery">
    <template #header>
      <UDashboardNavbar
        title="Gallery"
        :ui="{ right: 'gap-3' }"
      >
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <!-- <template #right>
          <UTooltip
            text="Notifications"
            :shortcuts="['N']"
          >
            <UButton
              color="neutral"
              variant="ghost"
              square
              @click="isNotificationsSlideoverOpen = true"
            >
              <UChip
                color="error"
                inset
              >
                <UIcon
                  name="i-lucide-bell"
                  class="size-5 shrink-0"
                />
              </UChip>
            </UButton>
          </UTooltip>

          <UDropdownMenu :items="items">
            <UButton
              icon="i-lucide-plus"
              size="md"
              class="rounded-full"
            />
          </UDropdownMenu>
        </template> -->
      </UDashboardNavbar>
      <!-- <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold">
            Events
          </h1>
          <p class="text-muted mt-1">
            Manage church events, RSVPs, and attendance
          </p>
        </div>
      </div> -->
    </template>

    <template #body>
      <image-gallery />
    </template>
  </u-dashboard-panel>
</template>

<style scoped>

</style>
