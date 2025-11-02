<script setup lang="ts">
// api in app.vue
const c_d = computed(() => useNuxtData('contact_details').data.value)
const columns = [
  {
    label: 'Quicklinks',
    children: [
      {
        label: 'Events'
      }, 
      {
        label: 'Gallery'
      }, 
      {
        label: 'Blog'
      }, 
      {
        label: 'Sermons'
      }
    ]
  }, 
  {
    label: 'Resources',
    children: [
      {
        label: 'Sunday School'
      },
      {
        label: 'Books'
      },
      {
        label: 'Opportunities'
      }, 
      {
        label: 'Sponsorship'
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
              <AppLogo class="shrink-0 size-16" />
              <div class="space-y-0.5">
                <p class="text-dimmed text-sm">
                  Raising Christ Ambassadors in Every Sphere.>
                </p>
                <div class="flex items-center text-sm">
                  <UButton
                    color="neutral"
                    variant="ghost"
                    icon="i-lucide-map-pin"
                  />
                  <p class="text-dimmed">
                    {{ c_d?.address }}
                  </p>
                </div>
                <div class="flex items-center text-sm">
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
      <UColorModeButton />
      <u-button
        variant="ghost"
        color="neutral"
        :to="c_d?.social_media.instagram"
        target="_blank"
        icon="i-simple-icons-instagram"
      />
      <u-button
        variant="ghost"
        color="neutral"
        target="_blank"
        :to="c_d?.social_media.facebook"
        icon="i-simple-icons-facebook"
      />
      <u-button
        variant="ghost"
        color="neutral"
        target="_blank"
        :to="c_d?.social_media.x"
        icon="i-simple-icons-x"
      />
      <u-button
        variant="ghost"
        color="neutral"
        target="_blank"
        :to="c_d?.social_media.youtube"
        icon="i-simple-icons-youtube"
      />
    </template>
  </UFooter>
</template>
