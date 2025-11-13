<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

interface Props {
  eventId: number
  initialStatus?: 'attending' | 'not_attending' | 'maybe'
  initialGuestCount?: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  success: []
  cancel: []
}>()

const toast = useToast()
const loading = ref(false)

// Form schema
const schema = z.object({
  status: z.enum(['attending', 'not_attending', 'maybe']),
  guestCount: z.number().int().min(0).max(50),
})

type Schema = z.output<typeof schema>

// Form state
const state = ref<Schema>({
  status: props.initialStatus || 'attending',
  guestCount: props.initialGuestCount || 0,
})

// RSVP status options
const statusOptions = [
  {
    value: 'attending',
    label: 'Attending',
    icon: 'i-lucide-check-circle',
    color: 'success',
  },
  {
    value: 'maybe',
    label: 'Maybe',
    icon: 'i-lucide-help-circle',
    color: 'warning',
  },
  {
    value: 'not_attending',
    label: 'Not Attending',
    icon: 'i-lucide-x-circle',
    color: 'error',
  },
]

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true

  try {
    await $fetch(`/api/events/${props.eventId}/rsvp`, {
      method: 'POST',
      body: event.data,
    })

    toast.add({
      title: 'Success',
      description: 'RSVP saved successfully',
      color: 'success',
    })

    emit('success')
  } catch (error) {
    const errorMessage = (error as { data?: { message?: string } }).data?.message
      || 'Failed to save RSVP'

    toast.add({
      title: 'Error',
      description: errorMessage,
      color: 'error',
    })
  } finally {
    loading.value = false
  }
}

async function cancelRsvp() {
  if (!confirm('Are you sure you want to cancel your RSVP?')) return

  loading.value = true

  try {
    await $fetch(`/api/events/${props.eventId}/rsvp`, {
      method: 'DELETE',
    })

    toast.add({
      title: 'Success',
      description: 'RSVP cancelled successfully',
      color: 'success',
    })

    emit('success')
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to cancel RSVP',
      color: 'error',
    })
  } finally {
    loading.value = false
  }
}

function handleCancel() {
  emit('cancel')
}
</script>

<template>
  <div class="space-y-4">
    <UForm
      :schema="schema"
      :state="state"
      class="space-y-4"
      @submit="onSubmit"
    >
      <UFormField
        label="Your Response"
        name="status"
        required
      >
        <div class="grid grid-cols-1 gap-2">
          <button
            v-for="option in statusOptions"
            :key="option.value"
            type="button"
            class="p-3 border rounded-lg flex items-center gap-3 transition-all"
            :class="[
              state.status === option.value
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
            ]"
            @click="state.status = option.value as Schema['status']"
          >
            <div
              class="shrink-0 w-5 h-5"
              :class="option.icon"
            />
            <div class="flex-1 text-left">
              <div class="font-medium">
                {{ option.label }}
              </div>
            </div>
            <div
              v-if="state.status === option.value"
              class="shrink-0 w-5 h-5 i-lucide-check text-primary"
            />
          </button>
        </div>
      </UFormField>

      <UFormField
        v-if="state.status === 'attending' || state.status === 'maybe'"
        label="Number of Guests"
        name="guestCount"
        description="How many additional guests will you bring?"
      >
        <UInput
          v-model.number="state.guestCount"
          type="number"
          min="0"
          max="50"
          placeholder="0"
        />
      </UFormField>

      <div class="flex gap-2 justify-between">
        <UButton
          v-if="initialStatus"
          color="error"
          variant="ghost"
          :loading="loading"
          @click="cancelRsvp"
        >
          Cancel RSVP
        </UButton>
        <div class="flex gap-2 ml-auto">
          <!-- <UButton
            color="neutral"
            variant="ghost"
            @click="handleCancel"
          >
            Close
          </UButton> -->
          <UButton
            type="submit"
            :loading="loading"
          >
            Save RSVP
          </UButton>
        </div>
      </div>
    </UForm>
  </div>
</template>
