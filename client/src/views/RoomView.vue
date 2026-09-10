<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useRoom } from '../composables/useRoom';
import type { CardValue } from '../types';
import JoinForm from '../components/JoinForm.vue';
import StoryInput from '../components/StoryInput.vue';
import CardDeck from '../components/CardDeck.vue';
import ParticipantList from '../components/ParticipantList.vue';
import ResultsView from '../components/ResultsView.vue';

const route = useRoute();
const router = useRouter();
const roomId = route.params.roomId as string;

const {
  room,
  selfId,
  myVote,
  joined,
  error,
  joinRoom,
  submitVote,
  revealVotes,
  resetRound,
  updateStory,
  leaveRoom,
} = useRoom();

const checkingRoom = ref(true);
const roomExists = ref(false);
const submitting = ref(false);
const linkCopied = ref(false);

const self = computed(() => room.value?.participants.find((p) => p.id === selfId.value) ?? null);
const isObserver = computed(() => self.value?.isObserver ?? false);
const shareUrl = computed(() => `${window.location.origin}/room/${roomId}`);

onMounted(async () => {
  try {
    const res = await fetch(`/api/rooms/${roomId}`);
    const data = (await res.json()) as { exists: boolean };
    roomExists.value = data.exists;
  } catch {
    roomExists.value = false;
  } finally {
    checkingRoom.value = false;
  }
});

onUnmounted(() => {
  if (joined.value) leaveRoom(roomId);
});

async function handleJoin(payload: { name: string; isObserver: boolean }): Promise<void> {
  submitting.value = true;
  await joinRoom(roomId, payload.name, payload.isObserver);
  submitting.value = false;
}

function handleVote(value: CardValue): void {
  submitVote(roomId, value);
}

function handleStoryChange(story: string): void {
  updateStory(roomId, story);
}

function handleReveal(): void {
  revealVotes(roomId);
}

function handleReset(): void {
  resetRound(roomId);
}

async function copyShareLink(): Promise<void> {
  await navigator.clipboard.writeText(shareUrl.value);
  linkCopied.value = true;
  setTimeout(() => (linkCopied.value = false), 1500);
}

function goHome(): void {
  if (joined.value) leaveRoom(roomId);
  router.push('/');
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 px-4 py-6">
    <div v-if="checkingRoom" class="pt-20 text-center text-slate-400">Loading room…</div>

    <div v-else-if="!roomExists" class="mx-auto mt-20 max-w-sm space-y-4 text-center">
      <h1 class="text-xl font-semibold text-slate-800">Room not found</h1>
      <p class="text-slate-500">This room doesn't exist or has already ended.</p>
      <button
        type="button"
        class="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700"
        @click="router.push('/')"
      >
        Back to home
      </button>
    </div>

    <div v-else-if="!joined" class="pt-16">
      <JoinForm :room-id="roomId" :error="error" :submitting="submitting" @submit="handleJoin" />
    </div>

    <div v-else-if="room" class="mx-auto max-w-4xl space-y-6">
      <header class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-lg font-semibold text-slate-800">Room {{ roomId }}</h1>
          <p v-if="isObserver" class="text-sm text-slate-500">You're observing this session.</p>
        </div>
        <div class="flex gap-2">
          <button
            type="button"
            class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            @click="copyShareLink"
          >
            {{ linkCopied ? 'Copied!' : 'Copy invite link' }}
          </button>
          <button
            type="button"
            class="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
            @click="goHome"
          >
            Leave room
          </button>
        </div>
      </header>

      <StoryInput :story="room.story" @change="handleStoryChange" />

      <div class="grid gap-6 lg:grid-cols-[1fr_260px]">
        <div class="space-y-6">
          <section v-if="!isObserver" class="space-y-3">
            <h2 class="text-sm font-medium text-slate-500">Pick your card</h2>
            <CardDeck :selected="myVote" :disabled="room.revealed" @select="handleVote" />
          </section>

          <section class="flex gap-3">
            <button
              type="button"
              :disabled="room.revealed"
              class="rounded-lg bg-indigo-600 px-4 py-2 font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              @click="handleReveal"
            >
              Reveal votes
            </button>
            <button
              type="button"
              class="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-100"
              @click="handleReset"
            >
              Reset round
            </button>
          </section>

          <section v-if="room.revealed">
            <h2 class="mb-3 text-sm font-medium text-slate-500">Results</h2>
            <ResultsView :participants="room.participants" />
          </section>
        </div>

        <aside class="space-y-3">
          <h2 class="text-sm font-medium text-slate-500">
            Participants ({{ room.participants.length }})
          </h2>
          <ParticipantList :participants="room.participants" :self-id="selfId" />
        </aside>
      </div>
    </div>
  </div>
</template>
