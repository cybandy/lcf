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
  class?: string
}

type HeroSlider = {
  modelValue?: Hero[]
}

const props = withDefaults(defineProps<HeroSlider>(), {
  modelValue: () => []
})
const emits = defineEmits(['update:modelValue'])
const { modelValue } = useVModels(props, emits)

// const carousel = useTemplateRef('carousel')
// const emblaApi = computed(() => carousel.value?.emblaApi)
// const activeSlide = ref(0)

// const onSelect = () => {
//   if (!emblaApi.value) return
//   activeSlide.value = emblaApi.value.selectedScrollSnap()
// }

// watch(emblaApi, (api, oldApi) => {
//   if (oldApi) {
//     oldApi.off('select', onSelect)
//   }
//   if (api) {
//     onSelect()
//     api.on('select', onSelect)
//   }
// })

// onUnmounted(() => {
//   if (emblaApi.value) {
//     emblaApi.value.off('select', onSelect)
//   }
// })
</script>

<template>
  <u-carousel
    ref="carousel"
    v-slot="{ item: hero }"
    :items="modelValue"
    :autoplay="{
      delay: 5000,
      stopOnMouseEnter: true,
      stopOnInteraction: false
    }"
    dots
    loop
  >
    <UPageHero
      
      :title="hero.title"
      :description="hero.description"
      :links="hero.links"
      :orientation="hero.orientation"
      :reverse="hero.reverse"
      :headline="hero.headline"
      class="w-full h-full"
      :class="hero.class"
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
        <Motion
        
          :initial="{
            scale: 1.1,
            opacity: 0,
            filter: 'blur(20px)'
          }"
          :animate="{
            scale: 1,
            opacity: 1,
            filter: 'blur(0px)'
          }"
          :transition="{
            duration: 0.6,
            delay: 0.1
          }"
          :while-in-view="{
            opacity: 1
          }"
        >
          <MDC
            :value="hero.title"
            unwrap="p"
            class=""
          />
        </Motion>
      </template>

      <template #headline>
        <Motion 
          :initial="{
            scale: 1.1,
            opacity: 0,
            filter: 'blur(20px)'
          }"
          :animate="{
            scale: 1,
            opacity: 1,
            filter: 'blur(0px)'
          }"
          :transition="{
            duration: 0.6,
            delay: 0.3
          }"
        >
          <span>{{ hero.headline }}</span>
        </Motion>
      </template>

      <template #description>
        <Motion 
          :initial="{
            scale: 1.1,
            opacity: 0,
            filter: 'blur(20px)'
          }"
          :animate="{
            scale: 1,
            opacity: 1,
            filter: 'blur(0px)'
          }"
          :transition="{
            duration: 0.6,
            delay: 0.3
          }"
        >
          <p>{{ hero.description }}</p>
        </Motion>
      </template>

      <template #links>
        <Motion 
          :initial="{
            scale: 1.1,
            opacity: 0,
            filter: 'blur(20px)'
          }"
          :animate="{
            scale: 1,
            opacity: 1,
            filter: 'blur(0px)'
          }"
          :transition="{
            duration: 0.6,
            delay: 0.3
          }"
          class="flex flex-wrap gap-x-6 gap-y-3"
        >
          <u-button
            v-for="(button, ind) of hero.links"
            :key="ind"
            v-bind="button"
          />
        </Motion>
      </template>
    </UPageHero>
  </u-carousel>
</template>
