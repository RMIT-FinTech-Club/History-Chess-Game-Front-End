"use client";

import Pieces from "@/public/challenge/SVG/pieces";
import { SideSelectorProps, sideOptions } from "./types";
import { boardPieceColors } from "./PiecesBoardSelector";

export default function SideSelector({ selectedSide, onSideChangeAction, chessBoard }: SideSelectorProps) {
    const fullColorSet = boardPieceColors[chessBoard] || boardPieceColors["historyChessBoard"];

    return (
        <div className="grid grid-cols-3 gap-[2vh] mt-[2vh]">
            {sideOptions.map((opt) => {
                const colorScheme =
                    boardPieceColors[chessBoard]?.[opt.value as "white" | "black"] ??
                    boardPieceColors["historyChessBoard"].white;

                return (
                    <div
                        key={opt.value}
                        onClick={() => onSideChangeAction(opt.value)}
                        className={`h-auto flex items-center col-span-1 px-[2vh] py-[1vh] cursor-pointer transition-colors hover:bg-[#DBB968] duration-200 border-solid rounded-[0.625rem] ${selectedSide === opt.value ? 'bg-[#DBB968] text-black' : 'bg-[#3B3433]'
                            }`}
                    >
                        <Pieces
                            classes="h-14 aspect-square"
                            fill={colorScheme.fill}
                            outline={colorScheme.outline}
                        />

                        <p className="text-[1.1rem] font-extrabold uppercase w-full text-nowrap">
                            {opt.label}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}
