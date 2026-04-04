import axiosInstance from "@/config/apiConfig"
import { useEffect, useState } from "react"
import { useGlobalStorage } from "@/hooks/GlobalStorage"
import styles from "@/css/playerprofile.module.css"
import GamePadIcon from "@/public/profile/SVG/gamePadIcon"
import { useParams } from "next/navigation"
import { MatchDetailsDialog } from "../profile/MatchDetailsDialog"

interface Match {
    gameId: string;
    opponentId: string | null;
    opponent: string;
    avt: string;
    playMode: string;
    totalTime: number;
    result: string;
}

interface ProfileMatchesProps {
    onStreakUpdate?: (streak: number) => void // callback to send current streak upward
}

interface User {
    username: string;
    avatarUrl?: string;
}

interface ApiMatch {
    opponentName?: string;
    gameMode: string;
    totalTime: number;
    result: string;
    gameId: string;
    opponentId?: string;
}

export default function PlayerProfileMatches({ onStreakUpdate }: ProfileMatchesProps) {
    const params = useParams()
    const id = params?.id as string; // dynamic player ID from URL

    const { accessToken } = useGlobalStorage()
    const [matches, setMatches] = useState<Match[]>([])
    const [error, setError] = useState<string | null>(null)

    // Dialog State
    const [selectedGameId, setSelectedGameId] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedMatchData, setSelectedMatchData] = useState<{ opponent: string, result: string, opponentId: string | null } | null>(null);

    const handleMatchClick = (match: Match) => {
        setSelectedGameId(match.gameId);
        setSelectedMatchData({
            opponent: match.opponent,
            result: match.result,
            opponentId: match.opponentId
        });
        setIsDialogOpen(true);
    };

    // Caculate consecutive victories
    const calculateCurrentStreak = (matches: Match[]): number => {
        let streak = 0;
        for (const match of matches) {
            if (match.result === "Victory") {
                streak++;
            } else {
                break; // stop when first non-victory found
            }
        }
        return streak;
    }

    useEffect(() => {
        if (!accessToken || !id) return

        const fetchMatchHistory = async () => {
            try {
                // Fetch match history for the player being viewed
                const response = await axiosInstance.get(`/game/history/${id}`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    }
                })

                // Fetch all users to get avatars 
                const usersResponse = await axiosInstance.get(`/users?limit=1000&offset=0`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    }
                });

                const avatarsMap: { [key: string]: string } = {};
                usersResponse.data.users.forEach((user: User) => {
                    avatarsMap[user.username.toLowerCase()] = user.avatarUrl || '';
                });
                // setUserAvatars(avatarsMap);

                // Format match data
                const formattedMatches = response.data.map((match: ApiMatch) => {
                    const opponentLower = (match.opponentName || 'Unknown').toLowerCase();
                    return {
                        opponent: match.opponentName || 'Unknown',
                        avt: avatarsMap[opponentLower],
                        playMode: match.gameMode,
                        // Use the computed duration as your 'time' field
                        totalTime: match.totalTime,
                        // Use the derived gameResult
                        result: match.result,
                        gameId: match.gameId,
                        opponentId: match.opponentId || null
                    };
                });

                setMatches(formattedMatches);
                setError(null);

                // Compute streak & update
                const streak = calculateCurrentStreak(formattedMatches);
                // setCurrentStreak(streak);
                if (onStreakUpdate) onStreakUpdate(streak)
            } catch {
                console.error('Error fetching match history')
                setError('Failed to load match history')
                setMatches([])
                if (onStreakUpdate) onStreakUpdate(0)
            }
        }

        fetchMatchHistory()
    }, [id, accessToken, onStreakUpdate])

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
                            onClick={() => handleMatchClick(match)}
                            className={`${index !== matches.length - 1 ? 'mb-[3dvh]' : 'mb-0'} ${styles.match} w-full rounded-[1vw] bg-[rgba(0,0,0,0.5)] border border-solid ${match.result == 'Victory' && `border-[#1CFF07] ${styles.victory}`} ${match.result == 'Draw' && `border-[#FFF700] ${styles.draw}`} ${match.result == 'Defeat' && 'border-[#EA4335]'} cursor-pointer hover:bg-white/5 transition-colors`}
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
                                    <p className={`text-[1.5vw] px-[2vw] mr-[1vw] relative ${match.result == 'Victory' && 'text-[#1CFF07]'} ${match.result == 'Defeat' && 'text-[#EA4335]'} ${match.result == 'Draw' && 'text-[#FFF700]'} font-bold ${styles.result}`}>
                                        {match.result}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <MatchDetailsDialog
                gameId={selectedGameId}
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                opponentName={selectedMatchData?.opponent || 'Unknown'}
                result={selectedMatchData?.result || '-'}
                opponentId={selectedMatchData?.opponentId || null}
            />
        </div>
    )
}