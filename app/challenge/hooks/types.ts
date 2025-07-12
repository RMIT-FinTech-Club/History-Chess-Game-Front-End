

export interface Player {
  id: string;
  username: string;
  avt: string;
  elo: number;
}

export interface ChallengeData {
  challengerId: string;
  challengerName: string;
  playMode: string;
  colorPreference: string;
}

// src/app/challenge/types.ts (or wherever your types are defined)

export interface Player {
  id: string;
  username: string;
  avt: string;
  elo: number;
}

export interface ChallengeData {
  challengerId: string;
  challengerName: string;
  playMode: string;
  colorPreference: string;
}

export interface UseSocketProps {
  // REMOVED: userId: string | null;
  // REMOVED: accessToken: string | null;
  // REMOVED: onPlayersUpdateAction: (players: Player[]) => void;
  // REMOVED: onChallengeReceivedAction: (data: ChallengeData) => void;
  setIsChallengingAction: (value: boolean) => void; // This is the ONLY remaining prop needed
}