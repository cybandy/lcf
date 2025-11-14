<script setup lang='ts'>
useHead({
    title: 'Dev Page'
})
definePageMeta({
  layout: 'canvas'
})
const active = ref({
  index:2, title: ''
})
</script>

<template>
  <image-detail v-model:active="active" />
</template>