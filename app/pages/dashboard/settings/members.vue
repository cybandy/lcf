<script lang="ts" setup>
definePageMeta({
  layout: 'dashboard',
  middleware: ['auth']
})

const limit = ref(50)
const offset = ref(0)
// const { data, execute: fetchMembers } = await useFetch('/api/user', {
//   method: 'get',
//   query: {
//     limit: limit.value,
//     offset: offset.value
//   },
//   default: () => [],
//   immediate: false,
//   server: false,
// })

useSeoMeta({
  title: 'Settings - Members',
  description: 'Configuration page for members of the page'
})
</script>

<template>
  <div>
  </div>
</template>

<style scoped>

</style>
