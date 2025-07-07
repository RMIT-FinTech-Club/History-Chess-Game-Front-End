import styles from "@/css/profile.module.css"

interface ProfilePlayersProps {
    isopen: boolean
}

export default function ProfilePlayers({ isopen }: ProfilePlayersProps) {
    return (
        <div className="p-[2vw] w-full h-[100%] hidden md:flex flex-col bg-[#1D1D1D] rounded-[2vw]">
            <p className="text-[2vw] leading-[2vw] mb-[3vh]">Other Players</p>
            <div className={`flex flex-col w-full ${isopen ? 'h-[calc(100vh-12vw-3vh-2px-3vh-14vw-6vh-6vw-3vh)]' : 'h-[calc(100vh-3vh-3vh-14vw-6vh-6vw-3vh)]'} overflow-y-auto overflow-x-hidden transition-all duration-300 list-container`}>
                {Array.from({ length: 20 }).map((_, index) => (
                    <div key={index} className={`flex relative ${styles.online_player} justify-start items-center ${index == 19 ? 'mb-0' : 'mb-[3dvh]'}`}>
                        <div
                            style={{ backgroundImage: `url(https://i.imgur.com/RoRONDn.jpeg)` }}
                            className="w-[calc(3vw-2px)] bg-center bg-cover bg-no-repeat aspect-square rounded-[50%] border border-solid border-white"
                        ></div>
                        <p className="w-full mx-[1vw] text-[1.2vw] whitespace-nowrap overflow-hidden text-ellipsis">{index == 19 ? 'Negic Legend Legend Legend' : 'Negic Legend'}</p>
                        <p className="text-[1.2vw] text-[#C4C4C4] md:hover:text-[#DBB968] hover:text-white cursor-pointer">Challenge</p>
                    </div>
                ))}
            </div>
        </div>
    )
}