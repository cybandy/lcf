<script lang="ts" setup>
definePageMeta({
  middleware: ['auth']
})
</script>

<template>
  <u-page
    class="h-screen overflow-y-auto w-full"
  >
    <u-page-body class="space-y-5 mt-2">
      <u-page-card
        variant="ghost"
        orientation="vertical"
        :ui="{ container: 'items-center lg:justify-center' }"
      >
        <u-link to="/">
          <app-logo class="size-20" />
        </u-link>
      </u-page-card>
      <u-container>
        <DashboardOnboardingNewAccount />
      </u-container>
    </u-page-body>
  </u-page>
</template>

<style scoped></style>
