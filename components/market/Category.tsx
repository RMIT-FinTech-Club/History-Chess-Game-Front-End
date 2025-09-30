interface CategoryProps {
    name: string,
    img: string,
    active: boolean,
    onSelect?: () => void
}

export default function Category({ name, img, active, onSelect }: CategoryProps) {
    return (
        <div
            className={`h-full aspect-[2/1] rounded-[2vh] border-[0.5vh] ${active ? "bg-[#F4A918] border-white" : "bg-[#E9B655] border-[#36444B] hover:brightness-110 transition-colors duration-200"} flex justify-center items-center cursor-pointer relative`}
            onClick={onSelect}
        >
            <div className="h-[90%] aspect-square bg-center bg-no-repeat bg-contain" style={{ backgroundImage: `url(${img})` }}></div>
            <p className="text-white text-[100%] text-center absolute bottom-[1vh] left-1/2 translate-x-[-50%] font-bold">{name}</p>
        </div>
    )
}
