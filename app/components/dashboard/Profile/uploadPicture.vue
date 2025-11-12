<script lang="ts" setup>
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const props = withDefaults(
  defineProps<{
    file?: File | null
    src?: string
    alt: string
    isSkip?: boolean
    loading?: boolean
  }>(),
  {
    file: null,
    src: '',
    isSkip: false,
    loading: false,
  },
)
const emits = defineEmits(['update:file', 'update:src', 'update:alt', 'submit', 'skip'])
const { file, src, alt } = useVModels(props, emits)

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 2MB
const MIN_DIMENSIONS = { width: 200, height: 200 }
const MAX_DIMENSIONS = { width: 4096, height: 4096 }
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

const schema = z.object({
  avatar: z
    .instanceof(File, {
      message: 'Please select an image file.'
    })
    .refine(file => file.size <= MAX_FILE_SIZE, {
      message: `The image is too large. Please choose an image smaller than ${formatBytes(MAX_FILE_SIZE)}.`
    })
    .refine(file => ACCEPTED_IMAGE_TYPES.includes(file.type), {
      message: 'Please upload a valid image file (JPEG, PNG, or WebP).'
    })
    .refine(
      file =>
        new Promise((resolve) => {
          const reader = new FileReader()
          reader.onload = (e) => {
            const img = new Image()
            img.onload = () => {
              const meetsDimensions
                = img.width >= MIN_DIMENSIONS.width
                  && img.height >= MIN_DIMENSIONS.height
                  && img.width <= MAX_DIMENSIONS.width
                  && img.height <= MAX_DIMENSIONS.height
              resolve(meetsDimensions)
            }
            img.src = e.target?.result as string
          }
          reader.readAsDataURL(file)
        }),
      {
        message: `The image dimensions are invalid. Please upload an image between ${MIN_DIMENSIONS.width}x${MIN_DIMENSIONS.height} and ${MAX_DIMENSIONS.width}x${MAX_DIMENSIONS.height} pixels.`
      }
    )
})

type schema = z.output<typeof schema>

const state = computed({
  get: () => file.value ? { avatar: file.value } : undefined,
  set: (newValue: File | undefined) => {
    file.value = newValue ? newValue : null
  }
})

async function onSubmit(event: FormSubmitEvent<schema>) {
  console.log('file upload')
  emits('submit', event.data.avatar)
}
</script>

<template>
  <UForm
    :schema="schema"
    :state="state"
    class="space-y-4 w-fit"
    @submit="onSubmit"
  >
    <UFormField
      name="avatar"
      label="Avatar"
      description="JPG, GIF or PNG. 1MB Max."
      :ui="{ container: 'grid justify-center' }"
    >
      <u-file-upload
        v-model="file"
        label="Drop your image here"
        description="PNG, JPG (max. 5MB)"
        accept="image/jpg, image/png, image/jpeg"
        position="inside"
        class="w-96 min-h-48"
      >
      </u-file-upload>
    </UFormField>

    <div class="w-full flex items-center justify-center gap-3">
      <UButton
        v-if="isSkip"
        label="Skip"
        color="neutral"
        variant="ghost"
        :disabled="loading"
        @click="() => emits('skip')"
      />
      <UButton
        type="submit"
        label="Upload"
        color="neutral"
        :loading="loading"
      />
    </div>
  </UForm>
</template>

<style scoped>

</style>
