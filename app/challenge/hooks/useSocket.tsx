"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UseSocketProps } from "./types"; // Ensure this path is correct relative to the hook

// IMPORT THE GLOBAL SOCKET CONTEXT HOOK
import { useSocketContext } from "@/context/WebSocketContext"; // ADJUST THIS PATH TO YOUR SocketContext.tsx!

export function useChallengeSocket({ // Retaining the rename for consistency
    // REMOVE THESE PROPS:
    // onPlayersUpdateAction,
    // onChallengeReceivedAction,
    setIsChallengingAction, // This one is still relevant for updating the global state on challenge response/error
}: Omit<UseSocketProps, 'onPlayersUpdateAction' | 'onChallengeReceivedAction'>) { // Update the prop type
    // Consume the socket and isConnected, userId, accessToken from the GLOBAL SocketContext
    const { socket, isConnected, userId, accessToken } = useSocketContext();
    const router = useRouter(); // Router still needed if this hook handles gameStarting redirection

    useEffect(() => {
        // Essential checks: ensure socket is connected and necessary user data is available
        if (!socket || !isConnected || !userId || !accessToken) {
            console.log("useChallengeSocket hook: Socket not ready or user data missing. Skipping event listener setup.");
            return;
        }

        console.log("useChallengeSocket hook: Socket is ready and user data available. Setting up listeners.");

        // The 'getOnlineUsers' emit is now handled by LobbyContext or could be triggered elsewhere.
        // If this hook is *only* for the challenge page's sending UI, it doesn't need to request online users.
        // If it's a general 'online users' display, then LobbyContext is the better place.
        // For now, let's remove it from here to avoid redundancy with LobbyContext.
        // socket.emit("getOnlineUsers");

        // --- Socket Event Listeners (specific to the Challenge/Lobby functionality) ---
        // These are now the main responsibilities of this hook within the challenge flow.
        socket.on("challengeResponse", (data: { opponentId: string; accepted: boolean }) => {
            console.log("Received challenge response:", data);
            if (data.accepted) {
                // toast.success is handled by LobbyContext's challengeResponse listener if it's there globally.
                // If not, keep it here. For now, assume LobbyContext handles global toasts.
            } else {
                setIsChallengingAction(false); // Update the global 'isChallengingSomeone' state via this prop
                // toast.info is handled by LobbyContext's challengeResponse listener.
            }
        });

        socket.on("challengeError", (error: { message: string }) => {
            console.error("Challenge error:", error.message);
            setIsChallengingAction(false); // Update the global 'isChallengingSomeone' state
            // toast.error is handled by LobbyContext's challengeError listener.
        });

        // 'gameChallenge' and 'onlineUsers' are now fully handled by LobbyContext.
        // REMOVE these listeners from here to avoid redundant processing:
        // socket.on("gameChallenge", onChallengeReceivedAction);
        // socket.on("onlineUsers", async (users: string[]) => { /* ... */ });

        // IMPORTANT: The gameStarting redirection is now handled within the Challenge page's own useEffect
        // and does NOT need to be inside this custom hook anymore.
        // If you want it global, move it to LobbyContext, then Challenge page observes useLobby.
        // For now, removing it from this specific hook to avoid redundancy and keep roles clear.
        // socket.on("gameStarting", (data: { gameId: string; playMode: string; colorPreference: string }) => { /* ... */ });


        // --- Cleanup Function ---
        return () => {
            if (socket) {
                console.log("useChallengeSocket hook: Cleaning up event listeners.");
                socket.off("challengeResponse");
                socket.off("challengeError");
                // Removed redundant .off calls for gameChallenge, onlineUsers, gameStarting
            }
        };
    }, [
        socket,
        isConnected,
        userId,
        accessToken,
        setIsChallengingAction, // Keep this dependency as it's a prop passed in
        router // Keep if router is used *inside* this effect (e.g. for gameStarting, but we moved that)
    ]);

    // Return the socket and its connection status from the global context
    return { socket, isConnected };
}