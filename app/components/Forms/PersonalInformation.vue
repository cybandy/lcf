<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { User } from '#layers/backend/shared/utils/zod_schemas'

type TUser = Partial<Omit<User, 'id'>>

const modelValue = defineModel<TUser>()

const props = withDefaults(
  defineProps<{ submitTrigger?: boolean, loading?: boolean, isSkip?: boolean }>(),
  {
    submitTrigger: false,
    loading: false,
    isSkip: false
  },
)

const emits = defineEmits(['submit', 'update:submitTrigger', 'update:loading', 'skip'])
const { submitTrigger } = useVModels(props, emits)

const schema = z.object({
  email: z.email('Invalid email').min(1, 'Email is required'),
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  phoneNumber: z.string().trim().optional(),
  address: z.string().trim().optional(),
  bio: z.string().trim().optional(),
  nationality: z.string().trim().optional(),
  dob: z.coerce.date().optional(),
})

type Schema = z.output<typeof schema>

const toast = useToast()

async function onSubmit(event: FormSubmitEvent<Schema>) {
  try {
    emits('submit', event.data)
  } catch (error) {
    const err = error as {
      data?: { statusMessage?: string }
      message?: string
    }
    toast.add({
      title: 'Error',
      description: err?.data?.statusMessage || 'Failed to update profile',
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle',
    })
  }
}

const state = computed({
  get: () =>
    modelValue.value
      ? {
          ...modelValue.value,
          phoneNumber: modelValue.value.phoneNumber ?? undefined,
          address: modelValue.value.address ?? undefined,
          bio: modelValue.value.bio ?? undefined,
          nationality: modelValue.value.nationality ?? undefined,
          dob: modelValue.value.dob ?? undefined,
        }
      : {
          email: '',
          firstName: '',
          lastName: '',
          phoneNumber: undefined,
          address: undefined,
          bio: undefined,
          nationality: undefined,
          dob: undefined,
        },

  set: (newValue: Schema) => {
    modelValue.value = newValue
  },
})

const form = useTemplateRef('form')

watch(submitTrigger, async () => {
  if (submitTrigger.value) {
    form.value?.submit()
  }
})
</script>

<template>
  <u-page-card>
    <UForm
      ref="form"
      :schema="schema"
      :state="state"
      class="space-y-4"
      @submit="onSubmit"
    >
      <div class="grid gap-4 sm:grid-cols-2">
        <UFormField
          label="First Name"
          name="firstName"
          required
        >
          <UInput
            v-model="state.firstName"
            placeholder="Enter first name"
          />
        </UFormField>
        <UFormField
          label="Last Name"
          name="lastName"
          required
        >
          <UInput
            v-model="state.lastName"
            placeholder="Enter last name"
          />
        </UFormField>
      </div>
      
      <div class="grid gap-4 sm:grid-cols-2">
        <UFormField
          label="Email"
          name="email"
          required
        >
          <UInput
            v-model="state.email"
            type="email"
            placeholder="Enter email"
          />
        </UFormField>
        <UFormField
          label="Phone Number"
          name="phoneNumber"
        >
          <UInput
            v-model="state.phoneNumber"
            type="tel"
            placeholder="Enter phone number"
          />
        </UFormField>
      </div>
      
      <div class="grid gap-4 sm:grid-cols-2">
        <UFormField
          label="Date of birth"
          name="dob"
        >
          <date-picker
            v-model="state.dob"
            class="w-full"
          />
        </UFormField>

        <UFormField
          label="Nationality"
          name="nationality"
        >
          <DashboardSelectCountry
            v-model="state.nationality"
            class="w-full"
          />
        </UFormField>
      </div>

      <UFormField
        label="Address"
        name="address"
        help="Current residence address"
      >
        <UInput
          v-model="state.address"
          placeholder="Enter address"
        />
      </UFormField>

      <UFormField
        label="Bio"
        name="bio"
        help="Tell us about yourself (optional)"
      >
        <UTextarea
          v-model="state.bio"
          placeholder="Myself..."
          :maxrows="4"
          autoresize
        />
      </UFormField>

      <div
        class="flex items-center gap-3"
        :class="[isSkip && 'justify-center']"
      >
        <u-button
          v-if="isSkip"
          label="Skip"
          variant="ghost"
          color="neutral"
          @click="() => emits('skip')"
        />
        <UButton
          type="submit"
          label="Submit"
          color="neutral"
          :loading="loading"
        />
      </div>
    </UForm>
  </u-page-card>
</template>
