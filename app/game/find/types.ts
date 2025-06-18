export interface Player {
  id: string;
  username: string;
  avt: string;
  elo: number;
}

export interface PlayerSelectorProps {
  selectedPlayer: Player;
  players: Player[];
  showPlayerSelect: boolean;
  onPlayerChangeAction: (player: Player) => void;
  onToggleSelectAction: () => void;
  onCloseSelectAction: () => void;
}

export type GameMode = "blitz" | "rapid" | "bullet";

export interface GameModeSelectorProps {
    selectedMode: GameMode;
    onModeChange: (mode: GameMode) => void;
}

export type Side = "white" | "black" | "random";

export interface SideSelectorProps {
    selectedSide: Side;
    onSideChangeAction: (side: Side) => void;
}

export const sideOptions = [
    { label: 'white', value: 'white' as Side, fill: 'white', outline: 'black' },
    { label: 'black', value: 'black' as Side, fill: 'black', outline: 'white' },
    { label: 'random', value: 'random' as Side, fill: '#C4C4C4', outline: 'white' }
];

export interface ChallengeData {
  challengerId: string;
  challengerName: string;
  playMode: string;
  colorPreference: string;
}

export interface UseMatchmakingProps {
  userId: string | null;
  selectedGameMode: GameMode;
}

export interface MatchmakingControlsProps {
  isConnected: boolean;
  isSearching: boolean;
  onFindMatchAction: () => void;
  onCancelMatchmakingAction: () => void;
}

export interface GameConfigurationProps {
  selectedGameMode: GameMode;
  selectedColor: Side;
  onGameModeChangeAction: (mode: GameMode) => void;
  onColorChangeAction: (side: Side) => void;
}
