import { useState, useEffect } from "react";
import { GameState } from "../types";
import { io, Socket } from "socket.io-client";
import basePath from "@/config/pathConfig";
import axios from "axios";
import { useGlobalStorage } from "@/hooks/GlobalStorage";

type PlayerProfile = {
  name: string;
  image: string;
  elo?: number;
};

export const useGameState = () => {
  
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [boardOrientation, setBoardOrientation] = useState<"white" | "black">("white");
  const [moveHistory, setMoveHistory] = useState<Array<{
    moveNumber: number;
    move: string;
    color: string;
    time: number;
  }>>([]);
  const { userId, accessToken } = useGlobalStorage()
  
  const [moveTimings, setMoveTimings] = useState<string[]>([]);
  const [capturedWhite, setCapturedWhite] = useState<string[]>([]);
  const [capturedBlack, setCapturedBlack] = useState<string[]>([]);
  const [autoRotateBoard, setAutoRotateBoard] = useState(false);
  const [whiteProfile, setWhiteProfile] = useState<PlayerProfile>({ 
    name: "White", 
    image: "/footer/footer_bear.svg" 
  });
  const [blackProfile, setBlackProfile] = useState<PlayerProfile>({ 
    name: "Black", 
    image: "/footer/footer_bear.svg" 
  });

  const fetchUsers = async () => {
    const userList = gameState?.players;
    console.log("userList", userList);

    const whiteUser = userList[0];
    const blackUser = userList[1];
    

    if (whiteUser) {
      axios.get(`${basePath}/users/${whiteUser}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        }
    })
      .then((response) => {
        setWhiteProfile({
          name: response.data.username,
          image: response.data.avatarUrl,
          elo: response.data.elo
        });
      })
    }
    if (blackUser) {
      axios.get(`${basePath}/users/${blackUser}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        }
    })
      .then((response) => {
        setBlackProfile({
          name: response.data.username,
          image: response.data.avatarUrl,
          elo: response.data.elo
        });
      })
    }
  };
  
  // Update board orientation when auto-rotate changes
  useEffect(() => {
    fetchUsers();
    if (gameState && autoRotateBoard) {
      setBoardOrientation(gameState.turn === "w" ? "white" : "black");
    } else if (gameState?.playerColor) {
      setBoardOrientation(gameState.playerColor);
    }
  }, [gameState?.turn, autoRotateBoard, gameState?.playerColor]);

  return {
    gameState,
    setGameState,
    boardOrientation,
    setBoardOrientation,
    moveHistory,
    setMoveHistory,
    moveTimings,
    setMoveTimings,
    capturedWhite,
    setCapturedWhite,
    capturedBlack,
    setCapturedBlack,
    autoRotateBoard,
    setAutoRotateBoard,
    whiteProfile,
    setWhiteProfile,
    blackProfile,
    setBlackProfile,
  };
};