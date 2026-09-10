// Shared conceptually with client/src/types.ts — keep both in sync when changing.

export const DECK = ['0', '1', '2', '3', '5', '8', '13', '21', '?', '☕'] as const;
export type CardValue = (typeof DECK)[number];

export interface Participant {
  id: string; // socket id
  name: string;
  isObserver: boolean;
  hasVoted: boolean;
  vote: CardValue | null; // only populated once the round is revealed
}

export interface RoomState {
  roomId: string;
  story: string;
  revealed: boolean;
  participants: Participant[];
}

// ---- Client -> Server payloads ----

export interface JoinRoomPayload {
  roomId: string;
  name: string;
  isObserver: boolean;
}

export interface SubmitVotePayload {
  roomId: string;
  value: CardValue;
}

export interface UpdateStoryPayload {
  roomId: string;
  story: string;
}

export interface RoomIdPayload {
  roomId: string;
}

// ---- Server -> Client responses ----

export interface JoinRoomResponse {
  success: boolean;
  error?: string;
  room?: RoomState;
  selfId?: string;
}

export interface AckResponse {
  success: boolean;
  error?: string;
}
