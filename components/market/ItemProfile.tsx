interface ItemProfileProps {
    rarity: string
    name: string
    price: number
    status: string
    desc: string
    imgSrc: string
    handleTurnOffProfile: Function
}

export default function ItemProfile({ rarity, name, price, status, desc, imgSrc, handleTurnOffProfile }: ItemProfileProps) {

    return (
        <div className="absolute z-100 top-0 left-0 w-full h-full flex justify-center items-center">
            <div 
                className="bg-[rgba(255,255,255,0.1)] blur-[20px] absolute top-0 left-0 w-full h-full cursor-pointer"
                onClick={handleTurnOffProfile}
            ></div>
            <div className="w-3/5 min-h-3/5 max-h-4/5 bg-secondary-bg-color rounded-[2vw] flex items-center p-[3vw] z-200">
                <div className="aspect-square h-[40vh] bg-contain bg-no-repeat bg-center" style={{ backgroundImage: `url(${imgSrc})` }}></div>
                <div className="w-full flex flex-col pl-[2vw] gap-[2vh]">
                    <div className="h-[4vh] rounded-[2vh] border-2 border-grey-smoke text-[2vh] leading-[2vh] flex justify-center items-center w-[max-content] bg-rarity-legendary px-[1vw] text-black font-bold">{rarity}</div>
                    <div className="flex justify-between items-center">
                        <p className="text-[5vh] leading-[5vh] font-bold">{name}</p>
                        <div className="h-[5vh] rounded-[2.5vh] text-[2.5vh] leading-[2vh] flex justify-center items-center w-[max-content] bg-[#E9B654] px-[1vw] text-[#BC5519] font-bold">{price} ETH</div>
                    </div>
                    <p className="text-[2vh] leading-[2vh] text-rarity-legendary font-bold">Status: {status}</p>
                    <p className="text-[2vh] leading-[3vh] w-full">{desc}</p>
                    <div className="flex justify-end items-center gap-[2vw]">
                        <div
                            className="flex justify-center items-center py-[0.5vh] px-[2vw] rounded-[0.5vh] font-bold border-2 border-white cursor-pointer"
                            onClick={handleTurnOffProfile}
                        >Cancel</div>
                        <div className="flex justify-center items-center py-[0.5vh] px-[2vw] rounded-[0.5vh] font-bold border-2 border-white cursor-pointer text-black bg-[#E9B654]">Buy Item</div>
                    </div>
                </div>
            </div>
        </div>
    )
}