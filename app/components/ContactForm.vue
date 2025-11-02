<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const schema = z.object({
  name: z.string('Required'),
  email: z.email('Invalid Email'),
  subject: z.string().optional(),
  msg: z.string('Required'),
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  email: undefined,
  name: undefined,
  subject: undefined,
  msg: undefined,
})

const toast = useToast()
async function onSubmit(event: FormSubmitEvent<Schema>) {
  toast.add({ title: 'Success', description: 'The form has been submitted.', color: 'success' })
  console.log(event.data)
}
</script>

<template>
  <UForm
    :schema="schema"
    :state="state"
    class="space-y-4"
    @submit="onSubmit"
  >
    <UFormField
      label="Full Name"
      name="name"
    >
      <UInput
        v-model="state.name"
      />
    </UFormField>
    
    <UFormField
      label="Email"
      name="email"
    >
      <UInput v-model="state.email" />
    </UFormField>

    <UFormField
      label="Subject"
      name="subject"
    >
      <UInput v-model="state.subject" />
    </UFormField>

    <UFormField
      label="Message"
      name="msg"
    >
      <u-textarea
        v-model="state.msg"
        :rows="4"
        autoresize
      />
    </UFormField>

    <UButton
      type="submit"
      label="Send Message"
      icon="i-lucide-arrow-right"
      block
    />
  </UForm>
</template>
