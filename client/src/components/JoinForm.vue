<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  roomId: string;
  error?: string | null;
  submitting?: boolean;
}>();

const emit = defineEmits<{
  submit: [payload: { name: string; isObserver: boolean }];
}>();

const name = ref('');
const isObserver = ref(false);

function onSubmit(): void {
  if (!name.value.trim()) return;
  emit('submit', { name: name.value.trim(), isObserver: isObserver.value });
}
</script>

<template>
  <form class="mx-auto w-full max-w-sm space-y-4" @submit.prevent="onSubmit">
    <div>
      <h1 class="text-xl font-semibold text-slate-800">Join room {{ roomId }}</h1>
      <p class="mt-1 text-sm text-slate-500">Enter a display name to join your team's session.</p>
    </div>

    <input
      v-model="name"
      type="text"
      placeholder="Your name"
      maxlength="30"
      autofocus
      class="w-full rounded-lg border border-slate-300 px-4 py-2 text-base focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
    />

    <label class="flex items-center gap-2 text-sm text-slate-600">
      <input v-model="isObserver" type="checkbox" class="h-4 w-4 rounded border-slate-300" />
      Join as observer (watch only, don't vote)
    </label>

    <p v-if="error" class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{{ error }}</p>

    <button
      type="submit"
      :disabled="submitting || !name.trim()"
      class="w-full rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {{ submitting ? 'Joining…' : 'Join room' }}
    </button>
  </form>
</template>
