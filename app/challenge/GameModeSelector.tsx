"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Clock from "@/public/challenge/SVG/clock";
import { GameMode, GameModeSelectorProps } from "./types";

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
        <div className="h-full w-full">
            <Tabs
                value={selectedMode}
                onValueChange={(value) => onModeChange(value as GameMode)}
                className="w-full h-full flex flex-col justify-around items-center"
            >
                <TabsList className="grid w-full h-[max-content] grid-cols-3 gap-x-[2vh] bg-transparent p-0 my-auto">
                    {modeOptions.map((opt) => (
                        <TabsTrigger
                            key={opt.value}
                            value={opt.value}
                            className={`
                                h-auto w-full flex !py-4 col-span-1 group gap-4
                                !bg-black !text-white
                                data-[state=active]:!bg-[#DBB968] data-[state=active]:!text-black
                                hover:!bg-[#DBB968] hover:!text-black
                                focus:!outline-none focus:!ring-2 focus:!ring-[#DBB968]
                                transition-all duration-200
                            `}
                        >
                            <Clock
                                fill={selectedMode === opt.value ? '#000' : '#DBB968'}
                                classes="!w-10 !h-10 aspect-square bg-center group-hover:rotate-20 transition-transform duration-200"
                            />
                            <p className="text-[1.1rem] font-bold uppercase text-nowrap">{opt.label}</p>
                        </TabsTrigger>
                    ))}
                </TabsList>
                <div className="w-full my-auto">
                    {modeOptions.map((opt) => (
                        <TabsContent key={opt.value} value={opt.value}>
                            <Card>
                                <CardHeader>
                                    <CardTitle>{opt.details}</CardTitle>
                                    <CardDescription>{opt.description}</CardDescription>
                                </CardHeader>
                            </Card>
                        </TabsContent>
                    ))}
                </div>
            </Tabs>
        </div>
    );
}