<script setup lang="ts">
const columns = [
  {
    label: 'Resources',
    children: [
      {
        label: 'Help center'
      }, 
      {
        label: 'Docs'
      }, 
      {
        label: 'Roadmap'
      }, 
      {
        label: 'Changelog'
      }
    ]
  }, 
  {
    label: 'Features',
    children: [
      {
        label: 'Affiliates'
      },
      {
        label: 'Portal'
      },
      {
        label: 'Jobs'
      }, 
      {
        label: 'Sponsors'
      }
    ]
  }
]

const toast = useToast()

const email = ref('')
const loading = ref(false)

function onSubmit() {
  loading.value = true

  toast.add({
    title: 'Subscribed!',
    description: 'You\'ve been subscribed to our newsletter.'
  })
}
</script>

<template>
  <USeparator
    icon="i-qb-bible-book"
    class="h-px"
  />

  <UFooter :ui="{ top: 'border-b border-default' }">
    <template #top>
      <UContainer>
        <UFooterColumns
          :columns="columns"
          :ui="{
            root: 'grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
            left: 'sm:mb-0 sm:mt-10 lg:mt-0',
            center: 'order-none sm:order-first lg:order-none col-span-full lg:col-span-1 grid grid-cols-2',
            right: ' lg:mt-0'
          }"
        >
          <template #left>
            <div class="space-y-2">
              <AppLogo class="shrink-0 size-20" />
              <div class="space-y-0.5">
                <p class="text-dimmed text-sm">
                  A place of fellowship, growth, and transformation
                </p>
                <div class="flex items-center">
                  <UButton
                    color="neutral"
                    variant="ghost"
                    icon="i-lucide-map-pin"
                  />
                  <p class="text-dimmed">
                    Via Vetoio (coppito), 67100, L'Aquila
                  </p>
                </div>
                <div class="flex items-center">
                  <UButton
                    color="neutral"
                    variant="ghost"
                    icon="i-lucide-clock"
                  />
                  <p class="text-dimmed">
                    Sundays at 10:00 AM
                  </p>
                </div>
              </div>
            </div>
          </template>
          <template #right>
            <form @submit.prevent="onSubmit">
              <UFormField
                name="email"
                label="Subscribe to our newsletter"
                size="lg"
              >
                <UInput
                  v-model="email"
                  type="email"
                  class="w-full"
                  placeholder="Enter your email"
                >
                  <template #trailing>
                    <UButton
                      type="submit"
                      size="xs"
                      color="neutral"
                      label="Subscribe"
                    />
                  </template>
                </UInput>
              </UFormField>
            </form>
          </template>
        </UFooterColumns>
      </UContainer>
    </template>

    <template #left>
      <p class="text-muted text-sm">
        L'Aquila Christian Fellowship
      </p>
    </template>

    <p class="text-muted text-sm">
      All rights reserved • Copyright • © {{ new Date().getFullYear() }}      
    </p>

    <template #right>
      <UButton
        to="https://www.facebook.com/share/1FvitgqbKN/?mibextid=wwXIfr"
        target="_blank"
        icon="i-simple-icons-facebook"
        aria-label="LCF on facebook"
        color="neutral"
        variant="ghost"
      />
      <UButton
        to="mailto:info.lcfaquila@gmail.com"
        target="_blank"
        icon="i-lucide-mail"
        aria-label="Send email"
        color="neutral"
        variant="ghost"
      />
    </template>
  </UFooter>
</template>
