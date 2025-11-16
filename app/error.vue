<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps({
  error: {
    type: Object as PropType<NuxtError>,
    required: true
  }
})

useHead({
  htmlAttrs: {
    lang: 'en'
  }
})

useSeoMeta({
  title: 'Page not found',
  description: 'We are sorry but this page could not be found.'
})

const { data: navigation } = await useAsyncData('navigation', () => queryCollectionNavigation('blog'), {
  transform: data => data.find(item => item.path === '/blog')?.children || []
})
const { data: files } = useLazyAsyncData('search', () => queryCollectionSearchSections('blog'), {
  server: false
})

const links = [{
  label: 'Home',
  icon: 'i-lucide-home',
  to: '/'
},
{
  label: 'Events',
  icon: 'i-lucide-calendar-days',
  to: '/event'
},
{
  label: 'Books',
  icon: 'i-lucide-book',
  to: '#'
},
{
  label: 'Sermon',
  icon: 'i-lucide-book',
  to: '#'
},
{
  label: 'Blog',
  icon: 'i-lucide-pencil',
  to: '/blog'
},
]
</script>

<template>
  <div>
    <AppHeader />

    <UMain>
      <UContainer>
        <UPage>
          <UError :error="error" />
        </UPage>
      </UContainer>
    </UMain>

    <AppFooter />

    <ClientOnly>
      <LazyUContentSearch
        :files="files"
        shortcut="meta_k"
        :navigation="navigation"
        :links="links"
        :fuse="{ resultLimit: 42 }"
      />
    </ClientOnly>

    <UToaster />
  </div>
</template>
