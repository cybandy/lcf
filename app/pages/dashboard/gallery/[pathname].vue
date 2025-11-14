<script lang="ts" setup>
definePageMeta({
  layout: 'canvas',
  middleware: ['auth']
})
const pathname = computed(() => `${useRoute().params.pathname}` as string)
</script>

<template>
  <div>
    {{ pathname }}
  </div>
</template>

<style scoped>

</style>
