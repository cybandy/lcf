<script setup lang="ts">
import type { Event } from '~~/shared/utils/zod_schemas'

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
