<script lang="ts" setup>
definePageMeta({
  layout: 'canvas',
  middleware: ['auth']
})
const pathname = computed(() => `${useRoute().params.pathname}` as string)

useSeoMeta({
  title: computed(() => pathname.value ? `${pathname.value} - Gallery` : 'Gallery Album'),
  description: 'View photos and media from this fellowship album',
  ogTitle: computed(() => pathname.value || 'Gallery Album'),
  ogDescription: 'Browse photos and memories from fellowship activities',
})
</script>

<template>
  <div>
    {{ pathname }}
  </div>
</template>

<style scoped>

</style>
