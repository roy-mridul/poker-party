# Planning Poker

A minimal, lean Planning Poker app for sprint estimation. Create a room, share
the link, vote with a Fibonacci deck, reveal together, reset for the next
story. No accounts, no database — everything lives in memory for the life of
the process.

## Stack

- **Server**: Node.js + Express + Socket.IO (`/server`)
- **Client**: Vue 3 (`<script setup>`) + TypeScript + Tailwind CSS, built with Vite (`/client`)
- **State**: in-memory only — rooms disappear once everyone leaves or the process restarts
- **Deployment**: a single Node process serves the built frontend as static files from Express (same origin, no CORS)
- **Package manager**: [pnpm](https://pnpm.io) workspaces (`client` + `server`)

## Project structure

```
/server       Express + Socket.IO backend
  /src
    index.ts            Express app, static file serving, HTTP entry point
    rooms.ts             In-memory RoomManager (create/join/vote/reveal/reset)
    socketHandlers.ts    Socket.IO event wiring
    types.ts             Shared types/interfaces for room state & socket payloads

/client       Vue + TS + Tailwind frontend (Vite)
  /src
    composables/useRoom.ts     socket.io-client wrapper, room state, exposed methods
    components/CardDeck.vue
    components/ParticipantList.vue
    components/ResultsView.vue
    components/StoryInput.vue
    components/JoinForm.vue
    views/HomeView.vue
    views/RoomView.vue
    types.ts              Mirrors server/src/types.ts
```

## Running locally

This project uses [pnpm](https://pnpm.io) workspaces (`client` and `server`
are workspace packages, see `pnpm-workspace.yaml`). The root `package.json`
pins the exact version via `packageManager`, so running any `pnpm` command
through [Corepack](https://nodejs.org/api/corepack.html) automatically uses
the right version:

```bash
corepack enable   # one-time, if you haven't already
```

### 1. Install dependencies

From the repo root:

```bash
pnpm install
```

This installs dependencies for the root, `server`, and `client` workspace
packages in one go and writes a single `pnpm-lock.yaml`.

### 2. Dev mode

```bash
pnpm dev
```

This runs the Express/Socket.IO server (`http://localhost:3001`) and the Vite
dev server (`http://localhost:5173`) concurrently. The Vite dev server proxies
`/api` and `/socket.io` requests to the backend, so open
**http://localhost:5173** in your browser — no CORS configuration needed.

### 3. Production build

```bash
pnpm build
```

This builds the Vue app to `client/dist` and compiles the server's TypeScript
to `server/dist`. Then start the single production process:

```bash
pnpm start
```

Express serves the built frontend as static files and the API/Socket.IO on
the same origin and port (default `3001`, override with `PORT`). Open
**http://localhost:3001**.

## Deploying to Render

This app runs as a single Node web service on Render's free tier.

1. Push this repo to GitHub (or connect it directly).
2. Create a new **Web Service** on Render pointing at the repo.
3. Configure:
   - **Build Command**: `corepack enable && pnpm install && pnpm build`
   - **Start Command**: `pnpm start`
   - **Environment**: Node
4. **Environment variables**: none are required. Render sets `PORT`
   automatically and the server reads it via `process.env.PORT` (see
   `server/src/index.ts`); it falls back to `3001` if unset.

Because the client is built into static files and served by Express from the
same origin as the API and Socket.IO, there's nothing else to configure — no
CORS origins, no separate static site, no database add-on.

## How it works

- **Create a room**: the home page calls `POST /api/rooms`, which generates a
  short room ID and returns it; the client navigates to `/room/:roomId`.
- **Join a room**: entering the room URL prompts for a display name and an
  optional "join as observer" checkbox, then joins over Socket.IO
  (`join-room`). Joining a room ID that doesn't exist shows a clear
  "Room not found" message instead of crashing.
- **Voting**: voters pick a card from the Fibonacci deck (`0, 1, 2, 3, 5, 8,
  13, 21, ?, ☕`). Other participants only see a "voted" indicator, never the
  value, until the round is revealed.
- **Reveal**: any participant can trigger `reveal-votes`; all votes become
  visible to everyone, along with the average of numeric votes and outliers
  highlighted (votes more than one standard deviation from the mean).
- **Reset**: any participant can trigger `reset-round`, clearing all votes and
  un-revealing without removing anyone from the room.
- **Observers**: join with the observer checkbox to watch without a voting
  card; they're excluded from the average and outlier calculation.
- **Disconnects**: closing a tab or leaving the room removes that participant
  from the live participant list for everyone else.

All room state is held in memory in `server/src/rooms.ts` — there is no
persistence layer, so restarting the server clears all rooms.
