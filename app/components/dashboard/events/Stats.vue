<script setup lang='ts'>
import type { ButtonProps } from '@nuxt/ui'

export type EventStat = {
  title: string
  icon: string
  value: number
  color: NonNullable<ButtonProps['color']>
  guests: number | undefined
}
type Props = {
  stats?: EventStat[]
}
const props = withDefaults(defineProps<Props>(), {
  stats: () => ([
    {
      title: 'Attending',
      icon: 'i-lucide-check-circle',
      value: 4,
      color: 'secondary',
      guests: 2,
    },
    {
      title: 'Maybe',
      icon: 'i-lucide-help-circle',
      value: 10,
      color: 'warning',
      guests: 5,
    },
    {
      title: 'Not Attending',
      icon: 'i-lucide-help-circle',
      value: 12,
      color: 'error',
      guests: undefined,
    },
    {
      title: 'Checked In',
      icon: 'i-lucide-users',
      value: 6,
      color: 'success',
      guests: undefined,
    },
  ])
})

type ClassStyle = Record<EventStat['color'], string>

const iconStyle: ClassStyle = {
  primary: 'text-primary',
  secondary: 'text-secondary',
  success: 'text-success',
  info: 'text-info',
  warning: 'text-warning',
  error: 'text-error',
  neutral: 'text-neutral',
}

const otherStyle: ClassStyle = {
  error: 'bg-error/10 ring ring-error/25',
  neutral: 'bg-neutral/10 ring ring-neutral/25',
  primary: 'bg-primary/10 ring ring-primary/25',
  secondary: 'bg-secondary/10 ring ring-secondary/25',
  success: 'bg-success/10 ring ring-success/25',
  info: 'bg-info/10 ring ring-info/25',
  warning: 'bg-warning/10 ring ring-warning/25',
}
</script>

<template>
  <u-page-grid class="lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-px">
    <u-page-card
      v-for="(stat, ind) of props.stats"
      :key="ind"
      :title="stat.title"
      :icon="stat.icon"
      variant="subtle"
      orientation="horizontal"
      :ui="{
        container: 'gap-y-1.5',
        wrapper: 'items-start',
        leading: ['p-2.5 rounded-full ring ring-inset flex-col', otherStyle[stat.color]].join(' '),
        title: 'font-normal text-muted text-xs uppercase',
        leadingIcon: iconStyle[stat.color]
      }"
      class="lg:rounded-none first:rounded-l-lg last:rounded-r-lg hover:z-1"
    >
      <div class="flex flex-col items-center gap-2">
        <span class="text-2xl font-semibold text-highlighted">
          {{ stat.value }}
        </span>

        <!-- <UBadge
                v-if="stat.guests"
                :color="'neutral'"
                variant="subtle"
                size="xs"
                class="text-xs shrink"
              >
                Guest: #{{ stat.guests }}
              </UBadge> -->
      </div>
    </u-page-card>
  </u-page-grid>
</template>
