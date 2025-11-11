<script lang="ts" setup>
const modelValue = defineModel<number[]>()

const props = withDefaults(
  defineProps<{ loading?: boolean, isSkip?: boolean }>(),
  {
    loading: false,
    isSkip: false
  },
)

const emits = defineEmits(['submit', 'skip'])

const groupsLoading = ref(false)
const { data: groups, error, execute: fetchGroups } = await useFetch('/api/group', {
  method: 'get',
  onRequest: () => {
    groupsLoading.value = true
  },
  onResponse: () => {
    setTimeout(() => {
      groupsLoading.value = false
    }, 300)
  },
  onResponseError: () => {
    groupsLoading.value = false
  },
})

const selectedGroups = ref([] as number[])

function onSubmit() {
  modelValue.value = selectedGroups.value
  emits('submit')
}

function selectGroup(id: number) {
  if (selectedGroups.value.includes(id)) {
    selectedGroups.value = selectedGroups.value.filter(x => x !== id)
  } else {
    selectedGroups.value.push(id)
  }
  modelValue.value = selectedGroups.value
}

onMounted(() => {
  if (modelValue.value) {
    selectedGroups.value = modelValue.value
  }
})
</script>

<template>
  <div class="w-full">
    <!-- Loading State -->
    <u-page-card
      v-if="groupsLoading"
      variant="ghost"
      class="flex justify-center items-center min-h-48"
    >
      <u-button
        size="xl"
        loading
      />
    </u-page-card>

    <!-- Error State -->
    <u-page-card
      v-else-if="error"
      variant="subtle"
      class="text-center"
    >
      <div class="flex flex-col items-center gap-4">
        <UIcon
          name="i-heroicons-exclamation-triangle"
          class="text-error text-4xl"
        />
        <div>
          <p class="text-lg font-semibold">
            Failed to load groups
          </p>
          <p class="text-sm text-muted">
            {{ error.message || 'An error occurred' }}
          </p>
        </div>
        <u-button
          label="Try Again"
          @click="() => { fetchGroups() }"
        />
      </div>
    </u-page-card>

    <!-- Empty State -->
    <u-page-card
      v-else-if="!groups || groups.length === 0"
      variant="subtle"
      class="text-center"
    >
      <div class="flex flex-col items-center gap-4">
        <UIcon
          name="i-heroicons-user-group"
          class="text-muted text-4xl"
        />
        <div>
          <p class="text-lg font-semibold">
            No groups available
          </p>
          <p class="text-sm text-muted">
            Check back later for volunteer opportunities
          </p>
        </div>
      </div>
    </u-page-card>

    <!-- Groups Grid -->
    <UPageGrid v-else>
      <u-page-card
        v-for="group in groups"
        :key="group.id"
        :title="group.name"
        :highlight="selectedGroups.includes(group.id)"
        highlight-color="primary"
        :description="group.description || undefined"
        :icon="
          selectedGroups.includes(group.id)
            ? 'i-lucide-check-circle'
            : 'i-lucide-circle'
        "
        variant="subtle"
        class="h-full cursor-pointer transition-all hover:shadow-lg"
        @click="() => selectGroup(group.id)"
      />

      <div class="col-span-full flex items-center justify-center gap-3 mt-4">
        <u-button
          v-if="isSkip"
          label="Skip"
          variant="ghost"
          color="neutral"
          @click="() => emits('skip')"
        />
        <u-button
          label="Submit Application"
          color="neutral"
          :loading="loading"
          :disabled="selectedGroups.length === 0"
          @click="onSubmit"
        />
      </div>
    </UPageGrid>
  </div>
</template>

<style scoped></style>
