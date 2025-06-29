'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { Player, ChallengeData } from "@/app/challenge/types"; // Adjust path if types are elsewhere
import { useSocketContext } from './WebSocketContext'; // Your global socket context
import axiosInstance from '@/apiConfig'; // Ensure this import path is correct for your axios setup

type GameRedirectData = { // New type for game redirection data
    gameId: string;
    playMode: string;
    colorPreference: string;
    userId: string;
};

type LobbyContextType = {
    onlinePlayers: Player[];
    isChallengeModalOpen: boolean;
    incomingChallengeData: ChallengeData | null;
    sendChallenge: (opponentId: string, playMode: string, colorPreference: string) => void;
    acceptChallenge: () => void;
    declineChallenge: () => void;
    isChallengingSomeone: boolean;
    setIsChallengingSomeone: (val: boolean) => void;
    gameToRedirectTo: GameRedirectData | null; // New: state for global redirection
    clearGameRedirectData: () => void; // New: function to clear redirect state
};

const LobbyContext = createContext<LobbyContextType | undefined>(undefined);

export const LobbyProvider = ({ children }: { children: React.ReactNode }) => {
    const { socket, isConnected, userId, accessToken } = useSocketContext(); // Get socket and user info from global socket context

    const [onlinePlayers, setOnlinePlayers] = useState<Player[]>([]);
    const [isChallengeModalOpen, setIsChallengeModalOpen] = useState(false);
    const [incomingChallengeData, setIncomingChallengeData] = useState<ChallengeData | null>(null);
    const [isChallengingSomeone, setIsChallengingSomeone] = useState(false);
    const [gameToRedirectTo, setGameToRedirectTo] = useState<GameRedirectData | null>(null); // Initialize new state

    // Callback to update online players, passed to the socket listener
    const handleOnlinePlayersUpdate = useCallback(async (users: string[]) => {
        console.log("LobbyContext: Received onlineUsers event with users:", users);
        try {
            if (!accessToken) {
                console.error("LobbyContext: AccessToken is missing for fetching user details.");
                return;
            }

            const userDetailsPromises = users.map((id) => {
                // CORRECTED AXIOS CALL:
                return axiosInstance.get(`/users/${id}`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                })
                    .then(res => {
                        // Axios automatically handles non-2xx statuses by throwing an error.
                        // The data is in res.data, not res.data().
                        return { success: true, data: res.data };
                    })
                    .catch(error => {
                        console.error(`LobbyContext: Error fetching user ${id}:`, error);
                        // Log the full error response from Axios if available
                        if (error.response) {
                            console.error("Error response data:", error.response.data);
                            console.error("Error response status:", error.response.status);
                            console.error("Error response headers:", error.response.headers);
                        } else if (error.request) {
                            console.error("Error request:", error.request);
                        } else {
                            console.error("Error message:", error.message);
                        }
                        return { success: false, error, userId: id };
                    });
            });

            const results = await Promise.all(userDetailsPromises);

            const formattedPlayers = results
                .filter((result): result is { success: true, data: Player } => result.success)
                .map(({ data: userData }) => ({
                    id: userData.id,
                    username: userData.username || "Unknown",
                    avt: userData.avt || "https://i.imgur.com/RoRONDn.jpeg",
                    elo: userData.elo || 0,
                }))
                .filter((player) => player.id !== userId); // Filter out current user

            setOnlinePlayers(formattedPlayers);
        } catch (err) {
            console.error("LobbyContext: Unexpected error in onlineUsers handler:", err);
            toast.error("Failed to load online player details");
        }
    }, [userId, accessToken]); // Depend on userId and accessToken

    // Callback for incoming challenges, accessible globally
    const handleIncomingChallenge = useCallback((data: ChallengeData) => {
        console.log("LobbyContext: Received game challenge:", data);
        setIncomingChallengeData(data);
        setIsChallengeModalOpen(true);
        toast.info(`Challenge from ${data.challengerName}!`);
    }, []);

    // Callback for game starting, to trigger global redirection
    const handleGameStarting = useCallback((data: { gameId: string; playMode: string; colorPreference: string }) => {
        console.log("LobbyContext: Game starting received. Setting redirect data:", data);
        if (userId) { // Ensure userId is available before setting redirect data
            setGameToRedirectTo({ ...data, userId: userId });
            toast.success("Game starting! Preparing for redirection...");
        } else {
            console.error("LobbyContext: userId not available for game starting redirection.");
        }
    }, [userId]);

    // Function to clear game redirection data after it's handled by the redirector component
    const clearGameRedirectData = useCallback(() => {
        setGameToRedirectTo(null);
    }, []);


    // --- Global Socket Listeners for Lobby Context ---
    useEffect(() => {
        if (!socket || !isConnected) {
            console.log("LobbyContext useEffect: Socket not ready or not connected. Clearing online players.");
            setOnlinePlayers([]); // Clear players if disconnected
            setGameToRedirectTo(null); // Clear any pending redirects
            return;
        }

        console.log("LobbyContext useEffect: Socket ready. Setting up global lobby listeners.");

        // Request online users when the socket connects or comes online
        socket.emit("getOnlineUsers");

        // Event listeners
        socket.on("onlineUsers", handleOnlinePlayersUpdate);
        socket.on("gameChallenge", handleIncomingChallenge);
        socket.on("gameStarting", handleGameStarting); // Moved gameStarting listener here

        socket.on("challengeResponse", (data: { opponentId: string; accepted: boolean }) => {
            if (isChallengingSomeone) {
                if (data.accepted) {
                    toast.success("Challenge accepted! Waiting for game to start...");
                } else {
                    toast.info("Your challenge was declined.");
                }
                setIsChallengingSomeone(false);
            }
        });

        socket.on("challengeError", (error: { message: string }) => {
            console.error("LobbyContext: Challenge error:", error.message);
            toast.error(error.message);
            setIsChallengingSomeone(false);
        });

        // Cleanup function for LobbyContext's listeners
        return () => {
            if (socket) {
                console.log("LobbyContext useEffect: Cleaning up global lobby listeners.");
                socket.off("onlineUsers", handleOnlinePlayersUpdate);
                socket.off("gameChallenge", handleIncomingChallenge);
                socket.off("gameStarting", handleGameStarting); // Clean up gameStarting listener
                socket.off("challengeResponse");
                socket.off("challengeError");
            }
        };
    }, [socket, isConnected, userId, accessToken, handleOnlinePlayersUpdate, handleIncomingChallenge, handleGameStarting, isChallengingSomeone]);


    // --- Global Actions for Lobby Interaction ---
    const sendChallenge = useCallback((opponentId: string, playMode: string, colorPreference: string) => {
        if (!socket || !isConnected) {
            toast.error("Not connected to the server.");
            return;
        }
        if (isChallengingSomeone) {
            toast.warning("Already sending a challenge.");
            return;
        }
        setIsChallengingSomeone(true);
        socket.emit("challengeUser", { opponentId, playMode, colorPreference });
        toast.info("Sending challenge...");
    }, [socket, isConnected, isChallengingSomeone]);

    const acceptChallenge = useCallback(() => {
        if (!socket || !incomingChallengeData) return;
        console.log("LobbyContext: Accepting challenge.");
        setIsChallengeModalOpen(false);
        toast.info("Accepting challenge...");
        socket.emit("respondToChallenge", { accept: true });
        setIncomingChallengeData(null);
    }, [socket, incomingChallengeData]);

    const declineChallenge = useCallback(() => {
        if (!socket || !incomingChallengeData) return;
        console.log("LobbyContext: Declining challenge.");
        setIsChallengeModalOpen(false);
        toast.info("Declining challenge...");
        socket.emit("respondToChallenge", { accept: false });
        setIncomingChallengeData(null);
    }, [socket, incomingChallengeData]);


    const contextValue = {
        onlinePlayers,
        isChallengeModalOpen,
        incomingChallengeData,
        sendChallenge,
        acceptChallenge,
        declineChallenge,
        isChallengingSomeone,
        setIsChallengingSomeone,
        gameToRedirectTo,       // Provide new state
        clearGameRedirectData,  // Provide new action
    };

    return (
        <LobbyContext.Provider value={contextValue}>
            {children}
        </LobbyContext.Provider>
    );
};

export const useLobby = () => {
    const context = useContext(LobbyContext);
    if (context === undefined) {
        throw new Error('useLobby must be used within a LobbyProvider');
    }
    return context;
};