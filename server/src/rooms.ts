import { CardValue, DECK, RoomState } from './types';
import { generateRoomId } from './utils/id';

interface ServerParticipant {
  id: string;
  name: string;
  isObserver: boolean;
  vote: CardValue | null;
}

interface ServerRoom {
  roomId: string;
  story: string;
  revealed: boolean;
  participants: Map<string, ServerParticipant>;
}

const MAX_NAME_LENGTH = 30;
const MAX_STORY_LENGTH = 300;

export class RoomManager {
  private rooms = new Map<string, ServerRoom>();
  private socketToRoom = new Map<string, string>();

  createRoom(): string {
    let roomId = generateRoomId();
    while (this.rooms.has(roomId)) {
      roomId = generateRoomId();
    }
    this.rooms.set(roomId, {
      roomId,
      story: '',
      revealed: false,
      participants: new Map(),
    });
    return roomId;
  }

  roomExists(roomId: string): boolean {
    return this.rooms.has(roomId);
  }

  getRoomView(roomId: string): RoomState | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    return {
      roomId: room.roomId,
      story: room.story,
      revealed: room.revealed,
      participants: Array.from(room.participants.values()).map((p) => ({
        id: p.id,
        name: p.name,
        isObserver: p.isObserver,
        hasVoted: p.vote !== null,
        vote: room.revealed ? p.vote : null,
      })),
    };
  }

  joinRoom(roomId: string, socketId: string, name: string, isObserver: boolean): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    const cleanName = name.trim().slice(0, MAX_NAME_LENGTH) || 'Anonymous';
    room.participants.set(socketId, {
      id: socketId,
      name: cleanName,
      isObserver,
      vote: null,
    });
    this.socketToRoom.set(socketId, roomId);
    return true;
  }

  /** Removes a participant, returns the roomId they were in (if any) and whether the room is now empty. */
  leaveBySocket(socketId: string): { roomId: string; roomDeleted: boolean } | null {
    const roomId = this.socketToRoom.get(socketId);
    if (!roomId) return null;
    this.socketToRoom.delete(socketId);
    const room = this.rooms.get(roomId);
    if (!room) return null;
    room.participants.delete(socketId);
    let roomDeleted = false;
    if (room.participants.size === 0) {
      this.rooms.delete(roomId);
      roomDeleted = true;
    }
    return { roomId, roomDeleted };
  }

  submitVote(roomId: string, socketId: string, value: CardValue): boolean {
    const room = this.rooms.get(roomId);
    if (!room || room.revealed) return false;
    if (!DECK.includes(value)) return false;
    const participant = room.participants.get(socketId);
    if (!participant || participant.isObserver) return false;
    participant.vote = value;
    return true;
  }

  revealVotes(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    room.revealed = true;
    return true;
  }

  resetRound(roomId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    room.revealed = false;
    for (const participant of room.participants.values()) {
      participant.vote = null;
    }
    return true;
  }

  updateStory(roomId: string, story: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room) return false;
    room.story = story.slice(0, MAX_STORY_LENGTH);
    return true;
  }
}
