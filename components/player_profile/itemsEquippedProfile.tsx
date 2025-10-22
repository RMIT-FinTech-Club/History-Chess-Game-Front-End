import React from 'react'
import Image from 'next/image'
import styles from "@/css/playerprofile.module.css"
import ItemIcon from '@/public/player_profile/SVG/itemIcon'

import sword01 from '@/public/items/sword.svg'
import helmet from '@/public/items/helmet.svg'
import shield from '@/public/items/shield.svg'
import armor from '@/public/items/armor.svg'
import sword02 from '@/public/items/sword01.svg'
import bow from '@/public/items/bow.svg'

type Rarity = | "Eternal" | "Masterwork" | "Relic" | "Mythic" | "Legendary" | "Epic" | "Rare" | "Uncommon" | "Common"

const rarityColors: Record<Rarity, string> = {
  Eternal: "#E63973",
  Masterwork: "#A6CE39",
  Relic: "#732419",
  Mythic: "#E67E22",
  Legendary: "#F1C40F",
  Epic: "#8E44AD",
  Rare: "#3498DB",
  Uncommon: "#2ECC71",
  Common: "#FFFFFF",
};

interface Item {
  name: string;
  rarity: Rarity;
  img: any; // Use 'any' since Next.js static imports are not simple strings
}

export default function ItemsEquippedProfile() {
  const items: Item[] = [
    { name: "Sword", rarity: "Legendary", img: sword01 },
    { name: "Helmet", rarity: "Epic", img: helmet },
    { name: "Shield", rarity: "Legendary", img: shield },
    { name: "Armor", rarity: "Epic", img: armor },
    { name: "Sword", rarity: "Epic", img: sword02 },
    { name: "Bow", rarity: "Uncommon", img: bow },
  ];

  return (
    <div className="w-full md:w-[60%] flex flex-col">
      {/* Header */}
      <div className="flex items-center mb-6">
        <ItemIcon width="3vw" />
        <p className="text-[3vw] leading-[3vw] ml-[1vw] font-semibold text-white">
          Equipped Items
        </p>
      </div>

      {/* Grid container */}
      <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 ${styles.list_container}`}>
        {items.length > 0 ? (
          items.map((item, index) => (
            <div
              key={index}
              className="bg-[#1a1a1a] border border-gray-700 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-md hover:shadow-lg transition-all duration-300"
            >
              {/* Rarity bar */}
              <div
                className="px-4 py-1 text-sm font-medium text-white rounded-full"
                style={{ backgroundColor: rarityColors[item.rarity] }}
              >
                {item.name}
              </div>

              {/* Icon */}
              <div className="mt-4 w-16 h-16 flex items-center justify-center">
                <Image src={item.img} alt={item.name} width={64} height={64} />
              </div>

              {/* Subtext */}
              <p className="text-gray-400 text-sm mt-4">{item.rarity}</p>
            </div>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center text-center py-12">
            <p className="text-gray-400 text-lg font-medium">
              This player does not have any equipped items.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}