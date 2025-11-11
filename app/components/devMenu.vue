<script setup lang="ts">
const isDev = import.meta.dev
const { user, clear } = useMyUserSession()
const items = ref([
  [
    {
      label: 'Dev Page',
      to: isDev ? '/dev' : undefined
    },
    {
      label: 'Logout',
      onSelect: () => {
        clear()
        // navigateTo('/login')
      }
    }
  ],
])
</script>

<template>
  <UDropdownMenu :items="items">
    <UButton
      icon="i-lucide-menu"
      color="neutral"
      variant="outline"
    />
  </UDropdownMenu>
</template>
