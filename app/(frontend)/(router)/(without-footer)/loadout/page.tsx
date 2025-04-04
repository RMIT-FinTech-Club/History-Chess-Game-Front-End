"use client"

import { useRef, useState } from "react"

import SkinDisplayer from "@/components/loadout/SkinDisplayer"
import BalanceDisplayer from "@/components/loadout/BalanceDisplayer"
import { pawnSkins, bishopSkins, knightSkins, rookSkins, queenSkins, kingSkins } from "@/components/loadout/skinList"

import Rook from "@/public/loadout/SVG/rook"
import Bisphop from "@/public/loadout/SVG/bishop"
import Queen from "@/public/loadout/SVG/queen"
import King from "@/public/loadout/SVG/king"
import Pawn from "@/public/loadout/SVG/pawn"

export default function SkinCarousel() {
  const [skins, setSkins] = useState<any>(pawnSkins)
  const [pieces, setPieces] = useState<number>(0)
  const piecesRef = useRef([
    {
      name: "Pawn",
      img: Pawn
    },
    {
      name: "Bishop",
      img: Bisphop
    },
    {
      name: "Queen",
      img: Queen
    },
    {
      name: "King",
      img: King
    },
    {
      name: "Knight",
      img: Rook
    },
    {
      name: "Rook",
      img: Rook
    }
  ])

  return (
    <div className="w-full h-[100dvh] flex justify-start items-center flex-col">
      <BalanceDisplayer />
      <div className="w-full h-[20dvh] flex justify-around items-center">
        {piecesRef.current.map((piece, index) => (
          <div
            key={index}
            className="cursor-pointer"
            onClick={() => {
              const skinLists = [pawnSkins, bishopSkins, queenSkins, kingSkins, knightSkins, rookSkins]
              setSkins(skinLists[index])
              setPieces(index)
            }}
          >
            <piece.img
              height="15dvh"
              fill={`${index === pieces ? '#DBB968' : '#fff'}`}
            />
          </div>
        ))}
      </div>
      <SkinDisplayer skinList={skins} />
    </div>
  );
}