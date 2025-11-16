<script setup lang="ts">
import type { GroupWithMembers, GroupBasic, GroupMember } from '../../../composables/useGroups'

interface Props {
  group: GroupWithMembers | GroupBasic
}
const props = defineProps<Props>()

const memberAvatars = computed(() => {
  if (!('members' in props.group)) return []
  return props.group.members.slice(0, 5).map(m => ({
    src: m.user.avatar || undefined,
    alt: `${m.user.firstName} ${m.user.lastName}`,
  }))
})

const groupMembers = computed(() => {
  if (!('members' in props.group)) return { leaders: [], members: [] }
  const res = {
    leaders: [] as GroupMember[],
    members: [] as GroupMember[]
  }
  props.group.members.forEach((x) => {
    if (x.role === 'leader') {
      res.leaders.push(x)
    } else {
      res.members.push(x)
    }
  })
  return res
})

const memberCount = computed(() => ('members' in props.group ? props.group.members.length : 0))
</script>

<template>
  <UPageCard
    :title="group.name"
    :description="group.description || 'No description provided.'"
    :to="`/dashboard/groups/${group.id}`"
  >
    <div class="grid grid-cols-2">
      <div
        v-if="groupMembers.leaders.length"
        class="flex gap-1 items-baseline"
      >
        <p class="text-sm text-pretty font-medium pb-2">
          {{ groupMembers.leaders.length > 1 ?'Leaders' : 'Leader' }}
        </p>
        <UAvatarGroup
          size="sm"
          max="1"
        >
          <ULink
            v-for="(m, i) in groupMembers.leaders"
            :key="i"
            :to="`/dashboard/profile/${m.user.id}`"
            class="hover:ring-primary transition"
            raw
          >
            <UTooltip :text="`${m.user.firstName} ${m.user.lastName}`">
              <UAvatar
                :src="m.user.avatar || undefined"
                :alt="`${m.user.firstName} ${m.user.lastName}`"
              />
            </UTooltip>
          </ULink>
        </UAvatarGroup>
      </div>
      <div v-if="groupMembers.members">
        <div class="flex gap-1 items-baseline">
          <p class="text-sm text-pretty font-medium pb-2">
            {{ groupMembers.members.length > 1 ?'Members' : 'Member' }}
          </p>
          <UBadge
            color="neutral"
            :label="memberCount"
            size="sm"
            variant="subtle"
          />
        </div>
        <UAvatarGroup
          :max="3"
          size="xs"
        >
          <ULink
            v-for="(m, i) in groupMembers.members"
            :key="i"
            :to="`/dashboard/profile/${m.user.id}`"
            class="hover:ring-primary transition"
            raw
          >
            <UTooltip :text="`${m.user.firstName} ${m.user.lastName}`">
              <UAvatar
                :src="m.user.avatar || undefined"
                :alt="`${m.user.firstName} ${m.user.lastName}`"
              />
            </UTooltip>
          </ULink>
        </UAvatarGroup>
      </div>
    </div>
    <!-- <template #footer>
      <div class="flex justify-end">
        <UButton
          :to="`/dashboard/groups/${group.id}`"
          icon="i-lucide-users"
          label="View Details"
          color="primary"
        />
      </div>
    </template> -->
  </UPageCard>
</template>
