<script lang="ts" setup>
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})
</script>

<template>
  <u-dashboard-panel id="dashboard_page">
    <template #header>
      <u-dashboard-navbar
        title="Dashboard"
        :ui="{ right: 'gap-3' }"
      >
        <template #leading>
          <u-dashboard-sidebar-collapse />
        </template>

        <template #right>
          <u-tooltip
            text="Notifications"
            :shortcuts="['N']"
          >
            <u-button
              color="neutral"
              variant="ghost"
            >
              <u-chip
                color="error"
                inset
              >
                <u-icon
                  name="i-lucide-bell"
                  class="size-5 shrink-0"
                />
              </u-chip>
            </u-button>
          </u-tooltip>
        </template>
      </u-dashboard-navbar>
    </template>

    <template #body>
      <div>
        ""
      </div>
    </template>
  </u-dashboard-panel>
</template>

<style scoped>

</style>
