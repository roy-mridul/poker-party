<script setup lang="ts">
import { computed } from 'vue';
import type { Participant } from '../types';
import { computeVoteStats } from '../utils/stats';

const props = defineProps<{
  participants: Participant[];
}>();

const voters = computed(() => props.participants.filter((p) => !p.isObserver));
const stats = computed(() => computeVoteStats(props.participants));
</script>

<template>
  <div class="space-y-4">
    <div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <div
        v-for="p in voters"
        :key="p.id"
        class="flex flex-col items-center gap-1 rounded-lg border-2 p-3"
        :class="
          stats.outlierIds.has(p.id)
            ? 'border-amber-400 bg-amber-50'
            : 'border-slate-200 bg-white'
        "
      >
        <span class="text-2xl font-bold text-slate-800">{{ p.vote ?? '—' }}</span>
        <span class="truncate text-xs text-slate-500">{{ p.name }}</span>
        <span v-if="stats.outlierIds.has(p.id)" class="text-xs font-medium text-amber-600">
          outlier
        </span>
      </div>
    </div>

    <div class="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-600">
      <template v-if="stats.average !== null">
        Average of {{ stats.numericVotes }} numeric vote{{ stats.numericVotes === 1 ? '' : 's' }}:
        <span class="font-semibold text-slate-800">{{ stats.average.toFixed(1) }}</span>
      </template>
      <template v-else> No numeric votes to average. </template>
    </div>
  </div>
</template>
