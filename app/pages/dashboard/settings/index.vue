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
  <div>
    dashboard page
    <pre>{{ user }}</pre>
  </div>
</template>

<style scoped>

</style>
