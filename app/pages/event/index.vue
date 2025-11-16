<script lang="ts" setup>
import type { Event } from '~~/shared/utils/zod_schemas'

definePageMeta({
  layout: 'default',
  middleware: 'auth'
})

const { data: page } = await useAsyncData('event', () => queryCollection('event').first())
const title = page.value?.seo?.title || page.value?.title
const description = page.value?.seo?.description || page.value?.description
useSeoMeta({
  titleTemplate: '',
  title,
  ogTitle: title,
  description,
  ogDescription: description
})

// upcoming
const queryData = ref({
  ongoing: {
    limit: 6,
    offset: 0
  },
  upcoming: {
    limit: 6,
    offset: 0
  },
})
const { data: upcoming } = await useFetch('/api/public/events', {
  method: 'get',
  query: {
    status: 'upcoming',
    ...queryData.value.upcoming
  },
  transform: (d) => {
    return {
      total: d.total,
      events: d.events.map(x => ({
        ...x,
        startTime: new Date(x.startTime),
        endTime: x.endTime ? new Date(x.endTime) : null,
      }))
    } as { events: Event[], total: number } | undefined
  }
})

// ongoing
const { data: ongoing } = await useFetch('/api/public/events', {
  method: 'get',
  query: {
    status: 'ongoing',
    ...queryData.value.ongoing
  },
  transform: (d) => {
    return {
      total: d.total,
      events: d.events.map(x => ({
        ...x,
        startTime: new Date(x.startTime),
        endTime: x.endTime ? new Date(x.endTime) : null,
      }))
    } as { events: Event[], total: number } | undefined
  }
})
</script>

<template>
  <div v-if="page">
    <u-page-hero
      :title="page.hero.title"
      :description="page.hero.description"
      :orientation="page.hero.orientation"
      :links="page.hero.links"
      :reverse="page.hero.reverse"
      :headline="page.hero.headline"
      :class="page.hero.class"
    >
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
            :value="page.hero.title"
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
          <span v-if="page.hero.headline">{{ page.hero.headline }}</span>
          <UIcon
            v-else-if="page.hero.icon"
            :name="page.hero.icon"
            class="shrink-0 text-primary size-10"
          />
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
          <p>{{ page.hero.description }}</p>
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
            v-for="(button, ind) of page.hero.links"
            :key="ind"
            v-bind="button"
          />
        </Motion>
      </template>
    </u-page-hero>

    <u-page-section
      v-if="ongoing && ongoing.events.length > 1"
      v-bind="page.sections.ongoing"
    >
      <event-list :events="ongoing.events" />
    </u-page-section>

    <u-page-section
      v-if="upcoming"
      v-bind="page.sections.upcoming"
    >
      <event-list :events="upcoming.events" />
    </u-page-section>
    
    <UPageCTA
      v-bind="page.cta"
      variant="naked"
      class="overflow-hidden"
    >
    </UPageCTA>
  </div>
  <div v-else>
  </div>
</template>

<style scoped>

</style>
