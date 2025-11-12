<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  middleware: ['guest']
})

useSeoMeta({
  title: 'Login',
  description: 'Login to your account to continue'
})

const toast = useToast()

const fields = [{
  name: 'email',
  type: 'text' as const,
  label: 'Email',
  placeholder: 'Enter your email',
  required: true
}, {
  name: 'password',
  label: 'Password',
  type: 'password' as const,
  placeholder: 'Enter your password'
}, {
  name: 'remember',
  label: 'Remember me',
  type: 'checkbox' as const
}]

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
  email: z.email('Invalid email'),
  password: z.string().min(8, 'Must be at least 8 characters')
})

type Schema = z.output<typeof schema>

const { fetch: fetchUser } = useMyUserSession()

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  // console.log('Submitted', payload)
  const _u = await $fetch('/api/auth/login', {
    method: 'POST',
    body: payload.data
  })
  if (_u.success) {
    toast.add({ title: `Welcome ${_u.user.firstName}`, description: 'Redirecting...', icon: 'i-lucide-bell', color: 'success' })

    // Redirect to onboarding page
    await fetchUser()
    setTimeout(() => {
      navigateTo('/dashboard')
    }, 1000)
  } else {
    //
    toast.add({ title: `Oops!!!`, description: _u.message, icon: 'i-lucide-x-circle', color: 'error', duration: 5000 })
  }
}
</script>

<template>
  <UContainer class="flex items-center justify-center py-10">
    <UPageCard class="max-w-sm w-full">
      <UAuthForm
        :fields="fields"
        :schema="schema"
        :providers="providers"
        title="Welcome back"
        icon="i-lucide-lock"
        @submit="onSubmit"
      >
        <template #description>
          Don't have an account? <ULink
            to="/join-us"
            class="text-primary font-medium"
          >Sign up</ULink>.
        </template>

        <template #password-hint>
          <ULink
            to="/forgot-password"
            class="text-primary font-medium"
            tabindex="-1"
          >Forgot password?</ULink>
        </template>

        <template #footer>
          By signing in, you agree to our <ULink
            to="/"
            class="text-primary font-medium"
          >Terms of Service</ULink>.
        </template>
      </UAuthForm>
    </UPageCard>
  </UContainer>
</template>
