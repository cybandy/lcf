<script setup lang="ts">
import { CalendarDate, DateFormatter, getLocalTimeZone } from '@internationalized/date'

const model = defineModel<Date>()

const df = new DateFormatter('en-US', {
  dateStyle: 'medium'
})

const modelValue = computed({
  get: () => model.value ? toCalendarDate((model.value)) : new CalendarDate(2000, 1, 1),
  set: (newValue: CalendarDate) => {
    model.value = newValue
      ? newValue.toDate(getLocalTimeZone())
      : new Date()
  }
})

const toCalendarDate = (_date: Date) => {
  const date = new Date(_date)
  return new CalendarDate(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  );
};
</script>

<template>
  <UPopover>
    <UButton
      color="neutral"
      variant="outline"
      icon="i-lucide-calendar"
    >
      {{ modelValue ? df.format(modelValue.toDate(getLocalTimeZone())) : 'Select a date' }}
    </UButton>

    <template #content>
      <UCalendar
        v-model="modelValue"
        class="p-2"
      />
    </template>
  </UPopover>
</template>
