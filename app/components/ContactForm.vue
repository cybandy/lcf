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

function reset() {
  state.email = undefined
  state.name = undefined
  state.subject = undefined
  state.msg = undefined
}

const open = ref(false)
const _msg = ref('')
const status = ref<'success' | 'error'>('success')
const toast = useToast()
async function onSubmit(event: FormSubmitEvent<Schema>) {
  open.value = true
  status.value = 'success'
  _msg.value = 'We have received your message and we will get contact you shortly'
  // toast.add({ title: 'Success', description: 'The form has been submitted.', color: 'success' })
  // console.log(event.data)
}

watch(open, () => {
  if (open.value || status.value === 'error') return

  reset()
})
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
    <UModal
      v-model:open="open"
      title="Contact form response"
      description="Status on the submited form"
    >
      <template #content>
        <UPageCard
          variant="subtle"
          :ui="{
            container: 'flex items-center justify-center'
          }"
        >
          <div class="flex items-center justify-end">
            <UButton
              icon="i-lucide-x"
              variant="ghost"
              color="neutral"
              class="fixed top-0.5 right-0.5"
              @click="() => {
                open = !open
              }"
            />
          </div>
          <div class="text-center space-y-2">
            <UIcon
              :name="status==='error' ? 'i-lucide-x' : 'i-lucide-check'"
              class="size-10"
              :class="[status==='error' ? 'text-error' : 'text-success']"
            />
            <p class="text-highlighted text-lg xl:text-2xl capitalize">
              {{ status }}
            </p>
            <p class="text-sm sm:text-base text-muted">
              {{ _msg }}
            </p>
          </div>
        </UPageCard>
      </template>
    </UModal>
  </UForm>
</template>
