import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
    FaChessBoard,
    FaChartLine,
    FaCog,
    FaFlag,
    FaChevronLeft,
    FaChevronRight,
    FaHome
} from "react-icons/fa";
import { IoSettingsSharp, IoColorPalette } from "react-icons/io5";

interface GameSidebarProps {
    onLeaveGame: () => void;
    onToggleAnalysis?: () => void;
    onToggleTheme?: () => void;
}

export default function GameSidebar({
    onLeaveGame,
    onToggleAnalysis,
    onToggleTheme
}: GameSidebarProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const router = useRouter();

    const toggleSidebar = () => setIsExpanded(!isExpanded);

    return (
        <aside
            className={`
        fixed left-0 top-0 h-full z-50
        flex flex-col
        transition-all duration-300 ease-in-out
        glass-gold border-r border-gold-deep/30
        ${isExpanded ? "w-64" : "w-16"}
      `}
            onMouseEnter={() => setIsExpanded(true)}
            onMouseLeave={() => setIsExpanded(false)}
        >
            {/* Top Section: Logo/Home */}
            <div className="flex flex-col items-center py-4 border-b border-gold-deep/20">
                <div
                    onClick={onLeaveGame}
                    className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gold-royal/20 cursor-pointer transition-colors group"
                    title="Return to Home"
                >
                    <div className="relative w-8 h-8 group-hover:scale-110 transition-transform">
                        <Image src="/img/FintechLogo.png" alt="logo" fill className="object-contain" />
                    </div>
                </div>
                {isExpanded && (
                    <span className="mt-2 text-xs font-serif text-gold-muted uppercase tracking-wider animate-fade-in">
                        Exit Game
                    </span>
                )}
            </div>

            {/* Middle Section: Game Tools */}
            <div className="flex-1 flex flex-col items-center gap-4 py-6">
                <SidebarItem
                    icon={FaChartLine}
                    label="Analysis"
                    isExpanded={isExpanded}
                    onClick={onToggleAnalysis}
                />
                <SidebarItem
                    icon={IoColorPalette}
                    label="Visuals"
                    isExpanded={isExpanded}
                    onClick={onToggleTheme}
                />
            </div>

            {/* Bottom Section: System */}
            <div className="flex flex-col items-center gap-4 py-6 border-t border-gold-deep/20">
                <SidebarItem
                    icon={FaFlag}
                    label="Report"
                    isExpanded={isExpanded}
                    onClick={() => { }}
                />
                <SidebarItem
                    icon={IoSettingsSharp}
                    label="Settings"
                    isExpanded={isExpanded}
                    onClick={() => { }}
                />

                {/* Collapse Toggle (Mobile/Manual) */}
                <button
                    onClick={toggleSidebar}
                    className="md:hidden mt-2 p-2 text-gold-muted hover:text-white transition-colors"
                >
                    {isExpanded ? <FaChevronLeft /> : <FaChevronRight />}
                </button>
            </div>
        </aside>
    );
}

// Helper Component for Sidebar Items
interface SidebarItemProps {
    icon: any;
    label: string;
    isExpanded: boolean;
    onClick?: () => void;
}

function SidebarItem({ icon: Icon, label, isExpanded, onClick }: SidebarItemProps) {
    return (
        <button
            onClick={onClick}
            className={`
        flex items-center
        ${isExpanded ? "w-5/6 px-4 justify-start gap-3" : "w-10 justify-center"}
        h-10 rounded-lg
        text-white/70 hover:text-gold-light hover:bg-gold-royal/10
        transition-all duration-200 group
      `}
            title={!isExpanded ? label : undefined}
        >
            <Icon className="text-lg shrink-0 group-hover:text-gold-shimmer" />
            {isExpanded && (
                <span className="text-sm font-sans font-medium whitespace-nowrap animate-fade-in">
                    {label}
                </span>
            )}
        </button>
    );
}
