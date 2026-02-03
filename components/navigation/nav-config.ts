import { Home, ShoppingBag, Trophy, Users, Swords } from "lucide-react";
import { IconType } from "react-icons";
import { FaChessBoard } from "react-icons/fa6";

export interface NavItem {
    label: string;
    href: string;
    icon?: any; // LucideIcon or IconType
    isExternal?: boolean;
}

export const GLOBAL_NAV_ITEMS: NavItem[] = [
    {
        label: "Battle",
        href: "/challenge",
        icon: Swords
    },
    {
        label: "Dynasty",
        href: "/dynastyjourney",
        icon: Trophy
    },
    {
        label: "Market",
        href: "/market",
        icon: ShoppingBag
    },
    {
        label: "Leaderboard",
        href: "/players",
        icon: Users
    }
];

export const GAME_NAV_ITEMS = {
    top: [
        {
            label: "Leave Game",
            href: "/home", // Or generic exit action
            icon: Home
        }
    ],
    bottom: [
        // Settings and visual toggles handled by specific components, not generic links
    ]
};
