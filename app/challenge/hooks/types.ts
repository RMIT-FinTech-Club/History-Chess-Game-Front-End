
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
  userId: string | null;
  accessToken: string | null;
  onPlayersUpdateAction: (players: Player[]) => void;
  onChallengeReceivedAction: (data: ChallengeData) => void;
  setIsChallengingAction: (value: boolean) => void;
}