"use client"
import { useEffect } from 'react';
import styles from '@/css/home.module.css'
import YellowLight from '@/components/decor/YellowLight'
import { useRouter } from "next/navigation";
import { useSocketContext } from "@/context/WebSocketContext";
import { useGlobalStorage } from '@/hooks/GlobalStorage';

export default function HomePage() {
    const router = useRouter();
    const { socket } = useSocketContext();
    const { userId, accessToken } = useGlobalStorage();

    // const { onlineUsers } = useWebSocket();
    // console.log(onlineUsers);
    return (
        <div className="text-white relative h-[calc(100dvh-var(--nav-height))] flex justify-center items-center">
            <YellowLight left="-15vw" top="-15vw" />
            <div className={`${styles.container} grid h-full w-full place-items-center`}>
                <div
                    onClick={() => router.push("/challenge")}
                    className={`${styles.item1} border border-white border-solid w-[80vw] md:w-[50vh] overflow-hidden rounded-[4vw] flex flex-row md:flex-col bg-[linear-gradient(180deg,#E9B654,#363624)] cursor-pointer`}
                >
                    <div className={`w-full aspect-square bg-center bg-cover bg-no-repeat ${styles.chessboardBG}`}></div>
                    <div className="flex flex-col items-start justify-center">
                        <p className="text-[3.5rem] text-center font-extrabold w-full my-[1dvh]">Play Online</p>
                        <p className="text-[2rem] text-center opacity-80 w-full px-[4vw] mb-[2dvh]">Match and play with someone at your level</p>
                    </div>
                </div>
                <div
                    onClick={() => router.push("/game/find")}
                    className={`${styles.item2} border border-white border-solid w-[80vw] md:w-[50vh] overflow-hidden rounded-[4vw] flex flex-row md:flex-col bg-[linear-gradient(180deg,#E9B654,#363624)] cursor-pointer`}
                >
                    <div className={`w-full aspect-square bg-center bg-cover bg-no-repeat ${styles.chessboardBG}`}></div>
                    <div className="flex flex-col items-start justify-center">
                        <p className="text-[3.5rem] text-center font-extrabold w-full my-[1dvh]">Play with Bot</p>
                        <p className="text-[2rem] text-center opacity-80 w-full px-[4vw] mb-[2dvh]">Challenge yourself with our trained bot</p>
                    </div>
                </div>
            </div>
        </div>
    );
}