<script setup lang="ts">
import { ref, watch } from 'vue'
import { breakpointsTailwind } from '@vueuse/core'
// import type { TimerSegment } from '~/composables/useEventTimer' // Import the interface

const {
  totalDuration,
  elapsedTime,
  remainingTime,
  isRunning,
  segments,
  currentSegment,
  progress,
  totalSegmentTime,
  start,
  pause,
  reset,
  addSegment,
  removeSegment,
  updateSegment
} = useEventTimer()

// --- Local state for forms ---
const organizerTime = ref(40)
const segmentLabel = ref('Intro')
const segmentDuration = ref(3)

// --- Local state for Edit Modal ---
const isEditModalOpen = ref(false)
const segmentToEdit = ref<TimerSegment | null>(null)
const editLabel = ref('')
const editDuration = ref(0)

// --- Helper Functions ---
const formatTime = (seconds: number) => {
  if (seconds < 0) seconds = 0
  const mins = Math.floor(seconds / 60).toString().padStart(2, '0')
  const secs = (seconds % 60).toString().padStart(2, '0')
  return `${mins}:${secs}`
}

const setupTimer = () => {
  reset(organizerTime.value * 60)
}

const handleAddSegment = () => {
  if (!segmentLabel.value || !segmentDuration.value || segmentDuration.value <= 0) return
  addSegment(segmentLabel.value, segmentDuration.value)
  segmentLabel.value = ''
  segmentDuration.value = 0
}

// --- Modal Logic ---
const openEditModal = (segment: TimerSegment) => {
  segmentToEdit.value = segment
  editLabel.value = segment.label
  editDuration.value = segment.duration / 60 // Convert seconds back to minutes for UI
  isEditModalOpen.value = true
}

const handleUpdateSegment = () => {
  if (!segmentToEdit.value || !editLabel.value || !editDuration.value || editDuration.value <= 0) return
  
  // The updateSegment composable returns 'true' on success
  const success = updateSegment(segmentToEdit.value.id, editLabel.value, editDuration.value)
  
  if (success) {
    isEditModalOpen.value = false
    segmentToEdit.value = null
  }
}

// Close modal if segmentToEdit is cleared
watch(isEditModalOpen, (isOpen) => {
  if (!isOpen) {
    segmentToEdit.value = null
  }
})

// Initialize timer on load
setupTimer()

// know window breakpoints
const breakPoints = useBreakpoints(breakpointsTailwind)
const sm = breakPoints.smallerOrEqual('sm')
const md = breakPoints.smallerOrEqual('md')
const lg = breakPoints.smallerOrEqual('lg')
</script>

<template>
  <UCard>
    <template #header>
      <h3 class="text-lg font-semibold leading-6 text-highlighted">
        Event Timer & Segment Manager
      </h3>
    </template>

    <!-- Main Timer Display -->
    <div class="text-center space-y-4">
      <div class="text-6xl font-mono font-bold text-highlighted">
        {{ formatTime(remainingTime) }}
      </div>
      
      <UProgress :value="progress" />

      <div class="flex justify-between text-sm text-default">
        <span>Elapsed: {{ formatTime(elapsedTime) }}</span>
        <span
          v-if="currentSegment"
          class="font-medium text-primary-500"
        >
          Current: {{ currentSegment.label }}
        </span>
        <span>Total: {{ formatTime(totalDuration) }}</span>
      </div>
    </div>

    <!-- Controls -->
    <div class="flex justify-center space-x-4 mt-6">
      <UButton
        :disabled="isRunning || remainingTime <= 0"
        label="Start"
        icon="i-heroicons-play"
        size="xl"
        @click="start"
      />
      <UButton
        :disabled="!isRunning"
        label="Pause"
        icon="i-heroicons-pause"
        variant="outline"
        size="xl"
        @click="pause"
      />
    </div>

    <USeparator
      label="Configuration"
      class="my-6"
    />

    <!-- Configuration Section -->
    <UPageGrid class="lg:grid-cols-2">
      <UPageCard
        variant="subtle"
        title="Organizer Setup"
      >
        <div class="flex items-end space-x-2">
          <UFormField
            label="Total Duration (Minutes)"
            class="flex-1"
          >
            <UInputNumber
              v-model="organizerTime"
              placeholder="e.g., 40"
            />
          </UFormField>
          <UButton
            label="Set Time"
            @click="setupTimer"
          />
        </div>
      </UPageCard>
      <UPageCard
        variant="subtle"
        title="Speaker Segments"
      >
        <form
          class="flex items-end space-x-2"
          @submit.prevent="handleAddSegment"
        >
          <UFormField
            label="Segment Label"
            class="flex-1"
          >
            <UInput
              v-model="segmentLabel"
              placeholder="e.g., Intro"
            />
          </UFormField>
          <UFormField
            label="Duration (Mins)"
            class="w-32"
          >
            <UInputNumber
              v-model="segmentDuration"
            />
          </UFormField>
          <UButton
            type="submit"
            label="Add"
            variant="soft"
          />
        </form>
      </UPageCard>
    </UPageGrid>

    <!-- List of Segments -->
    <div
      v-if="segments.length"
      class="mt-6"
    >
      <h4 class="font-medium mb-2">
        Segment Plan
      </h4>
      <p class="text-sm mb-3">
        Total planned time: {{ totalSegmentTime / 60 }} / {{ totalDuration / 60 }} minutes
      </p>
      <ul class="space-y-2">
        <UPageCard
          v-for="segment in segments"
          :key="segment.id"
          :orientation="sm ? 'vertical' : 'horizontal'"
          variant="soft"
          highlight-color="primary"
          :highlight="false"
          :title="segment.label"
          :ui="{
            container: 'sm:p-4'
          }"
        >
          <template #title>
            <div>
              <span class="font-medium">{{ segment.label }}</span>
              <span class="text-sm text-default ml-2">
                ({{ segment.duration / 60 }} mins)
              </span>
            </div>
          </template>

          <div class="flex items-center justify-end space-x-1">
            <UButton
              icon="i-heroicons-pencil"
              size="sm"
              color="neutral"
              variant="ghost"
              @click="openEditModal(segment)"
            />
            <UButton
              icon="i-heroicons-trash"
              size="sm"
              color="warning"
              variant="ghost"
              @click="removeSegment(segment.id)"
            />
          </div>
        </UPageCard>
      </ul>
    </div>

    <!-- Edit Segment Modal -->
    <UModal
      v-model:open="isEditModalOpen"
      description="Make changes to the segment"
      :ui="{
        footer: 'flex justify-end space-x-2'
      }"
    >
      <template #title>
        Edit <span class="text-primary">{ Segment }</span>
      </template>
      <template #body>
        <div class="space-y-4">
          <UFormField label="Segment Label">
            <UInput v-model="editLabel" />
          </UFormField>
          <UFormField label="Duration (Minutes)">
            <UInputNumber
              v-model="editDuration"
            />
          </UFormField>
        </div>
      </template>

      <template #footer>
        <UButton
          label="Cancel"
          variant="outline"
          @click="isEditModalOpen = false"
        />
        <UButton
          label="Save Changes"
          @click="handleUpdateSegment"
        />
      </template>
    </UModal>
  </UCard>
</template>
