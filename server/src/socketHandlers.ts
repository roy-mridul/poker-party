import { Server, Socket } from 'socket.io';
import { RoomManager } from './rooms';
import {
  AckResponse,
  JoinRoomPayload,
  JoinRoomResponse,
  RoomIdPayload,
  SubmitVotePayload,
  UpdateStoryPayload,
} from './types';

export function registerSocketHandlers(io: Server, roomManager: RoomManager): void {
  io.on('connection', (socket: Socket) => {
    const broadcastRoom = (roomId: string) => {
      const view = roomManager.getRoomView(roomId);
      if (view) io.to(roomId).emit('room-updated', view);
    };

    socket.on(
      'join-room',
      (payload: JoinRoomPayload, callback: (res: JoinRoomResponse) => void) => {
        const { roomId, name, isObserver } = payload;
        if (!roomId || !roomManager.roomExists(roomId)) {
          callback({ success: false, error: 'Room not found. Check the link and try again.' });
          return;
        }
        if (!name || !name.trim()) {
          callback({ success: false, error: 'Please enter a display name.' });
          return;
        }
        roomManager.joinRoom(roomId, socket.id, name, Boolean(isObserver));
        socket.join(roomId);
        const view = roomManager.getRoomView(roomId);
        callback({ success: true, room: view ?? undefined, selfId: socket.id });
        broadcastRoom(roomId);
      },
    );

    socket.on('leave-room', (payload: RoomIdPayload) => {
      socket.leave(payload.roomId);
      const result = roomManager.leaveBySocket(socket.id);
      if (result && !result.roomDeleted) broadcastRoom(result.roomId);
    });

    socket.on(
      'submit-vote',
      (payload: SubmitVotePayload, callback?: (res: AckResponse) => void) => {
        const ok = roomManager.submitVote(payload.roomId, socket.id, payload.value);
        callback?.({ success: ok });
        if (ok) broadcastRoom(payload.roomId);
      },
    );

    socket.on('reveal-votes', (payload: RoomIdPayload) => {
      if (roomManager.revealVotes(payload.roomId)) broadcastRoom(payload.roomId);
    });

    socket.on('reset-round', (payload: RoomIdPayload) => {
      if (roomManager.resetRound(payload.roomId)) broadcastRoom(payload.roomId);
    });

    socket.on('update-story', (payload: UpdateStoryPayload) => {
      if (roomManager.updateStory(payload.roomId, payload.story)) broadcastRoom(payload.roomId);
    });

    socket.on('disconnect', () => {
      const result = roomManager.leaveBySocket(socket.id);
      if (result && !result.roomDeleted) broadcastRoom(result.roomId);
    });
  });
}
