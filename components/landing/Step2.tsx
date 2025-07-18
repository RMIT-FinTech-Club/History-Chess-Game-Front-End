import styles from "@/css/landing/landing.module.css"

export default function Step2() {
    return (
        <div className={`flex flex-col justify-center items-center text-white my-[3vh] md:my-[5vh] ${styles.auto_blur}`}>
            <p className="md:text-[2.2rem] sm:text-[3.5rem] text-[2.5rem] text-center font-extrabold mb-[2vh] w-[90vw]">Step 2: Challenge Other Players</p>
            <div className="flex flex-col justify-center items-start bg-[#1D1D1D] p-[5vw] md:p-[2vw] rounded-[5vw] md:rounded-[2vw] w-[90vw] md:w-[60vw]">
                <p className="md:text-[1.8rem] sm:text-[3rem] text-[2.2rem] font-bold">Other Players</p>
                {Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="w-full my-[2vh] flex justify-between items-center">
                        <div className="w-[70%] flex justify-start items-center">
                            <div className="w-[12vw] sm:w-[6vw] md:w-[3vw] aspect-square rounded-[50%] mr-[5vw] sm:mr-[2vw] relative border border-solid border-white bg-center bg-cover bg-no-repeat" style={{ backgroundImage: `url(https://i.imgur.com/RoRONDn.jpeg)` }}>
                                <div className="w-1/2 bottom-[-1vw] sm:bottom-[-0.6vw] md:bottom-[-0.2vw] absolute left-[3vw] sm:left-[1.5vw] md:left-[0.5vw] aspect-[38/21] bg-center bg-cover bg-no-repeat" style={{ backgroundImage: `url(https://i.imgur.com/oAxJZQs.png)` }}></div>
                            </div>
                            <p className="md:text-[1.8rem] sm:text-[2.5rem] text-[1.5rem] font-bold whitespace-nowrap overflow-hidden text-ellipsis w-[40vw] sm:w-[50vw]">{index == 4 ? 'Negic LegendLegendLegendLegendLegendLegend' : 'Negic Legend'}</p>
                        </div>
                        <div className="w-[30%] flex justify-center items-center">
                            <p className="md:text-[1.8rem] sm:text-[2.5rem] text-[1.5rem] font-bold cursor-pointer hover:text-[#DBB968] transition-colors duration-200 p-[0.2vw]">Challenge</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}