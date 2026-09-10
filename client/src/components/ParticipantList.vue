<script setup lang="ts">
import type { Participant } from '../types';

defineProps<{
  participants: Participant[];
  selfId: string | null;
}>();
</script>

<template>
  <ul class="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
    <li
      v-for="p in participants"
      :key="p.id"
      class="flex items-center justify-between gap-3 px-4 py-2"
    >
      <div class="flex items-center gap-2 truncate">
        <span class="truncate font-medium text-slate-800">
          {{ p.name }}
          <span v-if="p.id === selfId" class="text-slate-400">(you)</span>
        </span>
        <span
          class="rounded-full px-2 py-0.5 text-xs font-medium"
          :class="p.isObserver ? 'bg-slate-100 text-slate-500' : 'bg-indigo-50 text-indigo-600'"
        >
          {{ p.isObserver ? 'Observer' : 'Voter' }}
        </span>
      </div>

      <span
        v-if="!p.isObserver"
        class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
        :class="p.hasVoted ? 'bg-emerald-500 text-white' : 'border-2 border-slate-300 text-slate-300'"
        :title="p.hasVoted ? 'Voted' : 'Waiting for vote'"
      >
        <svg v-if="p.hasVoted" viewBox="0 0 20 20" fill="currentColor" class="h-3.5 w-3.5">
          <path
            fill-rule="evenodd"
            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
            clip-rule="evenodd"
          />
        </svg>
      </span>
    </li>

    <li v-if="participants.length === 0" class="px-4 py-3 text-sm text-slate-400">
      No one's here yet.
    </li>
  </ul>
</template>
