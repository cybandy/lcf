<script setup lang="ts">
export type Country = {
  name: string
  code: string
  emoji: string
};
const {
  data: countries,
  status,
  execute,
} = await useLazyFetch<Country[]>('/api/countries.json', {
  immediate: false,
  key: 'country-list',
  default: () => [],
});

function onOpen() {
  if (!countries.value?.length) {
    execute();
  }
}

const props = withDefaults(defineProps<{ modelValue?: string }>(), {
  modelValue: '',
});
const emits = defineEmits(['update:modelValue']);

const { modelValue: country } = useVModels(props, emits);

watch(country, () => {
  console.log(country.value);
});

// function getCountryFromName(name: string) {
//   const _def = { name: '', code: '', emoji: '' };
//   if (!countries.value.length) return _def;
//   const _c = countries.value.find((x) => x.name === name);
//   return _c ? _c : _def;
// }

const getCountryFromName = computed(() => {
  {
    const _def = { name: '', code: '', emoji: '' };
    if (countries.value.length === 0) return _def;
    const _c = countries.value.find(x => x.name === country.value);
    // console.log(_c);

    return _c ? _c : _def;
  }
});

onBeforeMount(async () => {
  onOpen();
});
</script>

<template>
  <USelectMenu
    v-model="country"
    :items="countries"
    :loading="status === 'pending'"
    label-key="name"
    value-key="name"
    :search-input="{ icon: 'i-lucide-search' }"
    placeholder="Select country"
    class="w-48"
    @update:open="onOpen"
  >
    <template #leading="{ modelValue: _m, ui }">
      <!-- <span
        v-if="_m"
        class="size-5 text-center"
      >
        {{ getCountryFromName.emoji }}
      </span> -->
      <UAvatar
        v-if="_m"
        :src="`https://flagcdn.com/${getCountryFromName.code.toLowerCase()}.svg`"
        :alt="getCountryFromName.name"
        class="size-5 text-center"
      />
      <UIcon
        v-else
        name="i-lucide-earth"
        :class="ui.leadingIcon()"
      />
    </template>
    <template #item-leading="{ item }">
      <!-- <span class="size-5 text-center">
        {{ item.emoji }}
      </span> -->
      <UAvatar
        :src="`https://flagcdn.com/${item.code.toLowerCase()}.svg`"
        :alt="item.name"
        class="size-5 text-center"
      />
    </template>
  </USelectMenu>
</template>
