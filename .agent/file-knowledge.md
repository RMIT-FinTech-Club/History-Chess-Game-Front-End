# History Chess Game - Frontend File Knowledge

> **Last Updated**: December 13, 2025

## Overview
This is a **Next.js 15 (App Router)** frontend for the History Chess Game platform. It interacts with the Fastify backend via REST APIs and Socket.IO for real-time multiplayer functionality.

---

## Technology Stack
| Component | Technology |
|-----------|------------|
| **Framework** | Next.js 15 (App Router) with React 19 |
| **Language** | TypeScript |
| **Styling** | TailwindCSS 4, Shadcn UI, FontAwesome, Lucide React |
| **State Management** | Zustand (`GlobalStorage`), React Context (`WebSocketContext`, `LobbyContext`) |
| **Real-time** | Socket.IO Client (`socket.io-client`) |
| **Chess Logic** | `chess.js` (logic), `react-chessboard` (UI) |
| **Forms** | React Hook Form + Zod |
| **Notifications** | Sonner |

---

## Project Structure

```
History-Chess-Game-Front-End/
├── app/                    # Next.js App Router pages
│   ├── game/              # Game pages (lobby, play, offline)
│   ├── challenge/         # Matchmaking & challenges
│   ├── home/              # Landing/Home page
│   ├── sign_in/           # Authentication pages
│   ├── sign_up/           # Registration
│   ├── profile/           # User profile
│   └── layout.tsx         # Root layout with providers
├── components/             # Reusable UI components
│   ├── ui/                # Shadcn UI primitives
│   ├── decor/             # Decorative elements (e.g., YellowLight)
│   └── ...                # Feature-specific components
├── context/                # React Context Providers
│   ├── WebSocketContext.tsx # Global Socket.IO connection
│   ├── LobbyContext.tsx   # Matchmaking & Challenge state
│   ├── UserContext.tsx    # User session context
│   └── ClientWrapper.tsx  # Wraps providers for the app
├── hooks/                  # Global hooks
│   ├── GlobalStorage.ts   # Zustand store for Auth (JWT, User Info)
│   └── ...
├── lib/                    # Utilities (`utils.ts`)
├── config/                 # App configuration (`apiConfig.ts`, `pathConfig.ts`)
├── public/                 # Static assets
└── ...
```

---

## Core Features & Files

### 1. Authentication
**File**: `hooks/GlobalStorage.ts`
- Uses **Zustand** to manage `userId`, `accessToken`, `avatar`, etc.
- Persists data using **Cookies** (`js-cookie`) and **localStorage** (for avatar).
- `setAuthData`: saves tokens and user info.
- `clearAuth`: logs out and removes cookies.

### 2. Real-time Connection
**File**: `context/WebSocketContext.tsx`
- Initializes a global `Socket.IO` connection using `accessToken` from `GlobalStorage`.
- Manages `isConnected` state.
- Handles `connect` and `disconnect` events.
- Provides `socket` instance to the rest of the app via `useSocketContext()`.

### 3. Matchmaking & Lobby
**File**: `context/LobbyContext.tsx`
- Manages `onlinePlayers`, `incomingChallengeData`.
- Functions: `sendChallenge`, `acceptChallenge`, `declineChallenge`.
- Handles redirection to game upon successful match.

### 4. Gameplay (Online)
**Directory**: `app/game/[id]/`
- **`page.tsx`**: Main game container. Orchestrates hooks and layout.
- **`components/`**:
  - `GameLayout`: Renders the board (`react-chessboard`), timers, captured pieces, and move history.
  - `GameOverDialog`: Displays modal when game ends.
- **`hooks/`**:
  - `useOnlineSocket.tsx`: Listens for game events (`gameState`, `moveMade`, `gameOver`). Sends moves via `socket.emit('move')`.
  - `useGameState.tsx`: Manages local game state (FEN, turn, checkmate, etc.).
  - `useChessHandlers.tsx`: Wrapper around `chess.js` logic for move validation on the UI side.
  - `useMoveHandler.tsx`: Coordinates UI moves with socket updates.

### 5. API Configuration
**File**: `config/apiConfig.ts` (implied) & `next.config.ts`
- `next.config.ts` configures remote patterns for AWS S3 avatar images.
- `pathConfig.ts` likely defines the Backend Base URL.

---

## Game Lifecycle Flow

1.  **Auth**: User logs in → `GlobalStorage` sets tokens → `WebSocketContext` connects socket.
2.  **Matchmaking**:
    -   User enters Lobby/Challenge page.
    -   `LobbyContext` handles "Find Match" or direct User Challenge.
    -   On success, redirects to `/game/[gameId]`.
3.  **Game Initialization**:
    -   `/game/[id]/page.tsx` mounts.
    -   `useOnlineSocket` emits `joinGame`.
    -   Server sends initial `gameState`.
4.  **Moves**:
    -   User drags piece → `react-chessboard`.
    -   `useChessHandlers` validates with `chess.js`.
    -   `useMoveHandler` calls `useOnlineSocket.sendMove()`.
    -   Socket emits `move` to server.
    -   Server confirms → `useOnlineSocket` receives `moveMade` → updates UI.
5.  **Game Over**:
    -   Server emits `gameOver`.
    -   `GameOverDialog` appears with results and ELO changes.

---

## Key Dependencies for Review
- `chess.js`: ^1.4.0 (Game Logic)
- `react-chessboard`: ^4.7.3 (Board UI)
- `socket.io-client`: ^4.8.1 (Realtime)
- `zustand`: ^5.0.5 (State)
- `tailwindcss`: ^4.1.10 (Styling)
