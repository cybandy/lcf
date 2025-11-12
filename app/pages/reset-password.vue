<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  middleware: 'guest',
  layout: 'default',
})

useSeoMeta({
  title: 'Reset Password',
  description: 'Set your new password',
})

const route = useRoute()
const router = useRouter()

const token = computed(() => route.query.token as string)

// Redirect if no token provided
onMounted(() => {
  if (!token.value) {
    router.push('/forgot-password')
  }
})

const schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type Schema = z.output<typeof schema>

const state = reactive<Schema>({
  password: '',
  confirmPassword: '',
})

const toast = useToast()
const loading = ref(false)
const success = ref(false)

// Password strength indicator
const passwordStrength = computed(() => {
  const password = state.password
  if (!password) return { score: 0, label: '', color: 'neutral' }

  let score = 0
  if (password.length >= 8) score += 25
  if (password.length >= 12) score += 25
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 25
  if (/\d/.test(password)) score += 12.5
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 12.5

  let label = 'Weak'
  let color = 'error'
  if (score >= 90) {
    label = 'Strong'
    color = 'success'
  } else if (score >= 60) {
    label = 'Good'
    color = 'warning'
  } else if (score >= 30) {
    label = 'Fair'
    color = 'warning'
  }

  return { score, label, color }
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  try {
    const response = await $fetch<{ success: boolean, message: string }>(
      '/api/auth/reset-password',
      {
        method: 'POST',
        body: {
          token: token.value,
          password: event.data.password,
        },
      },
    )

    success.value = true

    toast.add({
      title: 'Success',
      description: response.message,
      color: 'success',
      icon: 'i-heroicons-check-circle',
    })

    // Redirect to login after 2 seconds
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (err) {
    const error = err as {
      data?: { statusMessage?: string }
      message?: string
    }
    toast.add({
      title: 'Error',
      description:
        error?.data?.statusMessage
        || 'Failed to reset password. The link may be expired.',
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle',
    })
  } finally {
    loading.value = false
  }
}

const show = ref(false)
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
            Reset Password
          </h1>
          <p class="text-muted text-sm mt-2">
            Enter your new password below
          </p>
        </div>
      </template>

      <!-- Success Message -->
      <div
        v-if="success"
        class="space-y-4 text-center"
      >
        <UAlert
          color="success"
          icon="i-heroicons-check-circle"
          title="Password Reset Successful"
          description="Your password has been changed. Redirecting to login..."
        />

        <UButton
          to="/login"
          color="primary"
          size="lg"
          block
        >
          Go to Login
        </UButton>
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
          label="New Password"
          name="password"
          required
          :help="`Password strength: ${passwordStrength.label}`"
        >
          <UInput
            v-model="state.password"
            placeholder="Enter new password"
            size="lg"
            :disabled="loading"
            autocomplete="new-password"
            :type="show ? 'text' : 'password'"
            :ui="{ trailing: 'pe-1' }"
          >
            <template #trailing>
              <UButton
                color="neutral"
                variant="link"
                size="sm"
                :icon="show ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                :aria-label="show ? 'Hide password' : 'Show password'"
                :aria-pressed="show"
                aria-controls="password"
                @click="show = !show"
              />
            </template>
          </UInput>
          
          <!-- Password Strength Bar -->
          <div
            v-if="state.password"
            class="mt-2"
          >
            <div class="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                class="h-full transition-all duration-300"
                :class="{
                  'bg-error': passwordStrength.score < 30,
                  'bg-warning': passwordStrength.score >= 30 && passwordStrength.score < 90,
                  'bg-success': passwordStrength.score >= 90
                }"
                :style="{ width: `${passwordStrength.score}%` }"
              />
            </div>
            <p
              class="text-xs mt-1"
              :class="{
                'text-error': passwordStrength.score < 30,
                'text-warning': passwordStrength.score >= 30 && passwordStrength.score < 90,
                'text-success': passwordStrength.score >= 90
              }"
            >
              Use a mix of uppercase, lowercase, numbers, and special characters
            </p>
          </div>
        </UFormField>

        <UFormField
          label="Confirm Password"
          name="confirmPassword"
          required
        >
          <UInput
            v-model="state.confirmPassword"
            placeholder="Confirm new password"
            size="lg"
            :disabled="loading"
            autocomplete="new-password"
            :type="show ? 'text' : 'password'"
            :ui="{ trailing: 'pe-1' }"
          >
            <template #trailing>
              <UButton
                color="neutral"
                variant="link"
                size="sm"
                :icon="show ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                :aria-label="show ? 'Hide password' : 'Show password'"
                :aria-pressed="show"
                aria-controls="password"
                @click="show = !show"
              />
            </template>
          </UInput>
        </UFormField>

        <div class="flex flex-col gap-3">
          <UButton
            type="submit"
            color="primary"
            size="lg"
            block
            :loading="loading"
            :disabled="passwordStrength.score < 90"
          >
            Reset Password
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
          Remember your password?
          <ULink
            to="/login"
            class="text-primary font-medium hover:underline"
          >
            Login
          </ULink>
        </div>
      </template>
    </u-page-card>
  </u-container>
</template>
