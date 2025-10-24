<script lang="ts" setup>
// type Props = {
//   src?: string
//   alt?: string
// }
withDefaults(defineProps<{
  src?: string
  root?: string
}>(), {
  src: ''
})
</script>

<template>
  <div
    v-if="src"
    class="absolute w-full top-px"
    :class="[root]"
  >
    <NuxtImg
      :src="src"
      v-bind="$attrs"
    />
  </div>
</template>

<style scoped>

</style>
