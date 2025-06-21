"use client"

import styles from '@/css/home.module.css'
import YellowLight from '@/components/decor/YellowLight'
import { useRouter } from "next/navigation";
import { useSocket } from "@/context/WebSocketContext";
import { useEffect } from 'react';
import { useGlobalStorage } from '@/hooks/GlobalStorage';

export default function HomePage() {
    const router = useRouter();
    const { socket } = useSocket();
    const { userId, accessToken } = useGlobalStorage();

    // const { onlineUsers } = useWebSocket();
    // console.log(onlineUsers);
    return (
        <div className="text-white relative min-h-screen flex flex-col items-center justify-center">
            <YellowLight left="-15vw" top="-15vw" />
            <p className="text-[5rem] text-center font-extrabold my-[5dvh] w-full">Choose Game Mode</p>
            <div className="flex flex-col md:flex-row justify-around items-stretch w-full max-w-6xl px-4">
                <div
                    onClick={() => router.push("/challenge")}
                    className="border border-white border-solid w-full md:w-[30vw] overflow-hidden rounded-[4vw] mb-[5dvh] md:mb-0 flex flex-col bg-[linear-gradient(180deg,#E9B654,#363624)] cursor-pointer min-h-[400px]"
                >
                    <div className={`w-full aspect-square bg-center bg-cover bg-no-repeat ${styles.chessboardBG}`}></div>
                    <div className="flex flex-col items-start justify-center flex-1 p-4">
                        <p className="text-[5rem] md:text-[3.5rem] text-center font-extrabold w-full my-[1dvh]">Challenge Players</p>
                        <p className="text-[2rem] text-center opacity-80 w-full px-[4vw] mb-[2dvh]">Match and play with someone at your level</p>
                    </div>
                </div>
                <div
                    onClick={() => router.push("/game/find")}
                    className="border border-white border-solid w-full md:w-[30vw] overflow-hidden rounded-[4vw] flex flex-col bg-[linear-gradient(180deg,#E9B654,#363624)] cursor-pointer min-h-[400px]"
                >
                    <div className={`w-full aspect-square bg-center bg-cover bg-no-repeat ${styles.chessboardBG}`}></div>
                    <div className="flex flex-col items-start justify-center flex-1 p-4">
                        <p className="text-[5rem] md:text-[3.5rem] text-center font-extrabold w-full my-[1dvh]">Find Match</p>
                        <p className="text-[2rem] text-center opacity-80 w-full px-[4vw] mb-[2dvh]">Challenge yourself with our trained bot</p>
                    </div>
                </div>
            </div>
        </div>
    );
}