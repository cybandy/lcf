<script setup lang="ts">
import type { Event } from '#layers/backend/shared/utils/zod_schemas'

const props = defineProps<{ event: Event }>();

const eventsComposable = useEvents()

// Simple date formatter (you can replace with a lib like day.js)
const formattedDate = eventsComposable.formatDate(props.event.startTime)
</script>

<template>
  <u-page-card
    :title="event.title"
    :description="event.description || undefined"
    :ui="{
      header: 'w-full'
    }"
  >
    <!-- <div class="p-4">
      <div class="mb-2">
        <span 
          class="inline-block bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 rounded-full px-3 py-1 text-sm font-semibold"
        >
          {{ formattedDate }}
        </span>
      </div>
      
      <h3 class="text-xl font-bold truncate mb-2">
        {{ event.title }}
      </h3>
      
      <div class="flex items-center text-gray-500 dark:text-gray-400 mb-3">
        <UIcon
          name="i-heroicons-map-pin"
          class="mr-2"
        />
        <span>{{ event.location || 'TBD' }}</span>
      </div>

      <p class="text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-4">
        {{ event.description }}
      </p>
    </div> -->

    <template #header>
      <div class="w-full flex flex-col items-end justify-between gap-2">
        <u-badge
          color="neutral"
          :label="formattedDate"
          icon="i-lucide-calendar-days"
        />
        <u-badge
          color="neutral"
          variant="subtle"
          :label="event.location || undefined"
          icon="i-lucide-map"
        />
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end">
        <UButton 
          :to="`#`" 
          label="View Details" 
          color="primary" 
          variant="outline" 
        />
      </div>
    </template>
  </u-page-card>
</template>
