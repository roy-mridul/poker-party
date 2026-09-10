import { ref } from 'vue';
import { io, type Socket } from 'socket.io-client';
import type { CardValue, JoinRoomResponse, RoomState } from '../types';

// Module-level singleton state: one socket connection shared by every component
// that calls useRoom(), regardless of how many times it's invoked.
let socket: Socket | null = null;

const room = ref<RoomState | null>(null);
const selfId = ref<string | null>(null);
const myVote = ref<CardValue | null>(null);
const joined = ref(false);
const error = ref<string | null>(null);

function ensureSocket(): Socket {
  if (!socket) {
    socket = io();
    socket.on('room-updated', (state: RoomState) => {
      room.value = state;
    });
  }
  return socket;
}

async function createRoom(): Promise<string> {
  const res = await fetch('/api/rooms', { method: 'POST' });
  if (!res.ok) throw new Error('Failed to create room');
  const data = (await res.json()) as { roomId: string };
  return data.roomId;
}

function joinRoom(roomId: string, name: string, isObserver: boolean): Promise<void> {
  return new Promise((resolve) => {
    error.value = null;
    ensureSocket().emit(
      'join-room',
      { roomId, name, isObserver },
      (res: JoinRoomResponse) => {
        if (res.success && res.room) {
          room.value = res.room;
          selfId.value = res.selfId ?? null;
          myVote.value = null;
          joined.value = true;
        } else {
          error.value = res.error ?? 'Unable to join room.';
        }
        resolve();
      },
    );
  });
}

function submitVote(roomId: string, value: CardValue): void {
  myVote.value = value;
  ensureSocket().emit('submit-vote', { roomId, value });
}

function revealVotes(roomId: string): void {
  ensureSocket().emit('reveal-votes', { roomId });
}

function resetRound(roomId: string): void {
  myVote.value = null;
  ensureSocket().emit('reset-round', { roomId });
}

function updateStory(roomId: string, story: string): void {
  ensureSocket().emit('update-story', { roomId, story });
}

function leaveRoom(roomId: string): void {
  socket?.emit('leave-room', { roomId });
  joined.value = false;
  room.value = null;
  myVote.value = null;
  selfId.value = null;
}

export function useRoom() {
  return {
    room,
    selfId,
    myVote,
    joined,
    error,
    createRoom,
    joinRoom,
    submitVote,
    revealVotes,
    resetRound,
    updateStory,
    leaveRoom,
  };
}
