<script lang="ts" setup>
import type { BlobObject } from '../composables/useGallery'

type T = { file: BlobObject }
const { isImage, isVideo } = useGallery()

defineProps<T>()
//
</script>

<template>
  <img
    v-if="isImage(file)"
    :src="`/files/${file.pathname}`"
    class="max-w-full max-h-full aspect-auto mx-auto"
  >
  <video
    v-else-if="isVideo(file)"
    :src="`/files/${file.pathname}`"
    class="max-w-full max-h-full aspect-video mx-auto"
    :autoplay="false"
    :controls="true"
    :disable-picture-in-picture="true"
    preload="none"
  />
</template>

<style scoped>

</style>
