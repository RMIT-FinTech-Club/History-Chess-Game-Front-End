"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HistoricalContext } from "@/features/market/api/marketApi";
import { BookOpen, Crown, Scroll } from "lucide-react";

interface HistoricalTooltipProps {
    children: React.ReactNode;
    context?: HistoricalContext;
    dynasty?: string;
    itemRarity?: string;
    delay?: number;
    side?: "left" | "right";
}


// Fallback data generator based on dynasty
const getFallbackContext = (dynasty: string): HistoricalContext => {
    const defaultData: Record<string, HistoricalContext> = {
        "Đinh": {
            era: "968–980",
            significance: "The first Vietnamese dynasty to claim emperor status (Hoàng đế) after 1000 years of northern domination.",
            keyFacts: ["Established by Đinh Bộ Lĩnh", "Named the country Đại Cồ Việt", " Introduced the first regular army"],
            famousFigure: { name: "Đinh Tiên Hoàng", title: "Emperor", connection: "Founder" },
            culturalImpact: "Laid the foundation for an independent Vietnamese state structure."
        },
        "Tiền Lê": {
            era: "980–1009",
            significance: "Famous for defeating the Song dynasty invasion and stabilizing the nation.",
            keyFacts: ["Founded by Lê Hoàn", "Victorious Battle of Bạch Đằng (981)", "Promoted Buddhism"],
            famousFigure: { name: "Lê Đại Hành", title: "Emperor", connection: "Founder" }
        },
        "Lý": {
            era: "1009–1225",
            significance: "A golden era of Buddhism, art, and centralized administration. Moved capital to Thăng Long (Hanoi).",
            keyFacts: ["Founded by Lý Thái Tổ", "Built the Temple of Literature", "Renamed country to Đại Việt"],
            famousFigure: { name: "Lý Thái Tổ", title: "Emperor", connection: "Founder" }
        },
        "Trần": {
            era: "1225–1400",
            significance: "Renowned for its indomitable spirit, defeating the Mongol Empire three times.",
            keyFacts: ["Three victories over Mongol invasions", "Famous for 'Hội nghị Diên Hồng'", "Promoted martial arts and literature"],
            famousFigure: { name: "Trần Hưng Đạo", title: "Grand Commander", connection: "National Hero" }
        },
        "Hồ": {
            era: "1400–1407",
            significance: "Short-lived but reformist dynasty. Introduced paper currency and new weapons.",
            keyFacts: ["Founded by Hồ Quý Ly", "Built the Citadel of the Hồ Dynasty", "Implemented land reforms"],
            famousFigure: { name: "Hồ Quý Ly", title: "Emperor", connection: "Reformer" }
        },
        "Hậu Trần": {
            era: "1407–1413",
            significance: "Resistance movement against Ming dynasty occupation.",
            keyFacts: ["Led by Giản Định Đế", "Continued the Trần legacy", "Fought bravely against overwhelming odds"],
            famousFigure: { name: "Giản Định Đế", title: "Emperor", connection: "Resistance Leader" }
        },
        "Lê Sơ": {
            era: "1428–1527",
            significance: "Founded after the Lam Sơn Uprising. A peak period of Confucianism and legal code (Hong Duc Code).",
            keyFacts: ["Founded by Lê Lợi", "Golden age under Lê Thánh Tông", "Expanded territory southward"],
            famousFigure: { name: "Lê Lợi", title: "Emperor", connection: "Founder" }
        },
        "Mạc": {
            era: "1527–1592",
            significance: "A dynasty that promoted trade and open policies but faced civil war.",
            keyFacts: ["Founded by Mạc Đăng Dung", "Encouraged ceramics export", "Known for scholastic achievements"],
            famousFigure: { name: "Mạc Đăng Dung", title: "Emperor", connection: "Founder" }
        },
        "Hậu Lê": {
            era: "1533–1789",
            significance: "Restored Lê dynasty, characterized by the Trịnh-Nguyễn lords division.",
            keyFacts: ["Longest reigning dynasty", "Effective division of power", "Cultural flowering in north and south"],
            famousFigure: { name: "Trịnh & Nguyễn Lords", title: "Lords", connection: "De facto Rulers" }
        },
        "Tây Sơn": {
            era: "1778–1802",
            significance: "A peasant uprising that unified the country and defeated Siamese and Qing invaders.",
            keyFacts: ["Founded by Nguyễn Huệ (Quang Trung)", "Lightning-fast military campaigns", "Promoted Chữ Nôm script"],
            famousFigure: { name: "Quang Trung", title: "Emperor", connection: "Military Genius" }
        },
        "Nguyễn": {
            era: "1802–1945",
            significance: "The last imperial dynasty. Unified modern Vietnam's territory.",
            keyFacts: ["Founded by Nguyễn Ánh (Gia Long)", "Built the Imperial City of Huế", "Faced French colonization"],
            famousFigure: { name: "Gia Long", title: "Emperor", connection: "Founder" }
        }
    };

    return defaultData[dynasty] || {
        era: "Unknown Era",
        significance: "A mysterious artifact from Vietnam's rich history.",
        keyFacts: ["Origin unverified", "Historical research ongoing"],
        culturalImpact: "Part of the Vietnamese heritage collection."
    };
};

