"use client"

import { useState, useContext, useEffect, useRef } from "react"
import { useKeenSlider } from "keen-slider/react"
import user, { BalanceContext } from '@/context/UserContext'
import "keen-slider/keen-slider.min.css"

interface Skin {
    id: number;
    name: string;
    img: string;
    rarity: string;
    owned: boolean;
    price: number;
    equiped: boolean;
}

interface SkinDisplayerProps {
    skinList: Skin[];
}

const SkinDisplayer: React.FC<SkinDisplayerProps> = ({ skinList }) => {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const balanceCxt = useContext(BalanceContext)
    if (!balanceCxt) throw new Error("BalanceDisplayer must be used within a UserProvider")
    const [balance, setBalance] = balanceCxt

    const findEquidedID = () => {
        let index = 0
        skinList.forEach(skin => {
            if (skin.equiped) index = skin.id
        })
        return index
    }

    useEffect(() => {
        let equipedID = findEquidedID()
        setSkins(skinList)
        setSelected(equipedID)
        setSkinStatus("Equiped")
    }, [skinList])

    const [skins, setSkins] = useState<Skin[]>(skinList)
    const [selected, setSelected] = useState<number>(findEquidedID())
    const [skinStatus, setSkinStatus] = useState<string>(skinList[0].equiped ? "Equiped" : skinList[0].owned ? "Equip" : "Buy")



    const handleSelect = (id: number) => {
        setSelected(id)
        setSkinStatus(skins[skins.findIndex(skin => skin.id === id)].equiped ? "Equiped" : skins[skins.findIndex(skin => skin.id === id)].owned ? "Equip" : "Buy")
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }

    const handleSkinClick = () => {
        const selectedSkin = skins[skins.findIndex(skin => skin.id === selected)]

        if (!selectedSkin.equiped) {
            if (selectedSkin.owned) {
                setSkins(skins.map(skin => ({
                    ...skin,
                    equiped: skin.id === selected
                })))
                setSkinStatus("Equiped")
            } else if (user.balance >= selectedSkin.price) {
                user.balance -= selectedSkin.price
                setBalance(user.balance)
                setSkins(skins.map(skin => skin.id === selected ? { ...skin, owned: true, equiped: true } : { ...skin, equiped: false }))
                setSkinStatus("Equiped")
            } else {
                setSkinStatus("Not enough FTC")
                if (timeoutRef.current) clearTimeout(timeoutRef.current)
                timeoutRef.current = setTimeout(() => {
                    setSkinStatus(selectedSkin.equiped ? "Equiped" : selectedSkin.owned ? "Equip" : "Buy")
                }, 2000)
            }
        }
    }

    const [sliderRef] = useKeenSlider({
        loop: true,
        mode: "snap",
        slides: { perView: 6, spacing: 100 },
        drag: true,
        rubberband: false,
    })

    return (
        <>
            <div className="w-full h-[45vh] flex justify-around items-center">
                <div className="w-[35%] h-4/5 flex justify-between items-center p-[1vw] flex-col">
                    <div className="w-full h-[70%] flex flex-col bg-amber-300 p-[1vw]">
                        <p>{skins[skins.findIndex(skin => skin.id === selected)].name}</p>
                        <p>{skins[skins.findIndex(skin => skin.id === selected)].rarity}</p>
                        <p>{skins[skins.findIndex(skin => skin.id === selected)].price}</p>
                    </div>
                    <div
                        onClick={handleSkinClick}
                        className="w-full h-[20%] flex justify-center items-center bg-amber-300 cursor-pointer"
                    >
                        <p>{skinStatus}</p>
                    </div>
                </div>
                <div
                    style={{ backgroundImage: `url(${skins[skins.findIndex(skin => skin.id === selected)].img})` }}
                    className="w-[35%] h-4/5 flex justify-between items-start p-[1vw] flex-col bg-contain bg-center bg-no-repeat">
                </div>
            </div>
            <div ref={sliderRef} className="keen-slider w-full h-[20vh] bg-amber-700 flex justify-around items-center">
                {skins.map((skin, index) => {
                    return (
                        <div
                            key={index}
                            className={`keen-slider__slide cursor-pointer transition-transform h-[15vh] aspect-square flex justify-center items-center bg-amber-50 ${selected === skin.id ? "scale-110 border-2 border-blue-500" : "opacity-70"}`}
                            onClick={() => handleSelect(skin.id)}
                        >
                            <p className="text-center mt-2">{skin.name}</p>
                        </div>
                    )
                })}
            </div>
        </>
    )
}

export default SkinDisplayer