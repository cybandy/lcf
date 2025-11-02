<script setup lang='ts'>
onBeforeMount(async () => {
  await useAsyncData('contact_details', () => queryCollection('contact_details').first())
})
</script>

<template>
  <UApp>
    <NuxtLoadingIndicator />
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
      <DevOnly>
        <div class="fixed right-6 bottom-6">
          <DevMenu />
        </div>
      </DevOnly>
    </NuxtLayout>
  </UApp>
</template>
