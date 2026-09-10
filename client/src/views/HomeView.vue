<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useRoom } from '../composables/useRoom';

const router = useRouter();
const { createRoom } = useRoom();

const creating = ref(false);
const createError = ref<string | null>(null);
const joinCode = ref('');

async function handleCreate(): Promise<void> {
  creating.value = true;
  createError.value = null;
  try {
    const roomId = await createRoom();
    router.push(`/room/${roomId}`);
  } catch {
    createError.value = 'Could not create a room. Please try again.';
  } finally {
    creating.value = false;
  }
}

function handleJoinByCode(): void {
  const code = joinCode.value.trim().toUpperCase();
  if (code) router.push(`/room/${code}`);
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-slate-50 px-4">
    <div class="w-full max-w-sm space-y-8 text-center">
      <div>
        <h1 class="text-3xl font-bold text-slate-800">Planning Poker</h1>
        <p class="mt-2 text-slate-500">Quick, lightweight sprint estimation for your team.</p>
      </div>

      <div class="space-y-3">
        <button
          type="button"
          :disabled="creating"
          class="w-full rounded-lg bg-indigo-600 px-4 py-3 font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
          @click="handleCreate"
        >
          {{ creating ? 'Creating…' : 'Create a room' }}
        </button>
        <p v-if="createError" class="text-sm text-red-600">{{ createError }}</p>
      </div>

      <div class="flex items-center gap-2 text-xs uppercase text-slate-400">
        <span class="h-px flex-1 bg-slate-200" />
        or join an existing room
        <span class="h-px flex-1 bg-slate-200" />
      </div>

      <form class="flex gap-2" @submit.prevent="handleJoinByCode">
        <input
          v-model="joinCode"
          type="text"
          placeholder="Room code"
          maxlength="6"
          class="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-center uppercase tracking-widest focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
        />
        <button
          type="submit"
          class="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-100"
        >
          Go
        </button>
      </form>
    </div>
  </div>
</template>