export default function HistoricalTooltip({
    children,
    context,
    dynasty = "Unknown",
    delay = 0.3,
    side = "right"
}: HistoricalTooltipProps) {
    const [isVisible, setIsVisible] = useState(false);

    // Merge provided context with fallback if necessary
    const displayContext = context || getFallbackContext(dynasty);

    // Determine positioning styles
    const positionStyles = side === "right"
        ? { left: "105%", top: "0" }
        : { right: "105%", top: "0" };

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}

            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, x: side === "right" ? -10 : 10 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, delay: delay, ease: "easeOut" }}
                        style={positionStyles}
                        className="absolute z-50 w-72 md:w-80 pointer-events-none"
                    >
                        <div className="relative overflow-hidden rounded-xl border border-[#DBB968]/30 bg-[#121212]/95 backdrop-blur-xl shadow-[0_0_30px_rgba(219,185,104,0.15)]">
                            {/* Decorative Corner Borders */}
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#DBB968] rounded-tl-lg opacity-60" />
                            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#DBB968] rounded-tr-lg opacity-60" />
                            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#DBB968] rounded-bl-lg opacity-60" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#DBB968] rounded-br-lg opacity-60" />

                            {/* Header / Era Banner */}
                            <div className="bg-gradient-to-r from-[#1a1a1a] via-[#2a2510] to-[#1a1a1a] p-4 border-b border-[#DBB968]/20">
                                <div className="flex items-center gap-2 mb-1">
                                    <Crown className="w-4 h-4 text-[#DBB968]" />
                                    <h3 className="font-display text-lg text-[#DBB968] tracking-wide">
                                        {dynasty} Dynasty
                                    </h3>
                                </div>
                                <p className="text-xs font-serif text-[#DBB968]/80 italic">
                                    {displayContext.era}
                                </p>
                            </div>

                            {/* Content Body */}
                            <div className="p-4 space-y-4">
                                {/* Significance */}
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2 text-[#DBB968]/90">
                                        <BookOpen className="w-3.5 h-3.5" />
                                        <h4 className="font-serif text-xs uppercase tracking-wider font-bold">Significance</h4>
                                    </div>
                                    <p className="text-sm font-sans text-gray-300 leading-relaxed">
                                        {displayContext.significance}
                                    </p>
                                </div>

                                {/* Divider */}
                                <div className="h-px w-full bg-gradient-to-r from-transparent via-[#DBB968]/30 to-transparent" />

                                {/* Key Facts */}
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-[#DBB968]/90">
                                        <Scroll className="w-3.5 h-3.5" />
                                        <h4 className="font-serif text-xs uppercase tracking-wider font-bold">Archive Facts</h4>
                                    </div>
                                    <ul className="space-y-1.5">
                                        {displayContext.keyFacts.map((fact, idx) => (
                                            <motion.li
                                                key={idx}
                                                initial={{ opacity: 0, x: -5 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: delay + 0.1 + (idx * 0.1) }}
                                                className="flex items-start gap-2 text-xs text-gray-400"
                                            >
                                                <span className="mt-1 w-1 h-1 rounded-full bg-[#DBB968]/60 shrink-0" />
                                                <span>{fact}</span>
                                            </motion.li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Famous Figure (if present) */}
                                {displayContext.famousFigure && (
                                    <div className="mt-2 rounded-lg bg-[#DBB968]/10 p-3 border border-[#DBB968]/20">
                                        <p className="text-[10px] uppercase text-[#DBB968]/70 mb-1">Legend Connection</p>
                                        <div className="flex items-center justify-between">
                                            <span className="font-display text-[#DBB968]">{displayContext.famousFigure.name}</span>
                                            <span className="text-xs text-gray-400 italic">{displayContext.famousFigure.title}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
