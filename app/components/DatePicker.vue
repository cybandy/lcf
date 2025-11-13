<script setup lang="ts">
import { CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date'

const model = defineModel<Date>()

const df = new DateFormatter('en-US', {
  dateStyle: 'medium'
})

const toCalendarDate = (_date: Date) => {
  const date = new Date(_date)
  return new CalendarDate(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  )
}

const open = ref(false)

// Use a ref for the calendar value to ensure immediate updates
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const calendarValue = ref<any>(
  model.value ? toCalendarDate(model.value) : new CalendarDate(2000, 1, 1)
)

// Watch model changes from parent
watch(model, (newValue) => {
  if (newValue) {
    calendarValue.value = toCalendarDate(newValue)
  }
}, { immediate: true })

// Watch calendar changes and update model
watch(calendarValue, (newValue) => {
  if (newValue) {
    model.value = newValue.toDate(getLocalTimeZone())
    // Close popover after selection
    open.value = false
  }
})

// Format the display value
const displayValue = computed(() => {
  return model.value ? df.format(model.value) : 'Select a date'
})
</script>

<template>
  <UPopover v-model:open="open">
    <UButton
      color="neutral"
      variant="outline"
      icon="i-lucide-calendar"
    >
      {{ displayValue }}
    </UButton>

    <template #content>
      <UCalendar
        v-model="calendarValue"
        class="p-2"
      />
    </template>
  </UPopover>
</template>
