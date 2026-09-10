<script setup lang="ts">
import { DECK, type CardValue } from '../types';

const props = defineProps<{
  selected: CardValue | null;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  select: [value: CardValue];
}>();

function pick(value: CardValue): void {
  if (props.disabled) return;
  emit('select', value);
}
</script>

<template>
  <div class="grid grid-cols-5 gap-2 sm:grid-cols-10">
    <button
      v-for="card in DECK"
      :key="card"
      type="button"
      :disabled="disabled"
      class="flex aspect-[2/3] items-center justify-center rounded-lg border-2 text-lg font-semibold transition-colors sm:text-xl"
      :class="[
        selected === card
          ? 'border-indigo-500 bg-indigo-500 text-white shadow-md'
          : 'border-slate-300 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50',
        disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer',
      ]"
      @click="pick(card)"
    >
      {{ card }}
    </button>
  </div>
</template>
