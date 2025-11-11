<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  middleware: 'guest'
})

useSeoMeta({
  title: 'Sign up',
  description: 'Create an account to get started'
})

const { fetch: fetchUser } = useMyUserSession()

const toast = useToast()

const fields = [
  {
    name: 'firstName',
    type: 'text' as const,
    label: 'First Name',
    placeholder: 'Enter your first name',
    autocomplete: 'given-name'
  },
  {
    name: 'lastName',
    type: 'text' as const,
    label: 'Last Name',
    placeholder: 'Enter your last name',
    autocomplete: 'family-name'
  },
  {
    name: 'email',
    type: 'text' as const,
    label: 'Email',
    placeholder: 'Enter your email',
    autocomplete: 'email'
  },
  {
    name: 'password',
    label: 'Password',
    type: 'password' as const,
    placeholder: 'Enter your password',
    autocomplete: 'new-password'
  }
]

const providers = [{
  label: 'Google',
  icon: 'i-simple-icons-google',
  onClick: () => {
    toast.add({ title: 'Google', description: 'Login with Google' })
  }
}, {
  label: 'GitHub',
  icon: 'i-simple-icons-github',
  onClick: () => {
    toast.add({ title: 'GitHub', description: 'Login with GitHub' })
  }
}]

const schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.email('Invalid email'),
  password: z.string().min(8, 'Must be at least 8 characters')
})

type Schema = z.output<typeof schema>

const loading = ref(false)

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  loading.value = true
  try {
    const response = await $fetch('/api/auth/reg', {
      method: 'POST',
      body: payload.data
    })

    // Show success toast
    toast.add({
      title: 'Success!',
      description: response.message || 'Account created successfully',
      color: 'success',
      icon: 'i-heroicons-check-circle'
    })

    // update user data
    await fetchUser()
    // Redirect to onboarding page
    setTimeout(() => {
      navigateTo(response.redirect || '/onboarding')
    }, 1000)
  } catch (err) {
    // Show error toast
    const error = err as {
      data?: { statusMessage?: string }
      message?: string
    }
    toast.add({
      title: 'Registration failed',
      description: error?.data?.statusMessage || 'Please try again',
      color: 'error',
      icon: 'i-heroicons-exclamation-triangle'
    })
    console.error('Registration error:', error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <u-container class="flex items-center justify-center py-10">
    <u-page-card
      variant="subtle"
      class="max-w-sm w-full"
    >
      <UAuthForm
        :fields="fields"
        :schema="schema"
        :providers="providers"
        title="Create an account"
        :submit="{ label: 'Create account' }"
        @submit="onSubmit"
      >
        <template #description>
          Already have an account? <ULink
            to="/login"
            class="text-primary font-medium"
          >Login</ULink>.
        </template>

        <template #footer>
          By signing up, you agree to our <ULink
            to="/"
            class="text-primary font-medium"
          >Terms of Service</ULink>.
        </template>
      </UAuthForm>
    </u-page-card>
  </u-container>
</template>
