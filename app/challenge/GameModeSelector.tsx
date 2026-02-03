"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, Rocket, Hourglass } from "lucide-react";
import { GameMode, GameModeSelectorProps } from "./types";

const modeOptions: { label: string; value: GameMode; icon: React.ElementType }[] = [
    {
        label: 'Bullet',
        value: 'bullet',
        icon: Rocket
    },
    {
        label: 'Blitz',
        value: 'blitz',
        icon: Zap
    },
    {
        label: 'Rapid',
        value: 'rapid',
        icon: Hourglass
    },
];

export default function GameModeSelector({ selectedMode, onModeChange }: GameModeSelectorProps) {
    return (
        <div className="w-full">
            <Tabs
                value={selectedMode}
                onValueChange={(value) => onModeChange(value as GameMode)}
                className="w-full"
            >
                <TabsList className="grid w-full grid-cols-3 gap-3 bg-transparent p-0 h-auto">
                    {modeOptions.map((opt) => (
                        <TabsTrigger
                            key={opt.value}
                            value={opt.value}
                            className={`
                                relative overflow-hidden
                                flex flex-col items-center gap-2 py-4
                                border transition-all duration-300
                                data-[state=inactive]:bg-surface-glass 
                                data-[state=inactive]:border-border-glass 
                                data-[state=inactive]:text-text-muted 
                                data-[state=inactive]:hover:bg-surface-glass 
                                data-[state=inactive]:hover:text-gold-light
                                data-[state=inactive]:hover:border-gold-royal/30

                                data-[state=active]:bg-gold-royal/20 
                                data-[state=active]:border-gold-royal/60 
                                data-[state=active]:text-gold-light 
                                data-[state=active]:shadow-[0_0_20px_rgba(219,185,104,0.15)]
                            `}
                        >
                            <div className={`
                                p-2 rounded-full transition-all duration-300
                                ${selectedMode === opt.value
                                    ? 'bg-gold-royal text-bg-dark'
                                    : 'bg-surface-glass group-hover:bg-gold-royal/20'}
                            `}>
                                <opt.icon className="w-5 h-5" />
                            </div>

                            <span className="font-display font-bold uppercase tracking-wider text-xs">
                                {opt.label}
                            </span>

                            {/* Active Indicator Line */}
                            {selectedMode === opt.value && (
                                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gold-shimmer shadow-[0_-2px_6px_rgba(219,185,104,0.5)]" />
                            )}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
        </div>
    );
}