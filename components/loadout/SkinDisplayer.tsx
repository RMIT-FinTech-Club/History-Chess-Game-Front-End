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

    // Get user balance from context
    const balanceCxt = useContext(BalanceContext)
    if (!balanceCxt) throw new Error("SkinDisplayer must be used within a UserProvider")
    const [balance, setBalance] = balanceCxt

    // Find the ID of the currently equipped skin
    const findEquipedID = () => {
        const equipped = skinList.find(skin => skin.equiped)
        return equipped ? equipped.id : 0
    }

    // Initialize states
    const [skins, setSkins] = useState<Skin[]>(skinList)
    const [selected, setSelected] = useState<number>(findEquipedID())
    const [skinStatus, setSkinStatus] = useState<string>(() => {
        if (skinList.length === 0) return "Buy"
        const skin = skinList[0]
        return skin.equiped ? "Equiped" : skin.owned ? "Equip" : "Buy"
    })

    // When skin list updates, reselect and reset status
    useEffect(() => {
        const equipedID = findEquipedID()
        setSkins(skinList)
        setSelected(equipedID)
        setSkinStatus("Equiped")
    }, [skinList])

    // Handle when a skin is selected from carousel
    const handleSelect = (id: number) => {
        setSelected(id)
        const skin = skins.find(skin => skin.id === id)
        if (!skin) return
        setSkinStatus(skin.equiped ? "Equiped" : skin.owned ? "Equip" : "Buy")
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }

    // Handle button click: Equip, Buy, or show error
    const handleSkinClick = () => {
        const selectedSkin = skins.find(skin => skin.id === selected)
        if (!selectedSkin) return

        if (!selectedSkin.equiped) {
            if (selectedSkin.owned) {
                // Equip owned skin
                setSkins(skins.map(skin => ({
                    ...skin,
                    equiped: skin.id === selected
                })))
                setSkinStatus("Equiped")
            } else if (balance >= selectedSkin.price) {
                // Purchase and equip skin if user has enough balance
                const newBalance = balance - selectedSkin.price
                setBalance(newBalance)
                user.balance = newBalance // optionally sync with external/global state
                setSkins(skins.map(skin =>
                    skin.id === selected
                        ? { ...skin, owned: true, equiped: true }
                        : { ...skin, equiped: false }
                ))
                setSkinStatus("Equiped")
            } else {
                // Not enough balance — show temporary message
                setSkinStatus("Not enough FTC")
                if (timeoutRef.current) clearTimeout(timeoutRef.current)
                timeoutRef.current = setTimeout(() => {
                    setSkinStatus(selectedSkin.equiped ? "Equiped" : selectedSkin.owned ? "Equip" : "Buy")
                }, 2000)
            }
        }
    }

    // Get the currently selected skin
    const selectedSkin = skins.find(skin => skin.id === selected)
    if (!selectedSkin) return null

    return (
        <>
            {/* Main skin preview and details */}
            <div className="w-full h-[45dvh] flex justify-around items-center">
                <div
                    style={{ backgroundImage: `url(${selectedSkin.img})` }}
                    className="h-4/5 aspect-square bg-center bg-contain bg-no-repeat"
                ></div>
                <div className="w-1/2 h-4/5 flex justify-between items-center p-[1vw] flex-col">
                    <div className="w-full h-[70%] flex flex-col justify-start items-center p-[1vw]">
                        <p className="mb-[1dvh] text-[2vw] text-[#DCB968] font-bold">{selectedSkin.name}</p>
                        <p className="text-[1.5vw] text-white leading-[2vw] text-justify">{selectedSkin.description}</p>
                    </div>
                    {/* Equip / Buy button */}
                    <div
                        onClick={handleSkinClick}
                        className="px-[4vw] py-[2vw] h-[20%] flex justify-center items-center bg-[#F7D27F] cursor-pointer group rounded-[1vw] transition-all duration-200"
                    >
                        <p className="text-[2vw] leading-[2vw] font-bold text-black group-hover:text-white transition-all duration-200">
                            {skinStatus}
                        </p>
                    </div>
                </div>
            </div>

            {/* Skin carousel list */}
            <Carousel opts={{ align: "start" }} className="w-full">
                <CarouselContent className="w-[100vw] h-[30dvh]">
                    {skins.map((skin, index) => (
                        <CarouselItem
                            key={index}
                            className="cursor-pointer basis-1/6 flex justify-center items-center relative"
                            onClick={() => handleSelect(skin.id)}
                        >
                            <div
                                className={`h-[18dvh] w-4/5 bg-center bg-no-repeat transition-all duration-300 bg-contain ${skin.id === selected ? 'scale-[1.3] hover:scale-[1.3]' : 'scale-1'} hover:scale-[1.2] flex justify-center items-center ${styles.diamond}`}
                            >
                                <div
                                    style={{ backgroundImage: `url(${skin.img})` }}
                                    className="h-2/5 aspect-square bg-center bg-contain bg-no-repeat"
                                ></div>
                            </div>
                            {/* Highlight bar under the selected skin */}
                            {skin.id === selected && (
                                <div className={`absolute bottom-0 left-[50%] w-3/5 h-[1vh] bg-[#DBB968] rounded-[0.5vw] ${styles.shadow}`}></div>
                            )}
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </>
    )
}

export default SkinDisplayer