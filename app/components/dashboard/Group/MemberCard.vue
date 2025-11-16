<script setup lang="ts">
import type { GroupMember } from '../../../composables/useGroups'

interface Props {
  member: GroupMember
}
const props = defineProps<Props>()

const fullName = computed(() => `${props.member.user.firstName} ${props.member.user.lastName}`)
const roleLabel = computed(() => props.member.role === 'leader' ? 'Group Leader' : 'Member')
</script>

<template>
  <UPageCard
    variant="outline"
    orientation="vertical"
    :ui="{
      wrapper: '',
      root: 'relative'
    }"
  >
    <div class="w-full flex flex-col items-center text-center">
      <UAvatar
        :src="member.user.avatar || undefined"
        :alt="fullName"
        class="size-28 md:size-48"
      />
      <div class="pt-5 space-y-1">
        <p class="text-lg sm:text-xl md:text-2xl">
          {{ fullName }}
        </p>
        <p class="text-sm text-muted">
          {{ member.role }}
        </p>
        <p
          v-if="member.user.email"
          class="text-sm text-dimmed"
        >
          {{ member.user.email }}
        </p>

        <UBadge
          v-if="member.user.status"
          :label="member.user.status"
          :color="member.user.status === 'active' ? 'success' : 'neutral'"
          variant="subtle"
          class="mt-2"
        />
      </div>
    </div>
  </UPageCard>
</template>
