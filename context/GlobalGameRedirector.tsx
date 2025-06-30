'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLobby } from '@/context/LobbyContext'; // Import your LobbyContext

const GlobalGameRedirector = () => {
    const router = useRouter();
    const { gameToRedirectTo, clearGameRedirectData } = useLobby();

    useEffect(() => {
        if (gameToRedirectTo) {
            console.log("GlobalGameRedirector: Initiating redirection to game:", gameToRedirectTo.gameId);
            // Store game data in localStorage for the game page to pick up
            localStorage.setItem(
                "gameData",
                JSON.stringify({
                    gameId: gameToRedirectTo.gameId,
                    gameMode: gameToRedirectTo.playMode,
                    colorPreference: gameToRedirectTo.colorPreference,
                    userId: gameToRedirectTo.userId,
                })
            );
            // Perform the redirection
            router.push(`/game/${gameToRedirectTo.gameId}`);
            // Clear the redirect data immediately after redirection is initiated
            // This prevents re-triggering the redirect if the component re-renders
            clearGameRedirectData();
        }
    }, [gameToRedirectTo, router, clearGameRedirectData]); // Dependencies for the effect

    // This component doesn't render any UI, it's purely for side effects
    return null;
};

export default GlobalGameRedirector;