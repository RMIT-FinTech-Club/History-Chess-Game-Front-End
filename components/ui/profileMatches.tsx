import axios from "axios"
import { useEffect, useState } from "react"
import { useGlobalStorage } from "@/hooks/GlobalStorage"
import styles from "@/css/profile.module.css"
import GamePadIcon from "@/public/profile/SVG/gamePadIcon"

interface Match {
    opponent: string;
    avt: string;
    playMode: string;
    totalTime: number;
    result: string;
}

export default function ProfileMatches() {
    const { userId } = useGlobalStorage()


    const [matches, setMatches] = useState<Match[]>([])
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchMatchHistory = async () => {
            try {
                // Replace with actual userId - e.g., from auth context, localStorage, or route params
                const response = await axios.get(`http://localhost:8000/api/v1/game/history/${userId}`)

                const formattedMatches = response.data.map((match: any) => {
                    return {
                        opponent: match.opponentName || 'Unknown',
                        avt: match.opponentAvatar || 'https://i.imgur.com/RoRONDn.jpeg',
                        playMode: match.gameMode,
                        // Use the computed duration as your 'time' field
                        totalTime: match.totalTime,
                        // Use the derived gameResult
                        result: match.result,
                    };
                });

                setMatches(formattedMatches);
                setError(null);
            } catch (err) {
                console.error('Error fetching match history:', err)
                setError('Failed to load match history')
                setMatches([])
            }
        }

        fetchMatchHistory()
    }, [])

    return (
        <div className="w-full md:w-[60%] flex flex-col">
            <div className="flex items-center">
                <GamePadIcon width="3vw" />
                <p className="text-[3vw] leading-[3vw] ml-[1vw]">Matches</p>
            </div>
            <div className={`flex flex-col w-full h-[calc(100ddvh-3dvh-15vw-3dvh-6vw-3dvh-3vw-2dvh+4px-6dvh)] md:h-[100%] overflow-y-auto mt-[2dvh] ${styles.list_container}`}>
                {error ? (
                    <div className="w-full flex justify-center items-center py-5 text-[#EA4335]">
                        <p>{error}</p>
                    </div>
                ) : matches.length === 0 ? (
                    <div className="w-full flex justify-center items-center py-5">
                        <p>No match history found</p>
                    </div>
                ) : (
                    matches.map((match, index) => (
                        <div
                            key={index}
                            className={`${index !== matches.length - 1 ? 'mb-[3dvh]' : 'mb-0'} ${styles.match} w-full rounded-[1vw] bg-[rgba(0,0,0,0.5)] border border-solid ${match.result == 'Victory' && `border-[#1CFF07] ${styles.victory}`} ${match.result == 'Draw' && `border-[#FFF700] ${styles.draw}`} ${match.result == 'Defeat' && 'border-[#EA4335]'}`}
                        >
                            <div className="w-full flex items-center justify-start px-[2vw] md:px-[1vw] rounded-[1vw] overflow-y-hidden">
                                <div
                                    style={{ backgroundImage: `url(${match.avt})` }}
                                    className="w-[calc(8vw-2px)] md:w-[calc(4vw-2px)] my-[2vw] md:my-[1vw] aspect-square rounded-[50%] bg-center bg-cover bg-no-repeat border border-white border-solid mr-[2vw] md:mr-[1vw]"
                                ></div>
                                <div className="w-[100%] flex justify-between items-center mr-[3vw]">
                                    <div className="flex flex-col justify-center items-start mr-[2vw]">
                                        <p className="text-[1.8vw] md:text-[1vw] text-[#C4C4C4]">Opponent</p>
                                        <p className="text-[1.8vw] md:text-[1vw] font-bold w-[30vw] md:w-[15vw] whitespace-nowrap overflow-hidden text-ellipsis">{match.opponent}</p>
                                    </div>
                                    <div className="flex justify-between items-center w-[100%]">
                                        <div className="flex flex-col justify-center items-start">
                                            <p className="text-[1.8vw] md:text-[1vw] text-[#C4C4C4]">Game Mode</p>
                                            <p className="text-[1.8vw] md:text-[1vw] font-bold">{match.playMode}</p>
                                        </div>
                                        <div className="flex flex-col justify-center items-start">
                                            <p className="text-[1.8vw] md:text-[1vw] text-[#C4C4C4]">Time</p>
                                            <p className="text-[1.8vw] md:text-[1vw] font-bold">{`${Math.floor(match.totalTime / 60)}:${match.totalTime % 60 > 9 ? match.totalTime % 60 : '0' + match.totalTime % 60}`}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-[22vw] md:w-[16vw] flex justify-center items-center">
                                    <p className={`text-[1.5vw] px-[2vw] mr-[1vw] relative ${match.result == 'Victory' && 'text-[#1CFF07]'} ${match.result == 'Defeat' && 'text-[#EA4335]'} ${match.result == 'Draw' && 'text-[#FFF700]'} font-bold ${styles.result}`}>{match.result}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}