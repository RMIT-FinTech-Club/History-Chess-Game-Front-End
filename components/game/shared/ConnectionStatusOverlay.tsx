"use client";

import React from "react";
import { Loader2, WifiOff, RefreshCw } from "lucide-react";
import type { ConnectionStatus } from "@/app/game/[id]/hooks/useOnlineSocket";

interface ConnectionStatusOverlayProps {
    status: ConnectionStatus;
    className?: string;
}

/**
 * Connection Status Overlay Component
 *
 * Displays a non-disruptive overlay when connection issues occur.
 * Follows Historical Cinematic design philosophy with gold accents
 * and glass morphism effects.
 */
export const ConnectionStatusOverlay: React.FC<ConnectionStatusOverlayProps> = ({
    status,
    className = "",
}) => {
    // Only show overlay for non-connected states
    if (status === 'connected') {
        return null;
    }

    const getStatusContent = () => {
        switch (status) {
            case 'connecting':
                return {
                    icon: <Loader2 className="w-8 h-8 animate-spin text-gold-shimmer" />,
                    title: "Connecting...",
                    description: "Establishing connection to the game server",
                    bgClass: "from-amber-950/90 to-amber-900/80",
                    borderClass: "border-gold-royal/40",
                };
            case 'reconnecting':
                return {
                    icon: <RefreshCw className="w-8 h-8 animate-spin text-gold-light" />,
                    title: "Reconnecting...",
                    description: "Please wait while we restore your connection",
                    bgClass: "from-amber-950/90 to-yellow-950/80",
                    borderClass: "border-gold-shimmer/50",
                };
            case 'disconnected':
                return {
                    icon: <WifiOff className="w-8 h-8 text-red-400" />,
                    title: "Disconnected",
                    description: "Connection lost. Attempting to reconnect...",
                    bgClass: "from-red-950/90 to-red-900/80",
                    borderClass: "border-red-500/40",
                };
            case 'error':
                return {
                    icon: <WifiOff className="w-8 h-8 text-red-400" />,
                    title: "Connection Failed",
                    description: "Unable to connect. Please refresh the page.",
                    bgClass: "from-red-950/90 to-red-900/80",
                    borderClass: "border-red-500/50",
                };
            default:
                return null;
        }
    };

    const content = getStatusContent();
    if (!content) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm ${className}`}
        >
            <div
                className={`
                    relative max-w-sm mx-4 p-6 rounded-2xl
                    bg-linear-to-br ${content.bgClass}
                    border-2 ${content.borderClass}
                    shadow-2xl backdrop-blur-md
                    animate-in fade-in zoom-in-95 duration-300
                `}
            >
                {/* Glow effect */}
                <div className="absolute inset-0 -z-10 blur-xl opacity-30 rounded-2xl bg-gold-royal" />

                <div className="flex flex-col items-center text-center gap-4">
                    {/* Icon */}
                    <div className="relative">
                        <div className="absolute inset-0 blur-lg bg-gold-shimmer/30 rounded-full" />
                        {content.icon}
                    </div>

                    {/* Title */}
                    <h3 className="font-display text-xl text-gold-light tracking-wide">
                        {content.title}
                    </h3>

                    {/* Description */}
                    <p className="font-serif text-sm text-white/70">
                        {content.description}
                    </p>

                    {/* Loading dots animation for reconnecting */}
                    {(status === 'reconnecting' || status === 'connecting') && (
                        <div className="flex gap-1.5 mt-2">
                            <div className="w-2 h-2 rounded-full bg-gold-shimmer animate-bounce [animation-delay:-0.3s]" />
                            <div className="w-2 h-2 rounded-full bg-gold-shimmer animate-bounce [animation-delay:-0.15s]" />
                            <div className="w-2 h-2 rounded-full bg-gold-shimmer animate-bounce" />
                        </div>
                    )}

                    {/* Refresh button for error state */}
                    {status === 'error' && (
                        <button
                            onClick={() => window.location.reload()}
                            className="
                                mt-2 px-6 py-2 rounded-xl
                                font-display text-sm text-white
                                bg-linear-to-r from-red-700 to-red-600
                                hover:from-red-600 hover:to-red-500
                                shadow-lg hover:shadow-xl
                                transition-all duration-300
                                transform hover:scale-105 active:scale-95
                            "
                        >
                            Refresh Page
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConnectionStatusOverlay;
