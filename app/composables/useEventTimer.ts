// composables/useEventTimer.ts
import { ref, computed, onUnmounted, shallowRef } from 'vue'

// Define the structure for a speaker's time segment
export interface TimerSegment {
  id: number
  label: string
  // When this segment *ends* (in seconds from the start)
  endTime: number
  // The duration of this specific segment
  duration: number // in seconds
}

export const useEventTimer = () => {
  const toast = useToast()

  const totalDuration = ref(0) // Total time in seconds
  const elapsedTime = ref(0) // Time elapsed in seconds
  const isRunning = ref(false)
  const segments = ref<TimerSegment[]>([])
  const timerHandle = shallowRef<ReturnType<typeof setInterval> | null>(null)

  // --- Computed State ---
  const remainingTime = computed(() => totalDuration.value - elapsedTime.value)
  const progress = computed(() => {
    if (totalDuration.value === 0) return 0
    return (elapsedTime.value / totalDuration.value) * 100
  })
  const currentSegment = computed(() => {
    return segments.value.find(s => elapsedTime.value < s.endTime) || null
  })
  // Total time planned by all segments
  const totalSegmentTime = computed(() => {
    return segments.value.reduce((total, segment) => total + segment.duration, 0)
  })

  // --- Core Timer Logic ---
  const tick = () => {
    elapsedTime.value += 1

    const justEndedSegment = segments.value.find(s => s.endTime === elapsedTime.value)
    if (justEndedSegment) {
      toast.add({
        title: 'Segment Finished',
        description: `Time for "${justEndedSegment.label}" is up.`,
        icon: 'i-heroicons-clock',
        duration: 5000
      })
    }

    if (elapsedTime.value >= totalDuration.value) {
      stop()
      toast.add({
        title: 'Event Finished',
        description: 'The total allocated time has expired.',
        icon: 'i-heroicons-check-circle',
        color: 'primary'
      })
    }
  }

  // --- Public Methods ---
  const start = () => {
    if (isRunning.value || totalDuration.value === 0 || remainingTime.value <= 0) return
    isRunning.value = true
    timerHandle.value = setInterval(tick, 1000)
  }

  const pause = () => {
    if (timerHandle.value) {
      clearInterval(timerHandle.value)
      timerHandle.value = null
    }
    isRunning.value = false
  }

  const stop = () => {
    pause()
    elapsedTime.value = totalDuration.value
  }

  const reset = (durationInSeconds: number) => {
    pause()
    totalDuration.value = durationInSeconds
    elapsedTime.value = 0
    segments.value = []
    isRunning.value = false
  }

  // --- Segment CRUD Logic ---

  /**
   * Helper function to recalculate all segment end times.
   * This is crucial for when segments are added, removed, or updated.
   */
  const recalculateSegmentEndTimes = () => {
    let cumulativeTime = 0
    for (const segment of segments.value) {
      segment.endTime = cumulativeTime + segment.duration
      cumulativeTime = segment.endTime
    }

    if (cumulativeTime > totalDuration.value) {
      toast.add({
        title: 'Warning',
        description: 'Total segment time exceeds the total event duration.',
        color: 'warning',
        icon: 'i-heroicons-exclamation-triangle'
      })
    }
  }

  const addSegment = (label: string, durationInMinutes: number) => {
    const durationInSeconds = durationInMinutes * 60
    
    if (totalSegmentTime.value + durationInSeconds > totalDuration.value) {
      toast.add({ title: 'Error', description: 'Segment duration exceeds total event time.', color: 'error' })
      return
    }

    segments.value.push({
      id: Date.now(),
      label,
      duration: durationInSeconds,
      endTime: 0 // Will be set by recalculate
    })
    recalculateSegmentEndTimes()
  }

  const removeSegment = (id: number) => {
    segments.value = segments.value.filter(s => s.id !== id)
    recalculateSegmentEndTimes()
  }

  const updateSegment = (id: number, newLabel: string, newDurationInMinutes: number) => {
    const segment = segments.value.find(s => s.id === id)
    if (!segment) return

    const newDurationInSeconds = newDurationInMinutes * 60
    
    // Check if the *change* in duration is valid
    const durationDifference = newDurationInSeconds - segment.duration
    if (totalSegmentTime.value + durationDifference > totalDuration.value) {
      toast.add({ title: 'Error', description: 'Updated duration exceeds total event time.', color: 'error' })
      return false // Indicate failure
    }
    
    segment.label = newLabel
    segment.duration = newDurationInSeconds
    recalculateSegmentEndTimes()
    return true // Indicate success
  }

  onUnmounted(pause)

  return {
    totalDuration,
    elapsedTime,
    remainingTime,
    isRunning,
    segments,
    currentSegment,
    progress,
    totalSegmentTime,
    // Methods
    start,
    pause,
    reset,
    addSegment,
    removeSegment,
    updateSegment
  }
}

