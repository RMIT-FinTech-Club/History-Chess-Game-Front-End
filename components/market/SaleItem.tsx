import { CSSProperties, useMemo } from "react";
import rarity_color from "@/app/market/rarity_color";

interface SaleItemProps {
    name: string,
    category: string,
    rarity: string,
    price: number,
    onwned: boolean,
    img: string,
    selected?: boolean,
    onSelect?: () => void
}

export default function SaleItem({ name, category, rarity, price, onwned, img, selected = false, onSelect }: SaleItemProps) {
    const rarityColor = useMemo(() => rarity_color(rarity), [rarity]);
    const headerStyle: CSSProperties = { backgroundColor: rarityColor };
    const baseRarityVariable = useMemo(
        () => ({ "--rarity-color": rarityColor } as CSSProperties),
        [rarityColor]
    );
    const cardStyles = useMemo(() => {
        const styles: CSSProperties = { ...baseRarityVariable };
        styles.borderColor = selected ? rarityColor : '#fff';
        if (selected) {
            styles.boxShadow = `0 0 0 0.6vh ${rarityColor}`;
        }
        return styles;
    }, [baseRarityVariable, rarityColor, selected]);
    const actionButtonStyle = useMemo(() => {
        if (onwned) {
            return { ...baseRarityVariable, backgroundColor: rarityColor, color: '#000' } as CSSProperties;
        }

        return { ...baseRarityVariable, backgroundColor: '#fff' } as CSSProperties;
    }, [baseRarityVariable, onwned, rarityColor]);

    return (
        <div
            className="flex-shrink-0 cursor-pointer flex flex-col h-[23vh] w-[35vh] bg-[rgba(204,204,204,0.2)] rounded-[2vh] border overflow-hidden transition-all duration-200"
            onClick={onSelect}
            style={cardStyles}
        >
            <div className="w-full h-[8vh] flex justify-between items-center px-[2vh] py-[1vh]" style={headerStyle}>
                <div className="flex flex-col h-full justify-between">
                    <p className="font-bold text-[2vh] whitespace-nowrap overflow-hidden text-ellipsis max-w-[18vh] cursor-text">{name}</p>
                    <p className="text-[1.5vh] cursor-text capitalize">{category}</p>
                </div>
                <div className="flex justify-center items-center text-[1.5vh] h-[4vh] px-[1.5vh] rounded-[2vh] border border-[#fff] cursor-text capitalize">{rarity}</div>
            </div>
            <div className="w-full h-[17vh] flex justify-around items-center">
                <div className="h-[70%] aspect-square bg-center bg-no-repeat bg-contain" style={{ backgroundImage: `url(${img})` }}></div>
                <div className="grid grid-rows-2 grid-cols-1 gap-[2vh]">
                    <div className="flex justify-center items-center text-[1.5vh] py-[0.5vh] px-[2vh] border border-[#ccc] rounded-[2vh] cursor-text">{price} FTC</div>
                    <div
                        style={actionButtonStyle}
                        className={`flex justify-center items-center text-[1.5vh] py-[0.5vh] px-[2vh] rounded-[2vh] capitalize transition-transform duration-200 border text-black border-[#ccc] ${onwned ? 'font-semibold' : 'hover:brightness-110'}`}
                    >
                        {onwned ? 'Owned' : 'Buy'}
                    </div>
                </div>
            </div>
        </div>
    )
}
