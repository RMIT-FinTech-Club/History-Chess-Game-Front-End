"use client";

import { ChallengeModalProps } from "./types";

export default function ChallengeModal({
    isOpen,
    challengeData,
    onAcceptAction,
    onDeclineAction
}: ChallengeModalProps) {
    if (!isOpen || !challengeData) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
            <div className="bg-[#3B3433] rounded-[2vh] p-[3vh] max-w-[500px] w-full mx-4 border border-[#DBB968] relative z-[10000]">
                <h2 className="text-[#DBB968] text-[1.5rem] font-bold mb-[2vh]">Game Challenge</h2>
                <p className="text-white text-[1.2rem] mb-[3vh]">
                    {challengeData.challengerName} wants to play a {challengeData.playMode} game with {challengeData.colorPreference} color preference.
                </p>
                <div className="flex gap-[2vh]">
                    <button
                        onClick={onAcceptAction}
                        className="flex-1 bg-[#DBB968] text-black text-[1.2rem] font-bold py-[1.5vh] rounded-[1vh] hover:bg-[#C4A55A] transition-colors"
                    >
                        Accept
                    </button>
                    <button
                        onClick={onDeclineAction}
                        className="flex-1 bg-[#2F2A29] text-white text-[1.2rem] font-bold py-[1.5vh] rounded-[1vh] border border-[#DBB968] hover:bg-[#3B3433] transition-colors"
                    >
                        Decline
                    </button>
                </div>
            </div>
        </div>
    );
}