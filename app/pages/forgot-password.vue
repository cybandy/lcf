<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  middleware: 'guest',
  layout: 'default',
})

useSeoMeta({
  title: 'Forgot Password',
  description: 'Reset your password',
})

const schema = z.object({
  email: z.string().email('Invalid email address'),
})

type Schema = z.output<typeof schema>

const state = reactive<Schema>({
  email: '',
})

const toast = useToast()
const loading = ref(false)
const submitted = ref(false)
const resetUrl = ref('')

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  try {
    const response = await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: event.data,
    })

    submitted.value = true

    // In development, show the reset URL
    if (response.resetUrl) {
      resetUrl.value = response.resetUrl
    }

    toast.add({
      title: 'Success',
      description: response.message,
      color: 'success',
      icon: 'i-heroicons-check-circle',
    })
  } catch (err) {
    const error = err as {
      data?: { statusMessage?: string }
      message?: string
    }
    toast.add({
      title: 'Error',
      description: error?.data?.statusMessage || 'Failed to send reset email',
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle',
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <u-container class="flex items-center justify-center py-10">
    <u-page-card
      variant="subtle"
      class="max-w-md w-full"
    >
      <template #header>
        <div class="text-center">
          <h1 class="text-2xl font-bold">
            Forgot Password
          </h1>
          <p class="text-muted text-sm mt-2">
            Enter your email address and we'll send you instructions to reset your password
          </p>
        </div>
      </template>

      <!-- Success Message -->
      <div
        v-if="submitted"
        class="space-y-4"
      >
        <UAlert
          color="success"
          icon="i-heroicons-check-circle"
          title="Check your email"
          description="If an account exists with that email, you'll receive password reset instructions shortly."
        />

        <!-- Development only - show reset link -->
        <UAlert
          v-if="resetUrl"
          color="info"
          icon="i-heroicons-information-circle"
          title="Development Mode"
        >
          <template #description>
            <p class="mb-2">
              Email service not configured. Use this link to reset your password:
            </p>
            <UButton
              :to="resetUrl"
              size="xs"
              color="primary"
              label="Reset Password"
              external
            />
          </template>
        </UAlert>

        <div class="flex justify-center gap-3 pt-4">
          <UButton
            to="/login"
            variant="ghost"
            color="neutral"
            label="Back to Login"
          />
          <UButton
            color="neutral"
            label="Send Again"
            @click="submitted = false"
          />
        </div>
      </div>

      <!-- Form -->
      <UForm
        v-else
        :schema="schema"
        :state="state"
        class="space-y-4"
        @submit="onSubmit"
      >
        <UFormField
          label="Email Address"
          name="email"
          required
        >
          <UInput
            v-model="state.email"
            type="email"
            placeholder="Enter your email"
            size="lg"
            :disabled="loading"
            autocomplete="email"
          />
        </UFormField>

        <div class="flex flex-col gap-3">
          <UButton
            type="submit"
            color="primary"
            size="lg"
            block
            :loading="loading"
          >
            Send Reset Instructions
          </UButton>

          <UButton
            to="/login"
            variant="ghost"
            color="neutral"
            size="lg"
            block
          >
            Back to Login
          </UButton>
        </div>
      </UForm>

      <template #footer>
        <div class="text-center text-sm text-muted">
          Don't have an account?
          <ULink
            to="/join-us"
            class="text-primary font-medium hover:underline"
          >
            Sign up
          </ULink>
        </div>
      </template>
    </u-page-card>
  </u-container>
</template>
