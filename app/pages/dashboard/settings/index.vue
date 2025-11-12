<script lang="ts" setup>
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

useSeoMeta({
  title: 'Settings',
  description: 'Configuration page for account settings'
})
</script>

<template>
  <div>
    dashboard page
  </div>
</template>

<style scoped>

</style>
