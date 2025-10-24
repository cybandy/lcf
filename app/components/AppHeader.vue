<script setup lang="ts">
const route = useRoute()

const items = computed(() => [
  // {
  //   label: 'New Here',
  //   to: '/'
  // },
  {
    label: 'About Us',
    to: '#',
  // active: route.path.startsWith('/docs')
  }, 
  {
    label: 'Sermon',
    to: '#'
  },
  {
    label: 'Community',
    to: '#'
  },
  {
    label: 'Blog',
    to: '#'
  },
  {
    label: 'Contact',
    to: '#'
  }
])
</script>

<template>
  <UHeader
    mode="slideover"
    :ui="{
      root: 'bg-inverted border-b-0'
    }"
    :toggle="{
      ui: {
        base: 'text-inverted5'
      }
    }"
  >
    <template #left>
      <NuxtLink to="/">
        <AppLogo class="size-10 shrink-0" />
      </NuxtLink>
    </template>

    <UNavigationMenu
      :items="items"
      variant="link"
    >
      <template #item-label="{ item, active }">
        <span :class="[active ? 'text-primary' : 'text-inverted']">
          {{ item.label }}
        </span>
      </template>
    </UNavigationMenu>

    <template #right>
      <UColorModeButton
        :ui="{
          base: 'text-inverted'
        }"
      />

      <UButton
        color="primary"
        variant="solid"
        to="#"
        label="Join Us"
        size="xl"
        trailing-icon="i-lucide-arrow-right"
        class="hidden lg:inline-flex"
        :ui="{ label: '' }"
      />
    </template>

    <template #body>
      <UNavigationMenu
        :items="items"
        orientation="vertical"
        class="-mx-2.5"
      />

      <USeparator class="my-6" />

      <UButton
        label="Join Us"
        color="primary"
        variant="solid"
        to="#"
        block
        class="mb-3"
      />
      <UButton
        label="Sign in"
        color="neutral"
        variant="subtle"
        to="/login"
        block
        class="mb-3"
      />
      <UButton
        label="Sign up"
        color="neutral"
        to="/signup"
        block
      />
    </template>
  </UHeader>
</template>
