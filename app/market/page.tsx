"use client"

import { FaWallet, FaChevronDown } from 'react-icons/fa';
import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import SaleItem from '@/components/market/SaleItem';
import Category from '@/components/market/Category';
import { categories } from './categories';
import rarity_color from './rarity_color';

type ItemRarity = 'unique' | 'legendary' | 'rare' | 'common';
type RarityFilter = ItemRarity | 'all';
type CategoryName = (typeof categories)[number]['name'];
type CategoryFilter = 'all' | CategoryName;

interface Item {
    name: string;
    category: string;
    rarity: ItemRarity;
    price: number;
    quantity: number;
    onwned: boolean;
    desc: string;
    img: string;
}

const items: Item[][] = [
    [
        {
            name: "Sword 1",
            category: "sword",
            rarity: "legendary",
            price: 1000,
            quantity: 10,
            onwned: false,
            desc: "Excalibur is the mythical sword of King Arthur that may possess magical powers or be associated with the rightful sovereignty of Britain. Its first reliably datable appearance is found in Geoffrey of Monmouth's Historia Regum Britanniae.",
            img: "https://tr.rbxcdn.com/180DAY-c053000f30a83932a7ac6b983c24d872/150/150/BackAccessory/Webp/noFilter"
        },
        {
            name: "Sword 2",
            category: "sword",
            rarity: "rare",
            price: 500,
            quantity: 50,
            onwned: false,
            desc: "Excalibur is the mythical sword of King Arthur that may possess magical powers or be associated with the rightful sovereignty of Britain. Its first reliably datable appearance is found in Geoffrey of Monmouth's Historia Regum Britanniae.",
            img: "https://tr.rbxcdn.com/180DAY-c053000f30a83932a7ac6b983c24d872/150/150/BackAccessory/Webp/noFilter"
        }
    ],
    [
        {
            name: "Shield 1",
            category: "shield",
            rarity: "legendary",
            price: 1000,
            quantity: 10,
            onwned: false,
            desc: "Excalibur is the mythical sword of King Arthur that may possess magical powers or be associated with the rightful sovereignty of Britain. Its first reliably datable appearance is found in Geoffrey of Monmouth's Historia Regum Britanniae.",
            img: "https://tr.rbxcdn.com/180DAY-c053000f30a83932a7ac6b983c24d872/150/150/BackAccessory/Webp/noFilter"
        },
        {
            name: "Shield 2",
            category: "shield",
            rarity: "common",
            price: 100,
            quantity: 100,
            onwned: false,
            desc: "Excalibur is the mythical sword of King Arthur that may possess magical powers or be associated with the rightful sovereignty of Britain. Its first reliably datable appearance is found in Geoffrey of Monmouth's Historia Regum Britanniae.",
            img: "https://tr.rbxcdn.com/180DAY-c053000f30a83932a7ac6b983c24d872/150/150/BackAccessory/Webp/noFilter"
        }
    ],
    [
        {
            name: "Helmet 1",
            category: "helmet",
            rarity: "unique",
            price: 10000,
            quantity: 1,
            onwned: false,
            desc: "Excalibur is the mythical sword of King Arthur that may possess magical powers or be associated with the rightful sovereignty of Britain. Its first reliably datable appearance is found in Geoffrey of Monmouth's Historia Regum Britanniae.",
            img: "https://tr.rbxcdn.com/180DAY-c053000f30a83932a7ac6b983c24d872/150/150/BackAccessory/Webp/noFilter"
        },
        {
            name: "Helmet 2",
            category: "helmet",
            rarity: "unique",
            price: 10000,
            quantity: 1,
            onwned: false,
            desc: "Excalibur is the mythical sword of King Arthur that may possess magical powers or be associated with the rightful sovereignty of Britain. Its first reliably datable appearance is found in Geoffrey of Monmouth's Historia Regum Britanniae.",
            img: "https://tr.rbxcdn.com/180DAY-c053000f30a83932a7ac6b983c24d872/150/150/BackAccessory/Webp/noFilter"
        },
        {
            name: "Helmet 3",
            category: "helmet",
            rarity: "unique",
            price: 10000,
            quantity: 1,
            onwned: false,
            desc: "Excalibur is the mythical sword of King Arthur that may possess magical powers or be associated with the rightful sovereignty of Britain. Its first reliably datable appearance is found in Geoffrey of Monmouth's Historia Regum Britanniae.",
            img: "https://tr.rbxcdn.com/180DAY-c053000f30a83932a7ac6b983c24d872/150/150/BackAccessory/Webp/noFilter"
        },
        {
            name: "Helmet 4",
            category: "helmet",
            rarity: "unique",
            price: 10000,
            quantity: 1,
            onwned: false,
            desc: "Excalibur is the mythical sword of King Arthur that may possess magical powers or be associated with the rightful sovereignty of Britain. Its first reliably datable appearance is found in Geoffrey of Monmouth's Historia Regum Britanniae.",
            img: "https://tr.rbxcdn.com/180DAY-c053000f30a83932a7ac6b983c24d872/150/150/BackAccessory/Webp/noFilter"
        },
        {
            name: "Helmet 5",
            category: "helmet",
            rarity: "unique",
            price: 10000,
            quantity: 1,
            onwned: false,
            desc: "Excalibur is the mythical sword of King Arthur that may possess magical powers or be associated with the rightful sovereignty of Britain. Its first reliably datable appearance is found in Geoffrey of Monmouth's Historia Regum Britanniae.",
            img: "https://tr.rbxcdn.com/180DAY-c053000f30a83932a7ac6b983c24d872/150/150/BackAccessory/Webp/noFilter"
        },
        {
            name: "Helmet 6",
            category: "helmet",
            rarity: "rare",
            price: 500,
            quantity: 50,
            onwned: false,
            desc: "Excalibur is the mythical sword of King Arthur that may possess magical powers or be associated with the rightful sovereignty of Britain. Its first reliably datable appearance is found in Geoffrey of Monmouth's Historia Regum Britanniae.",
            img: "https://tr.rbxcdn.com/180DAY-c053000f30a83932a7ac6b983c24d872/150/150/BackAccessory/Webp/noFilter"
        }
    ],
    [
        {
            name: "Armour 1",
            category: "armour",
            rarity: "unique",
            price: 10000,
            quantity: 1,
            onwned: false,
            desc: "Excalibur is the mythical sword of King Arthur that may possess magical powers or be associated with the rightful sovereignty of Britain. Its first reliably datable appearance is found in Geoffrey of Monmouth's Historia Regum Britanniae.",
            img: "https://tr.rbxcdn.com/180DAY-c053000f30a83932a7ac6b983c24d872/150/150/BackAccessory/Webp/noFilter"
        },
        {
            name: "Armour 2",
            category: "armour",
            rarity: "rare",
            price: 500,
            quantity: 50,
            onwned: false,
            desc: "Excalibur is the mythical sword of King Arthur that may possess magical powers or be associated with the rightful sovereignty of Britain. Its first reliably datable appearance is found in Geoffrey of Monmouth's Historia Regum Britanniae.",
            img: "https://tr.rbxcdn.com/180DAY-c053000f30a83932a7ac6b983c24d872/150/150/BackAccessory/Webp/noFilter"
        }
    ],
    [
        {
            name: "Bow 1",
            category: "bow",
            rarity: "unique",
            price: 10000,
            quantity: 1,
            onwned: false,
            desc: "Excalibur is the mythical sword of King Arthur that may possess magical powers or be associated with the rightful sovereignty of Britain. Its first reliably datable appearance is found in Geoffrey of Monmouth's Historia Regum Britanniae.",
            img: "https://tr.rbxcdn.com/180DAY-c053000f30a83932a7ac6b983c24d872/150/150/BackAccessory/Webp/noFilter"
        },
        {
            name: "Bow 2",
            category: "bow",
            rarity: "rare",
            price: 500,
            quantity: 50,
            onwned: false,
            desc: "Excalibur is the mythical sword of King Arthur that may possess magical powers or be associated with the rightful sovereignty of Britain. Its first reliably datable appearance is found in Geoffrey of Monmouth's Historia Regum Britanniae.",
            img: "https://tr.rbxcdn.com/180DAY-c053000f30a83932a7ac6b983c24d872/150/150/BackAccessory/Webp/noFilter"
        }
    ],
]

