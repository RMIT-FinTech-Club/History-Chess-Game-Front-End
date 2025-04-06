"use client"

import { useState, useContext, useEffect, useRef } from "react"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"

import styles from '@/css/loadout.module.css'
import user, { BalanceContext } from '@/context/UserContext'

interface Skin {
    id: number;
    description: string;
    name: string;
    img: string;
    rarity: string;
    owned: boolean;
    price: number;
    equiped: boolean;
    color: string;
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

    return (
        <>
            <div className="w-full h-[45dvh] flex justify-around items-center">
                <div
                    style={{ backgroundImage: `url(${skins[skins.findIndex(skin => skin.id === selected)].img})` }}
                    className="h-4/5 aspect-square bg-center bg-contain bg-no-repeat"
                ></div>
                <div className="w-1/2 h-4/5 flex justify-between items-center p-[1vw] flex-col">
                    <div className="w-full h-[70%] flex flex-col justify-start items-center p-[1vw]">
                        <p className="mb-[1dvh] text-[2vw] text-[#DCB968] font-bold">{skins[skins.findIndex(skin => skin.id === selected)].name}</p>
                        <p className="text-[1.5vw] text-white leading-[2vw] text-justify">{skins[skins.findIndex(skin => skin.id === selected)].description}</p>
                    </div>
                    <div
                        onClick={handleSkinClick}
                        className="px-[4vw] py-[2vw] h-[20%] flex justify-center items-center bg-[#F7D27F] cursor-pointer group rounded-[1vw] transition-all duration-200"
                    >
                        <p className="text-[2vw] leading-[2vw] font-bold text-black group-hover:text-white transition-all duration-200">{skinStatus}</p>
                    </div>
                </div>
            </div>
            <Carousel
                opts={{
                    align: "start",
                }}
                className="w-full"
            >
                <CarouselContent className="w-[100vw] h-[30dvh]">
                    {skins.map((skin, index) => {
                        return (
                            <CarouselItem
                                key={index}
                                className={`cursor-pointer basis-1/6 flex justify-center items-center relative`}
                                onClick={() => handleSelect(skin.id)}
                            >
                                <div className={`h-[18dvh] w-4/5 bg-center bg-no-repeat transition-all duration-300 bg-contain ${skin.id === selected ? 'scale-[1.3] hover:scale-[1.3]' : 'scale-1'} hover:scale-[1.2] flex justify-center items-center ${styles.diamond}`}>
                                    <div
                                        style={{ backgroundImage: `url(${skin.img}})` }}
                                        className="h-2/5 aspect-square bg-center bg-contain bg-no-repeat"
                                    ></div>
                                </div>
                                {skin.id == selected && <div className={`absolute bottom-0 left-[50%] w-3/5 h-[1vh] bg-[#DBB968] rounded-[0.5vw] ${styles.shadow}`}></div>}
                            </CarouselItem>
                        )
                    })}
                </CarouselContent>
            </Carousel>
        </>
    )
}

export default SkinDisplayer