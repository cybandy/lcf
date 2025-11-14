<script lang="ts" setup>
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

useSeoMeta({
  title: 'Settings',
  description: 'Configuration page for account settings'
})

const { user } = useMyUserSession()
</script>

<template>
  <u-page-hero
    title="Under Construction"
    description="Working on it"
  >
    <template #headline>
      <u-icon
        name="i-lucide-construction"
        class="text-warning size-12"
      />
    </template>
  </u-page-hero>
</template>

<style scoped>

</style>
