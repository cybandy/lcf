<script lang="ts" setup>
await useNuxtApp().$file.getImages()
</script>

<template>
  <div>
    <UPageHero title="Gallery" />
    <ImageGallery />
  </div>
</template>

<style scoped>

</style>
