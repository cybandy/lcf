<script setup lang='ts'>
const { data: page } = await useAsyncData('dev', () => queryCollection('dev').first())

const title = page.value?.seo?.title || page.value?.title
const description = page.value?.seo?.description || page.value?.description

useSeoMeta({
  titleTemplate: '',
  title,
  ogTitle: title,
  description,
  ogDescription: description
})
</script>

<template>
  <div v-if="page">
    <hero-slider
      v-if="page.hero"
      v-model="page.hero"
    />
  </div>

  <div v-else>
    empty
  </div>
</template>