const flattenedItems: Item[] = items.flat();

export default function Market() {
    const [showRarity, setShowRarity] = useState(false);
    const [activeCategory, setActiveCategory] = useState<CategoryName>('unique');
    const [currentCategory, setCurrentCategory] = useState<CategoryFilter>('all');
    const [currentItem, setCurrentItem] = useState(0);
    const [currentRarity, setCurrentRarity] = useState<RarityFilter>('unique');
    const rarityRef = useRef<HTMLDivElement>(null);

    const rarityOptions = useMemo(
        () => [
            { value: 'all' as RarityFilter, label: 'All' },
            { value: 'unique' as RarityFilter, label: 'Unique' },
            { value: 'legendary' as RarityFilter, label: 'Legendary' },
            { value: 'rare' as RarityFilter, label: 'Rare' },
            { value: 'common' as RarityFilter, label: 'Common' },
        ],
        []
    );

    const visibleItems = useMemo(() => {
        return flattenedItems.filter(item => {
            const matchesCategory = currentCategory === 'all' ? true : item.category === currentCategory;
            const matchesRarity = currentRarity === 'all' ? true : item.rarity === currentRarity;
            return matchesCategory && matchesRarity;
        });
    }, [currentCategory, currentRarity]);

    useEffect(() => {
        if (!showRarity) {
            return;
        }

        const handleClickOutside = (event: MouseEvent) => {
            if (!rarityRef.current) {
                return;
            }

            if (!rarityRef.current.contains(event.target as Node)) {
                setShowRarity(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showRarity]);

    useEffect(() => {
        if (visibleItems.length === 0) {
            if (currentItem !== 0) {
                setCurrentItem(0);
            }
            return;
        }

        if (currentItem >= visibleItems.length) {
            setCurrentItem(0);
        }
    }, [visibleItems, currentItem]);

    const handleCategorySelect = (categoryName: CategoryName) => {
        setActiveCategory(categoryName);
        setShowRarity(false);
        setCurrentItem(0);

        if (categoryName === 'unique') {
            setCurrentCategory('all');
            setCurrentRarity('unique');
            return;
        }

        setCurrentCategory(categoryName);
        setCurrentRarity(prev => (activeCategory === 'unique' && prev === 'unique' ? 'all' : prev));
    };

    const handleRaritySelect = (rarity: RarityFilter) => {
        setCurrentRarity(rarity);
        setShowRarity(false);
        setCurrentItem(0);
    };

    const toggleRarityDropdown = () => {
        setShowRarity(prev => !prev);
    };

    const currentItemData = visibleItems[currentItem];
    const currentRarityColor = currentItemData ? rarity_color(currentItemData.rarity) : undefined;
    const currentRarityVariableStyle = useMemo(
        () => (currentRarityColor ? ({ "--rarity-color": currentRarityColor } as CSSProperties) : undefined),
        [currentRarityColor]
    );

    return (
        <div className="flex flex-col h-[calc(100dvh-var(--navbar-height))] w-full overflow-hidden">
            <div className="flex items-center w-[100vw] h-[25dvh] gap-[2vh] px-[2vh] overflow-x-auto">
                {visibleItems.map((item, index) => (
                    <SaleItem
                        key={`${item.name}-${index}`}
                        name={item.name}
                        category={item.category}
                        rarity={item.rarity}
                        price={item.price}
                        onwned={item.onwned}
                        img={item.img}
                        selected={index === currentItem}
                        onSelect={() => setCurrentItem(index)}
                    />
                ))}
                {visibleItems.length === 0 && (
                    <div className="flex h-[23vh] w-full items-center justify-center text-[3vh] text-white">
                        No items available
                    </div>
                )}
            </div>
            <div className="w-full h-[calc(65dvh-var(--navbar-height))] flex justify-between gap-[5vw] items-center px-[5vw]">
                {currentItemData ? (
                    <>
                        <div
                            className="h-[75%] aspect-square bg-center bg-no-repeat bg-contain"
                            style={{ backgroundImage: `url(${currentItemData.img})` }}
                        ></div>
                        <div className="w-full h-[75%] flex">
                            <div className="w-[75%] h-full flex flex-wrap">
                                <p className="w-full text-center text-[6vh] h-[9vh] font-extrabold">{currentItemData.name}</p>
                                <p className="h-[calc(100%-9vh)] text-[3vh]">{currentItemData.desc}</p>
                            </div>
                            <div className="w-[25%] h-full flex flex-col items-center">
                                <div className="grid grid-rows-3 grid-cols-1 gap-[4vh] w-[max-content]">
                                    <p
                                        className="text-[3vh] text-black flex justify-center items-center border border-white px-[3vh] py-[0.5vh] rounded-[3vh] capitalize"
                                        style={{ backgroundColor: currentRarityColor }}
                                    >
                                        {currentItemData.rarity}
                                    </p>
                                    <p className="text-[3vh] text-white flex justify-center items-center border border-white px-[3vh] py-[0.5vh] rounded-[3vh] uppercase">{currentItemData.price} FTC</p>
                                    <p
                                        className={`text-[3vh] text-black flex justify-center items-center px-[3vh] py-[0.5vh] rounded-[3vh] font-bold cursor-pointer capitalize border border-white transition-colors duration-300 ${currentItemData.onwned ? 'bg-[var(--rarity-color)] text-black' : 'bg-white hover:bg-[var(--rarity-color)] hover:text-black'}`}
                                        style={currentRarityVariableStyle}
                                    >
                                        {currentItemData.onwned ? "Owned" : "buy"}
                                    </p>
                                </div>
                                <p className="text-white text-[3vh] mt-[4vh]">Quantity: {currentItemData.quantity}</p>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-[4vh] text-white">
                        No item selected
                    </div>
                )}
            </div>
            <div className="w-full h-[10dvh] flex justify-center items-center p-[1vh]">
                <div className="bg-[rgba(204,204,204,0.2)] w-full h-full rounded-[2vh] flex items-center justify-between py-[1vh] px-[2vw]">
                    <div className="h-full flex items-center justify-between gap-[2vw]">
                        {categories.map(item => (
                            <Category
                                key={item.name}
                                name={item.name}
                                img={item.img}
                                active={activeCategory === item.name}
                                onSelect={() => handleCategorySelect(item.name as CategoryName)}
                            />
                        ))}
                    </div>
                    <div className="flex items-center">
                        <p className="text-white text-[3.5vh] mr-[0.5vw]">Sort</p>
                        <div
                            ref={rarityRef}
                            className="select-none px-[1vh] py-[0] rounded-[1vh] text-[3.5vh] text-white bg-[rgba(255,255,255,0.3)] flex cursor-pointer relative items-center"
                            onClick={toggleRarityDropdown}
                        >
                            Rarity <FaChevronDown className={`relative ml-[1vw] ${showRarity ? "rotate-[180deg]" : ""} transition-all duration-200`} />
                            {showRarity && (
                                <div className="flex flex-col absolute bottom-[calc(100%+2.5vh)] left-1/2 translate-x-[-50%] overflow-hidden rounded-[1vh]">
                                    {rarityOptions.map(option => (
                                        <div
                                            key={option.value}
                                            className={`px-[2vh] py-[1vh] text-[2vh] bg-[rgba(204,204,204,0.2)] hover:bg-[rgba(255,255,255,0.3)] transition-colors duration-200 ${currentRarity === option.value ? 'bg-[rgba(255,255,255,0.3)] font-semibold' : ''}`}
                                            onClick={event => {
                                                event.stopPropagation();
                                                handleRaritySelect(option.value);
                                            }}
                                        >
                                            {option.label}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <FaWallet className="text-white text-[3.5vh] mr-[0.5vw] ml-[3vw]" />
                        <p className="text-white text-[3.5vh]">5000 FTC</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
