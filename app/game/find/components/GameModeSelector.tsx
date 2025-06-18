"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Clock from "@/public/challenge/SVG/clock";
import { GameMode, GameModeSelectorProps } from "../types";

const modeOptions: { label: string; value: GameMode; description: string; details: string }[] = [
    { 
        label: 'blitz', 
        value: 'blitz',
        description: 'A fast-paced game mode where each player has a total of 3 minutes to make all their moves. Perfect for quick matches!',
        details: 'Blitz'
    },
    { 
        label: 'rapid', 
        value: 'rapid',
        description: 'A more relaxed game mode where each player has a total of 10 minutes to make all their moves. Ideal for players who enjoy a bit more time to think.',
        details: 'Rapid'
    },
    { 
        label: 'bullet', 
        value: 'bullet',
        description: 'An ultra-fast game mode where each player has only 1 minute to make all their moves. A true test of speed and skill!',
        details: 'Bullet'
    },
];

export default function GameModeSelector({ selectedMode, onModeChange }: GameModeSelectorProps) {
    return (
        <div className="h-auto w-full flex items-center justify-between">
            <Tabs
                value={selectedMode}
                onValueChange={(value) => onModeChange(value as GameMode)}
                className="w-full h-full"
            >
                <TabsList className="grid w-full h-full grid-cols-3 gap-x-[2vh] bg-transparent p-0 mb-4">
                    {modeOptions.map((opt) => (
                        <TabsTrigger
                            key={opt.value}
                            value={opt.value}
                            className={`
                                h-auto w-full flex bg-black !py-4 col-span-1 group gap-4
                                !bg-[#3B3433] !text-white
                                data-[state=active]:!bg-[#DBB968] data-[state=active]:!text-black
                                hover:!bg-[#DBB968] hover:!text-black
                                focus:!outline-none focus:!ring-2 focus:!ring-[#DBB968]
                                transition-all duration-200
                            `}
                        >
                            <Clock
                                fill={selectedMode === opt.value ? '#000' : '#DBB968'}
                                classes="!w-6 !h-6 aspect-square bg-center group-hover:rotate-20 transition-transform duration-200"
                            />  
                            <p className="font-bold uppercase text-nowrap">{opt.label}</p>
                        </TabsTrigger>
                    ))}
                </TabsList>
                {modeOptions.map((opt) => (
                    <TabsContent key={opt.value} value={opt.value}>
                        <Card className="bg-neutral-400/20 hover:bg-neutral-400/30 backdrop-blur-[1px] border-neutral-400/20 text-white">
                            <CardHeader>
                                <CardTitle>{opt.details}</CardTitle>
                                <CardDescription>{opt.description}</CardDescription>
                            </CardHeader>
                        </Card>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}