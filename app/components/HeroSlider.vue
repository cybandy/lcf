<script setup lang='ts'>
type Hero = {
  title: string
  description: string
  headline: string
  links: {
    label: string
    to: string
    icon?: string | undefined
    size?: "xs" | "sm" | "md" | "lg" | "xl" | undefined
    trailing?: boolean | undefined
    target?: string | undefined
    color?: "primary" | "secondary" | "neutral" | "error" | "warning" | "success" | "info" | undefined
    variant?: "link" | "solid" | "outline" | "subtle" | "soft" | "ghost" | undefined
  }[]
  orientation?: "vertical" | "horizontal" | undefined
  reverse?: boolean | undefined
  icon?: string | undefined
  bg_image: {
    src: string
    alt?: string | undefined
    loading?: string | undefined
    srcset?: string | undefined
  }
}

type HeroSlider = {
  modelValue?: Hero[]
}

const props = withDefaults(defineProps<HeroSlider>(), {
  modelValue: () => []
})
const emits = defineEmits(['update:modelValue'])
const { modelValue } = useVModels(props, emits)

console.log(modelValue.value);
</script>

<template>
  <u-carousel
    v-slot="{ item: hero }"
    :items="modelValue"
    :autoplay="{
      delay: 5000
    }"
    dots
  >
    <UPageHero
      :title="hero.title"
      :description="hero.description"
      :links="hero.links"
      :orientation="hero.orientation"
      :reverse="hero.reverse"
      :headline="hero.headline"
      class="w-full h-full"
      :style="{
        'background-image': `url(${hero.bg_image.src})`
      }"
      :ui="{
        container: 'bg-black/40 max-w-full',
        title: 'text-neutral-50 dark:text-white',
        description: 'text-neutral-300 dark:text-neutral-300',
        root: 'bg-center bg-cover'
      }"
    >
      <template #title>
        <MDC
          :value="hero.title"
          unwrap="p"
          class=""
        />
      </template>
    </UPageHero>
  </u-carousel>
</template>
