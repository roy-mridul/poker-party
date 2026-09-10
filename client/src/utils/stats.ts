import type { Participant } from '../types';

export interface VoteStats {
  average: number | null;
  numericVotes: number;
  outlierIds: Set<string>;
}

/** Computes the average of numeric votes and flags voters whose vote deviates
 * from the mean by more than one standard deviation as outliers. */
export function computeVoteStats(participants: Participant[]): VoteStats {
  const numeric = participants
    .filter((p) => !p.isObserver && p.vote !== null && !Number.isNaN(Number(p.vote)))
    .map((p) => ({ id: p.id, value: Number(p.vote) }));

  if (numeric.length === 0) {
    return { average: null, numericVotes: 0, outlierIds: new Set() };
  }

  const sum = numeric.reduce((acc, v) => acc + v.value, 0);
  const average = sum / numeric.length;

  const outlierIds = new Set<string>();
  if (numeric.length >= 2) {
    const variance =
      numeric.reduce((acc, v) => acc + (v.value - average) ** 2, 0) / numeric.length;
    const stddev = Math.sqrt(variance);
    if (stddev > 0) {
      for (const v of numeric) {
        if (Math.abs(v.value - average) > stddev) outlierIds.add(v.id);
      }
    }
  }

  return { average, numericVotes: numeric.length, outlierIds };
}