// // composables/useEventTimer.ts
// import { ref, computed, onUnmounted, shallowRef } from 'vue'

// // Define the structure for a speaker's time segment
// interface TimerSegment {
//   id: number
//   label: string
//   // When this segment *ends* (in seconds from the start)
//   endTime: number
//   // The duration of this specific segment
//   duration: number
// }

// export const useEventTimer = () => {
//   // We'll use Nuxt UI's toast for notifications
//   const toast = useToast()

//   const totalDuration = ref(0) // Total time in seconds
//   const elapsedTime = ref(0) // Time elapsed in seconds
//   const isRunning = ref(false)
//   const segments = ref<TimerSegment[]>([])
//   const timerHandle = shallowRef<ReturnType<typeof setInterval> | null>(null)

//   // --- Computed State ---

//   const remainingTime = computed(() => totalDuration.value - elapsedTime.value)
//   const progress = computed(() => {
//     if (totalDuration.value === 0) return 0
//     return (elapsedTime.value / totalDuration.value) * 100
//   })

//   // Finds the segment that is currently active
//   const currentSegment = computed(() => {
//     return segments.value.find(s => elapsedTime.value < s.endTime) || null
//   })

//   // --- Core Timer Logic ---

//   const tick = () => {
//     elapsedTime.value += 1

//     // Check if a segment just *ended*
//     const justEndedSegment = segments.value.find(s => s.endTime === elapsedTime.value)
//     if (justEndedSegment) {
//       toast.add({
//         title: 'Segment Finished',
//         description: `Time for "${justEndedSegment.label}" is up.`,
//         icon: 'i-heroicons-clock',
//         duration: 5000
//       })
//     }

//     // Check if the total time is up
//     if (elapsedTime.value >= totalDuration.value) {
//       stop()
//       toast.add({
//         title: 'Event Finished',
//         description: 'The total allocated time has expired.',
//         icon: 'i-heroicons-check-circle',
//         color: 'primary'
//       })
//     }
//   }

//   // --- Public Methods ---

//   const start = () => {
//     if (isRunning.value || totalDuration.value === 0 || remainingTime.value <= 0) return
//     isRunning.value = true
//     timerHandle.value = setInterval(tick, 1000)
//   }

//   const pause = () => {
//     if (timerHandle.value) {
//       clearInterval(timerHandle.value)
//       timerHandle.value = null
//     }
//     isRunning.value = false
//   }

//   const stop = () => {
//     pause()
//     elapsedTime.value = totalDuration.value // Mark as finished
//   }

//   const reset = (durationInSeconds: number) => {
//     pause()
//     totalDuration.value = durationInSeconds
//     elapsedTime.value = 0
//     segments.value = []
//     isRunning.value = false
//   }

//   // Add a segment based on its *duration*, not its timestamp
//   const addSegment = (label: string, durationInMinutes: number) => {
//     const durationInSeconds = durationInMinutes * 60
//     const lastEndTime = segments.value.length > 0 ? segments.value[segments.value.length - 1]!.endTime : 0
//     const newEndTime = lastEndTime + durationInSeconds

//     if (newEndTime > totalDuration.value) {
//       toast.add({ title: 'Error', description: 'Segment duration exceeds total event time.', color: 'error' })
//       return
//     }

//     segments.value.push({
//       id: Date.now(),
//       label,
//       duration: durationInSeconds,
//       endTime: newEndTime
//     })
//   }

//   // Ensure we clear the interval when the component is unmounted
//   onUnmounted(pause)

//   return {
//     totalDuration,
//     elapsedTime,
//     remainingTime,
//     isRunning,
//     segments,
//     currentSegment,
//     progress,
//     start,
//     pause,
//     reset,
//     addSegment
//   }
// }
