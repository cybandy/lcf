<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

export interface DashboardEventForm {
  eventId?: number
  initialData?: {
    title: string
    description?: string | null
    startTime: Date
    endTime?: Date | null
    location?: string | null
  }
}

const props = defineProps<DashboardEventForm>()

const emit = defineEmits(['success', 'cancel'])

const _events = useEvents()
const toast = useToast()
// const loading = ref(false)

// Form schema
const schema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  location: z.string().optional(),
})

type Schema = z.output<typeof schema>

// Initialize form state
const state = ref<Schema>({
  title: props.initialData?.title || '',
  description: props.initialData?.description || '',
  startTime: props.initialData?.startTime
    ? new Date(props.initialData.startTime).toISOString().slice(0, 16)
    : '',
  endTime: props.initialData?.endTime
    ? new Date(props.initialData.endTime).toISOString().slice(0, 16)
    : '',
  location: props.initialData?.location || '',
})

// Watch for initialData changes (when editing)
watch(
  () => props.initialData,
  (newData) => {
    if (newData) {
      state.value = {
        title: newData.title,
        description: newData.description || '',
        startTime: new Date(newData.startTime).toISOString().slice(0, 16),
        endTime: newData.endTime
          ? new Date(newData.endTime).toISOString().slice(0, 16)
          : '',
        location: newData.location || '',
      }
    }
  },
)

async function onSubmit(event: FormSubmitEvent<Schema>) {
  _events.loading.value = true

  try {
    // Prepare data with proper date format
    const submitData = {
      ...event.data,
      startTime: new Date(event.data.startTime).toISOString(),
      endTime: event.data.endTime
        ? new Date(event.data.endTime).toISOString()
        : undefined,
    }

    let result
    if (props.eventId) {
      // Update existing event
      result = await _events.updateEvent(props.eventId, submitData)
      // result = await $fetch(`/api/events/${props.eventId}`, {
      //   method: 'PATCH',
      //   body: submitData,
      // })

      // toast.add({
      //   title: 'Success',
      //   description: 'Event updated successfully',
      //   color: 'success',
      // })
    } else {
      // Create new event
      result = await _events.createEvent(submitData)
      // result = await $fetch('/api/events', {
      //   method: 'POST',
      //   body: submitData,
      // })

      // toast.add({
      //   title: 'Success',
      //   description: 'Event created successfully',
      //   color: 'success',
      // })
    }

    emit('success', result.event)

    // Reset form if creating new event
    if (!props.eventId) {
      state.value = {
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        location: '',
      }
    }
  } catch (error) {
    const errorMessage = (error as { data?: { message?: string } }).data?.message
      || 'Failed to save event'

    toast.add({
      title: 'Error',
      description: errorMessage,
      color: 'error',
    })
  } finally {
    _events.loading.value = false
  }
}

function handleCancel() {
  emit('cancel')
}
</script>

<template>
  <UForm
    :schema="schema"
    :state="state"
    class="space-y-4"
    @submit="onSubmit"
  >
    <UFormField
      label="Event Title"
      name="title"
      required
    >
      <UInput
        v-model="state.title"
        placeholder="Sunday Service, Bible Study, etc."
      />
    </UFormField>

    <UFormField
      label="Description"
      name="description"
    >
      <UTextarea
        v-model="state.description"
        placeholder="Event details and information..."
        :rows="4"
      />
    </UFormField>

    <UFormField
      label="Start Time"
      name="startTime"
      required
    >
      <UInput
        v-model="state.startTime"
        type="datetime-local"
      />
    </UFormField>

    <UFormField
      label="End Time"
      name="endTime"
    >
      <UInput
        v-model="state.endTime"
        type="datetime-local"
      />
    </UFormField>

    <UFormField
      label="Location"
      name="location"
    >
      <UInput
        v-model="state.location"
        placeholder="Church auditorium, Fellowship hall, etc."
      />
    </UFormField>

    <div class="flex gap-2 justify-end">
      <UButton
        color="neutral"
        variant="ghost"
        @click="handleCancel"
      >
        Cancel
      </UButton>
      <UButton
        type="submit"
        :loading="_events.loading.value"
      >
        {{ eventId ? 'Update Event' : 'Create Event' }}
      </UButton>
    </div>
  </UForm>
</template>
