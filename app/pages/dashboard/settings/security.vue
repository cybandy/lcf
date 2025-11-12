<script setup lang="ts">
import * as z from 'zod'
import type { FormError, FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
})

const passwordSchema = z.object({
  current: z.string().min(8, 'Must be at least 8 characters'),
  new: z.string().min(8, 'Must be at least 8 characters')
})

type PasswordSchema = z.output<typeof passwordSchema>

const password = reactive<Partial<PasswordSchema>>({
  current: undefined,
  new: undefined
})

const validate = (state: Partial<PasswordSchema>): FormError[] => {
  const errors: FormError[] = []
  if (state.current && state.new && state.current === state.new) {
    errors.push({ name: 'new', message: 'Passwords must be different' })
  }
  return errors
}

const { user } = useMyUserSession();
const fetchBody = ref({} as PasswordSchema);
const toast = useToast()

const { execute: changePwd } = await useAsyncData(
  `/api/user/${user.value.id}`,
  async () => {
    const d = await $fetch(`/api/user/${user.value.id}/reset_password`, {
      method: 'post',
      body: fetchBody.value,
      onResponseError: ({ error: err }) => {
        toast.add({
          description: err?.message,
          color: 'error',
        });
      },
      onResponse: ({ response }) => {
        if (response.ok) {
          toast.add({
            title: 'Password changed',
            color: 'success',
          });
        }
      },
    });
  },
  { immediate: false, server: false },
);

async function onSubmitLogin(event: FormSubmitEvent<PasswordSchema>) {
  fetchBody.value = event.data;
  await changePwd();
}

useSeoMeta({
  title: 'Settings - Security',
  description: 'Configuration page for security settings'
})
</script>

<template>
  <UPageCard
    title="Password"
    description="Confirm your current password before setting a new one."
    variant="subtle"
  >
    <UForm
      :schema="passwordSchema"
      :state="password"
      :validate="validate"
      class="flex flex-col gap-4 max-w-xs"
      @submit="onSubmitLogin"
    >
      <UFormField name="current">
        <UInput
          v-model="password.current"
          type="password"
          placeholder="Current password"
          class="w-full"
        />
      </UFormField>

      <FormsPasswordInput v-model="password.new" />

      <UButton
        label="Update"
        class="w-fit"
        type="submit"
      />
    </UForm>
  </UPageCard>

  <UPageCard
    title="Account"
    description="No longer want to use the platform? You can delete your account here. This action is not reversible. All information related to this account will be deleted permanently."
    class="bg-gradient-to-tl from-error/10 from-5% to-default"
  >
    <template #footer>
      <UButton
        label="Delete account"
        color="error"
      />
    </template>
  </UPageCard>
</template>
