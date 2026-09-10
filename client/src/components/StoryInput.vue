<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  story: string;
}>();

const emit = defineEmits<{
  change: [value: string];
}>();

const local = ref(props.story);
const isEditing = ref(false);
let debounceTimer: ReturnType<typeof setTimeout> | undefined;

watch(
  () => props.story,
  (value) => {
    if (!isEditing.value) local.value = value;
  },
);

function onInput(): void {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => emit('change', local.value), 400);
}

function onBlur(): void {
  isEditing.value = false;
  clearTimeout(debounceTimer);
  emit('change', local.value);
}
</script>

<template>
  <input
    v-model="local"
    type="text"
    placeholder="What are we estimating? (optional)"
    maxlength="300"
    class="w-full rounded-lg border border-slate-300 px-4 py-2 text-base text-slate-800 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
    @focus="isEditing = true"
    @input="onInput"
    @blur="onBlur"
  />
</template>
