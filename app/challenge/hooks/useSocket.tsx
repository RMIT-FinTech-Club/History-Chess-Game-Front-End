"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import io, { Socket } from "socket.io-client";
import { toast } from "sonner";
import { UseSocketProps } from "./types";

export function useSocket({ userId, onPlayersUpdateAction, onChallengeReceivedAction, setIsChallengingAction }: UseSocketProps) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!userId) return;

        const newSocket = io("http://localhost:8080", {
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });
        setSocket(newSocket);

        newSocket.on("connect", () => {
            setIsConnected(true);
            console.log("Socket connected with ID:", newSocket.id);
            newSocket.emit("identify", userId);
            newSocket.emit("getOnlineUsers");
        });

        newSocket.on("disconnect", () => {
            setIsConnected(false);
            console.log("Socket disconnected");
        });

        newSocket.on("challengeResponse", (data: { opponentId: string, accepted: boolean }) => {
            console.log("Received challenge response:", data);
            if (data.accepted) {
                console.log("Challenge accepted!");
                toast.success("Challenge accepted! Waiting for game to start...");
            } else {
                console.log("Challenge declined");
                setIsChallengingAction(false);
                toast.info("Challenge was declined");
            }
        });

        newSocket.on("challengeError", (error: { message: string }) => {
            console.error("Challenge error:", error.message);
            setIsChallengingAction(false);
            toast.error(error.message);
        });

        newSocket.on("gameChallenge", onChallengeReceivedAction);

        newSocket.on("gameStarting", (data: {
            gameId: string,
            playMode: string,
            colorPreference: string
        }) => {
            console.log("Game starting:", data);
            toast.success("Game starting! Redirecting...");

            localStorage.setItem("gameData", JSON.stringify({
                gameId: data.gameId,
                gameMode: data.playMode,
                colorPreference: data.colorPreference,
                userId: userId
            }));
            router.push(`/game/${data.gameId}`);
        });

        newSocket.on("onlineUsers", async (users: string[]) => {
            console.log("Online users:", users);
            try {
                const userDetailsPromises = users.map(userId =>
                    fetch(`http://localhost:8080/users/${userId}`).then(res => res.json())
                );

                const responses = await Promise.all(userDetailsPromises);
                const formattedPlayers = responses
                    .map(response => ({
                        id: response.id,
                        username: response.username || 'Unknown',
                        avt: response.avt || 'https://i.imgur.com/RoRONDn.jpeg',
                        elo: response.elo || 0
                    }))
                    .filter(player => player.id !== userId);

                onPlayersUpdateAction(formattedPlayers);
            } catch (err) {
                console.error('Error fetching user details:', err);
                toast.error('Failed to load player details');
            }
        });

        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, [userId, router, onPlayersUpdateAction, onChallengeReceivedAction, setIsChallengingAction]);

    return { socket, isConnected };
}