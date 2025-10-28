<script setup lang='ts'>

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
