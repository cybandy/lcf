<script setup lang="ts">
const global = useAppConfig().global

const items = global.header.menu.columns

const { loggedIn } = useMyUserSession()
const open = ref(false)
</script>

<template>
  <UHeader
    v-model:open="open"
    mode="slideover"
    :ui="{
      root: 'bg-inverted border-b-0'
    }"
    :toggle="{
      color: 'neutral',
      variant: !open ? 'solid' : 'ghost'
    }"
    class="header"
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
          base: 'text-inverted hover:bg-inverted active:bg-inverted'
        }"
      />

      <UButton
        v-if="loggedIn"
        color="primary"
        variant="solid"
        to="/dashboard"
        label="Dashboard"
        size="md"
        trailing-icon="i-lucide-layout-grid"
        class="hidden lg:inline-flex"
        :ui="{ label: '' }"
      />
      <UButton
        v-else
        color="primary"
        variant="solid"
        to="/join-us"
        label="Join Us"
        size="md"
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
        to="/join-us"
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
      <!-- <UButton
        label="Sign up"
        color="neutral"
        to="/signup"
        block
      /> -->
    </template>
  </UHeader>
</template>
