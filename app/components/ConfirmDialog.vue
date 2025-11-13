<script setup lang="ts">
import type { ButtonProps } from '@nuxt/ui'

const props = withDefaults(
  defineProps<{
    open?: boolean
    title?: string
    description?: string
    confirmText?: string
    cancelText?: string
    confirmColor?: ButtonProps['color']
    loading?: boolean
    icon?: string
  }>(),
  {
    open: false,
    title: 'Confirm Action',
    description: 'Are you sure you want to proceed?',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    confirmColor: 'primary',
    loading: false,
    icon: 'i-heroicons-exclamation-triangle',
  },
)

const emits = defineEmits<{
  'update:open': [value: boolean]
  confirm: []
  cancel: []
}>()

const isOpen = computed({
  get: () => props.open,
  set: value => emits('update:open', value),
})

function handleConfirm() {
  emits('confirm')
}

function handleCancel() {
  emits('cancel')
  isOpen.value = false
}
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :prevent-close="loading"
    :title="title"
    :description="description"
  >
    <template #body>
      <UCard>
        <div class="flex items-center justify-center">
          <UIcon
            v-if="icon"
            :name="icon"
            class="size-10"
            :class="{
              'text-error': confirmColor === 'error',
              'text-warning': confirmColor === 'warning',
              'text-success': confirmColor === 'success',
              'text-primary': confirmColor === 'primary'
            }"
          />
        </div>

        <div class="py-4">
          <slot />
        </div>
      </UCard>
    </template>

    <template #footer>
      <div class="w-full flex justify-end gap-3">
        <UButton
          :label="cancelText"
          variant="ghost"
          color="neutral"
          :disabled="loading"
          @click="handleCancel"
        />
        <UButton
          :label="confirmText"
          :color="confirmColor"
          :loading="loading"
          @click="handleConfirm"
        />
      </div>
    </template>
  </UModal>
</template>
