"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { UseSocketProps } from "./types";
import axiosInstance from "@/apiConfig";
import basePath from "@/pathConfig";

export function useSocket({
    userId,
    accessToken,
    onPlayersUpdateAction,
    onChallengeReceivedAction,
    setIsChallengingAction,
}: UseSocketProps) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!userId) {
            console.warn("Skipping socket initialization: userId missing", { userId });
            toast.error("Cannot connect to server: Please log in");
            return;
        }
        if (!accessToken) {
            console.warn("Skipping socket initialization: accessToken missing", { accessToken });
            toast.error("Cannot connect to server: Authentication required");
            return;
        }

        console.log("Creating new Socket.IO instance with userId:", userId);

        const newSocket = io(`${basePath}`, {
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

        newSocket.on("connect_error", (error) => {
            console.error("Socket connection error:", error.message);
            setIsConnected(false);
            toast.error(`Failed to connect to server: ${error.message}`);
        });

        newSocket.on("disconnect", () => {
            setIsConnected(false);
            console.log("Socket disconnected");
        });

        newSocket.on("challengeResponse", (data: { opponentId: string; accepted: boolean }) => {
            console.log("Received challenge response:", data);
            if (data.accepted) {
                toast.success("Challenge accepted! Waiting for game to start...");
            } else {
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

        newSocket.on("gameStarting", (data: { gameId: string; playMode: string; colorPreference: string }) => {
            console.log("Game starting:", data);
            toast.success("Game starting! Redirecting...");
            localStorage.setItem(
                "gameData",
                JSON.stringify({
                    gameId: data.gameId,
                    gameMode: data.playMode,
                    colorPreference: data.colorPreference,
                    userId: userId,
                })
            );
            router.push(`/game/${data.gameId}`);
        });

        newSocket.on("onlineUsers", async (users: string[]) => {
            console.log("Received onlineUsers event with users:", users);
            try {
                const userDetailsPromises = users.map((userId) => {
                    console.log(`Fetching details for userId: ${userId}`);
                    return axiosInstance.get(`/users/${userId}`, {
                        headers: {
                            Authorization: `Bearer ${accessToken}`,
                        },
                    }).then((res) => {
                        console.log(`Received user data for ${userId}:`, res.data);
                        return res.data.data;
                    });
                });

                const responses = await Promise.all(userDetailsPromises);
                console.log("All user responses:", responses);

                const formattedPlayers = responses
                    .map((response) => ({
                        id: response.id,
                        username: response.username || "Unknown",
                        avt: response.avt || "https://i.imgur.com/RoRONDn.jpeg",
                        elo: response.elo || 0,
                    }))
                    .filter((player) => player.id !== userId);

                console.log("Formatted players to be sent to onPlayersUpdateAction:", formattedPlayers);
                onPlayersUpdateAction(formattedPlayers);
            } catch (err) {
                console.error("Error fetching user details:", err);
                toast.error("Failed to load player details");
            }
        });

        return () => {
            console.log("Cleaning up socket with ID:", newSocket.id);
            newSocket.disconnect();
            setSocket(null);
        };
    }, [userId, accessToken, router, onPlayersUpdateAction, onChallengeReceivedAction, setIsChallengingAction]);

    return { socket, isConnected };
}