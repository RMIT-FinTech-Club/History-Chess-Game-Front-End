"use client"

import { useRef, useState } from "react"

import SkinDisplayer from "@/components/loadout/SkinDisplayer"
import BalanceDisplayer from "@/components/loadout/BalanceDisplayer"
import { pawnSkins, bishopSkins, knightSkins, rookSkins, queenSkins, kingSkins } from "@/components/loadout/skinList"

export default function SkinCarousel() {
  const [skins, setSkins] = useState<any>(pawnSkins)
  const [pieces, setPieces] = useState<number>(0)
  const piecesRef = useRef(["Pawn", "Bishop", "Knight", "Rook", "Queen", "King"])

  return (
    <div className="w-full h-[100vh] flex justify-start items-center flex-col">
      <div className="w-full h-[8vh] bg-blue-500 flex justify-center items-center">Nav bar</div>
      <BalanceDisplayer />
      <div className="w-full h-[20vh] bg-amber-700 flex justify-around items-center">
        {piecesRef.current.map((piece, index) => (
          <div
            key={index}
            className={`h-3/4 cursor-pointer aspect-square flex justify-center items-center ${pieces == index ? "bg-amber-300" : "bg-amber-900"}`}
            onClick={() => {
              const skinLists = [pawnSkins, bishopSkins, knightSkins, rookSkins, queenSkins, kingSkins]
              setSkins(skinLists[index])
              setPieces(index)
            }}
          >
            {piece}
          </div>
        ))}
      </div>
      <SkinDisplayer skinList={skins} />
    </div>
  );
}