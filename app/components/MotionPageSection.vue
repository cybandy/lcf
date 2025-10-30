<script lang="ts" setup>
import type { PageSectionProps } from '@nuxt/ui'

const props = defineProps<PageSectionProps>()
</script>

<template>
  <u-page-section v-bind="props">
    <template #title>
      <Motion
        
        :initial="{
          scale: 1.1,
          opacity: 0,
          filter: 'blur(20px)'
        }"
        :animate="{
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)'
        }"
        :transition="{
          duration: 0.6,
          delay: 0.1
        }"
        :while-in-view="{
          opacity: 1
        }"
      >
        <MDC
          v-if="props.title"
          :value="props.title"
          unwrap="p"
          class=""
        />
      </Motion>
    </template>

    <template #headline>
      <Motion 
        :initial="{
          scale: 1.1,
          opacity: 0,
          filter: 'blur(20px)'
        }"
        :animate="{
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)'
        }"
        :transition="{
          duration: 0.6,
          delay: 0.3
        }"
      >
        <span>{{ props.headline }}</span>
      </Motion>
    </template>

    <template #description>
      <Motion 
        :initial="{
          scale: 1.1,
          opacity: 0,
          filter: 'blur(20px)'
        }"
        :animate="{
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)'
        }"
        :transition="{
          duration: 0.6,
          delay: 0.3
        }"
      >
        <p>{{ props.description }}</p>
      </Motion>
    </template>

    <template #links>
      <Motion 
        :initial="{
          scale: 1.1,
          opacity: 0,
          filter: 'blur(20px)'
        }"
        :animate="{
          scale: 1,
          opacity: 1,
          filter: 'blur(0px)'
        }"
        :transition="{
          duration: 0.6,
          delay: 0.3
        }"
        class="flex flex-wrap gap-x-6 gap-y-3"
      >
        <u-button
          v-for="(button, ind) of props.links"
          :key="ind"
          v-bind="button"
        />
      </Motion>
    </template>
    <slot />
  </u-page-section>
</template>

<style scoped>

</style>
