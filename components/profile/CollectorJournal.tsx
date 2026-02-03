"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Book, ChevronRight, Scroll, Search } from "lucide-react";
import { dynastyLoreData } from "@/app/dynastyjourney/data/lore";
import { useAchievements } from "@/context/AchievementContext";

export default function CollectorJournal() {
    const [selectedDynastyId, setSelectedDynastyId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    const dynasties = Object.entries(dynastyLoreData).map(([id, lore]) => ({
        id: Number(id),
        ...lore
    }));

    const filteredDynasties = dynasties.filter(d =>
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.famousFigure?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Achievement Tracking
    const { trackProgress } = useAchievements();
    const [readDynasties, setReadDynasties] = useState<Set<number>>(new Set());

    const handleSelectDynasty = (id: number) => {
        setSelectedDynastyId(id);

        // Track 'legend' progress (Discover facts) when a new dynasty is opened
        if (!readDynasties.has(id)) {
            setReadDynasties(prev => new Set(prev).add(id));
            trackProgress('legend', 2); // 2 facts per dynasty read
        }
    };

    const activeLore = selectedDynastyId ? dynastyLoreData[selectedDynastyId] : null;

    return (
        <div className="w-full h-[600px] flex gap-6">
            {/* Sidebar / Index */}
            <div className="w-1/3 glass-card rounded-2xl flex flex-col overflow-hidden border border-white/10">
                <div className="p-4 border-b border-white/10 bg-black/20">
                    <div className="flex items-center gap-2 text-[#DBB968] mb-3">
                        <Book className="w-5 h-5" />
                        <h2 className="font-display text-lg">Journal Index</h2>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search history..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-9 pr-4 text-sm text-gray-300 focus:outline-none focus:border-[#DBB968]/50"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {filteredDynasties.map((dynasty) => (
                        <button
                            key={dynasty.id}
                            onClick={() => handleSelectDynasty(dynasty.id)}
                            className={`w-full text-left p-3 rounded-xl transition-all mb-1 flex items-center justify-between group ${selectedDynastyId === dynasty.id
                                ? "bg-[#DBB968]/20 border border-[#DBB968]/30"
                                : "hover:bg-white/5 border border-transparent"
                                }`}
                        >
                            <div>
                                <h3 className={`font-serif text-sm ${selectedDynastyId === dynasty.id ? "text-[#DBB968]" : "text-gray-300"}`}>
                                    {dynasty.title}
                                </h3>
                                <p className="text-[10px] text-gray-500 font-mono">{dynasty.period}</p>
                            </div>
                            {selectedDynastyId === dynasty.id && (
                                <ChevronRight className="w-4 h-4 text-[#DBB968]" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content / Scroll View */}
            <div className="flex-1 relative rounded-2xl overflow-hidden bg-[#1a1a1a] shadow-2xl border border-[#3a3a3a]">
                {/* Parchment Background Texture Effect */}
                <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/aged-paper.png')]" />

                <div className="h-full overflow-y-auto p-8 relative scrollbar-thin scrollbar-thumb-[#DBB968]/20">
                    <AnimatePresence mode="wait">
                        {activeLore ? (
                            <motion.div
                                key={selectedDynastyId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.4 }}
                                className="space-y-8 max-w-2xl mx-auto"
                            >
                                {/* Header */}
                                <div className="text-center space-y-2 border-b-2 border-[#DBB968]/30 pb-6">
                                    <div className="inline-block p-3 rounded-full bg-[#DBB968]/10 mb-2">
                                        <Scroll className="w-8 h-8 text-[#DBB968]" />
                                    </div>
                                    <h1 className="font-display text-4xl text-[#DBB968] tracking-wide">{activeLore.title}</h1>
                                    <p className="font-serif text-gray-400 italic text-lg">{activeLore.period}</p>
                                </div>

                                {/* Main Description */}
                                <div className="prose prose-invert max-w-none">
                                    <p className="text-gray-300 leading-loose font-serif text-lg first-letter:text-5xl first-letter:font-display first-letter:text-[#DBB968] first-letter:mr-3 first-letter:float-left">
                                        {activeLore.description}
                                    </p>
                                </div>

                                {/* Cultural Contributions */}
                                {activeLore.culturalContributions && (
                                    <div className="space-y-3 p-5 rounded-xl bg-gradient-to-br from-[#DBB968]/5 to-transparent border border-[#DBB968]/20">
                                        <h3 className="font-display text-lg text-[#DBB968] flex items-center gap-2">
                                            <span className="text-xl">🎨</span> Cultural Heritage
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {activeLore.culturalContributions.map((contribution, idx) => (
                                                <span
                                                    key={idx}
                                                    onMouseEnter={() => trackProgress('culture')}
                                                    className="px-3 py-1.5 rounded-full text-xs font-serif bg-[#DBB968]/10 text-[#DBB968] border border-[#DBB968]/30 hover:bg-[#DBB968]/20 transition-colors cursor-help"
                                                >
                                                    {contribution}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Key Events */}
                                <div className="space-y-4">
                                    <h3 className="font-display text-xl text-[#DBB968] flex items-center gap-2">
                                        <span className="w-8 h-[1px] bg-[#DBB968]/50" />
                                        Key Historical Events
                                        <span className="w-8 h-[1px] bg-[#DBB968]/50" />
                                    </h3>
                                    <div className="grid gap-4">
                                        {activeLore.keyEvents.map((evt, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => {
                                                    if (evt.event.includes("Battle") || evt.event.includes("War") || evt.event.includes("Defeat") || evt.event.includes("Victory")) {
                                                        trackProgress('warrior');
                                                    }
                                                }}
                                                className="flex gap-4 p-4 rounded-lg bg-white/5 border border-white/5 hover:border-[#DBB968]/30 hover:bg-white/10 transition-all cursor-pointer group"
                                            >
                                                <div className="font-display text-2xl text-[#DBB968]/80 group-hover:text-[#DBB968] group-hover:scale-110 transition-transform">{evt.year}</div>
                                                <div>
                                                    <div className="font-bold text-gray-200 group-hover:text-white">{evt.event}</div>
                                                    <div className="text-sm text-gray-400">{evt.significance}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Famous Figure */}
                                {activeLore.famousFigure && (
                                    <div className="bg-gradient-to-r from-[#DBB968]/20 to-transparent p-6 rounded-xl border-l-4 border-[#DBB968]">
                                        <h3 className="text-xs uppercase tracking-widest text-[#DBB968] mb-2">Historical Figure</h3>
                                        <div className="flex items-center gap-4">
                                            {activeLore.famousFigure.imageUrl ? (
                                                <img src={activeLore.famousFigure.imageUrl} className="w-16 h-16 rounded-full border-2 border-[#DBB968]" />
                                            ) : (
                                                <div className="w-16 h-16 rounded-full bg-[#DBB968]/30 flex items-center justify-center border-2 border-[#DBB968]">
                                                    <span className="font-display text-xl text-[#DBB968]">{activeLore.famousFigure.name[0]}</span>
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-display text-2xl text-white">{activeLore.famousFigure.name}</div>
                                                <div className="text-sm text-gray-400 font-serif italic">{activeLore.famousFigure.title} — {activeLore.famousFigure.achievement}</div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="h-16 flex items-center justify-center text-[#DBB968]/40">
                                    *** End of Record ***
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                                <Scroll className="w-16 h-16 mb-4" />
                                <p className="font-serif text-xl">Select a chronicle to begin reading</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
