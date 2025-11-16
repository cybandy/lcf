<script setup lang="ts">
import { checkPasswordStrength } from '~~/shared/utils/misc';

const show = ref(false);

const props = withDefaults(defineProps<{ modelValue?: string }>(), {
  modelValue: '',
});
const emits = defineEmits(['update:modelValue']);

const { modelValue: password } = useVModels(props, emits);

const p_str = computed(() => checkPasswordStrength(password.value));

const color = computed(() => {
  if (p_str.value.score < 90) return 'error';
  if (p_str.value.score === 90) return 'warning';
  return 'success';
});

const text = computed(() => {
  if (p_str.value.score === 0) return 'Enter a password';
  if (p_str.value.score < 50) return 'Extremely weak password';
  if (p_str.value.score <= 80) return 'Weak password';
  if (p_str.value.score === 90) return 'Medium password';
  return 'Strong password';
});
</script>

<template>
  <div class="space-y-2">
    <UFormField label="Password">
      <UInput
        v-model="password"
        placeholder="Password"
        :color="color"
        :type="show ? 'text' : 'password'"
        :ui="{ trailing: 'pe-1' }"
        :aria-invalid="p_str.score < 100"
        aria-describedby="password-strength"
        class="w-full"
      >
        <template #trailing>
          <UButton
            color="neutral"
            variant="link"
            size="sm"
            :icon="show ? 'i-lucide-eye-off' : 'i-lucide-eye'"
            :aria-label="show ? 'Hide password' : 'Show password'"
            :aria-pressed="show"
            aria-controls="password"
            @click="show = !show"
          />
        </template>
      </UInput>
    </UFormField>

    <UProgress
      :color="color"
      :indicator="text"
      :model-value="p_str.score"
      :max="100"
      size="sm"
    />

    <p
      id="password-strength"
      class="text-sm font-medium"
    >
      {{ text }}. Must contain:
    </p>

    <ul
      class="space-y-1"
      aria-label="Password requirements"
    >
      <li
        v-for="(req, index) in p_str.strength"
        :key="index"
        class="flex items-center gap-0.5"
        :class="req.met ? 'text-success' : 'text-muted'"
      >
        <UIcon
          :name="req.met ? 'i-lucide-circle-check' : 'i-lucide-circle-x'"
          class="size-4 shrink-0"
        />

        <span class="text-xs font-light">
          {{ req.text }}
          <span class="sr-only">
            {{ req.met ? ' - Requirement met' : ' - Requirement not met' }}
          </span>
        </span>
      </li>
    </ul>
  </div>
</template>
