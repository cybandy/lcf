<script setup lang="ts">
import type { Event } from '~~/shared/utils/zod_schemas'

const props = defineProps<{ events: Event[], title?: string }>();
</script>

<template>
  <div>
    <h2
      v-if="title"
      class="text-2xl font-semibold mb-4"
    >
      {{ title }}
    </h2>
    
    <div 
      v-motion
      :initial="{ opacity: 0, y: 20 }"
      :visibleOnce="{ 
        opacity: 1, 
        y: 0, 
        transition: { 
          delay: 100,
          stagger: 50 // This is the magic
        }
      }"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <EventCard
        v-for="event in events"
        :key="event.id"
        v-motion-item
        :event="event"
      />
    </div>
  </div>
</template>
