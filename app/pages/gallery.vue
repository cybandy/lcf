<script lang="ts" setup>
useSeoMeta({
  title: 'Gallery',
  description: 'Nice pictures'
})
</script>

<template>
  <div>
    <UPageHero title="Gallery" />
    <ImageGallery :is-public="true" />
  </div>
</template>

<style scoped>

</style>
