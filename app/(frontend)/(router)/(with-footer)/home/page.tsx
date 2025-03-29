"use client"

import styles from '@/css/home.module.css'
import YellowLight from '@/components/decor/YellowLight'

export default function HomePage() {
    return (
        <div className="text-white relative">
            <YellowLight left="-15vw" top="-15vw" />
            <p className="text-[5rem] text-center font-extrabold my-[5vh] w-full">Choose Game Mode</p>
            <div className="flex justify-around items-center md:flex-row flex-col mb-[5vh]">
                <div className="border border-white border-solid w-[80vw] md:w-[35vw] overflow-hidden rounded-[4vw] mb-[5vh] md:mb-0 flex flex-col bg-[linear-gradient(180deg,#E9B654,#363624)] cursor-pointer">
                    <div className={`w-full aspect-square bg-center bg-cover bg-no-repeat ${styles.chessboardBG}`}></div>
                    <div className="flex flex-col items-start justify-center">
                        <p className="text-[5rem] md:text-[3.5rem] text-center font-extrabold w-full my-[1vh]">Play Online</p>
                        <p className="text-[2rem] text-center opacity-80 w-full px-[4vw] mb-[2vh]">Match and play with someone at your level</p>
                    </div>
                </div>
                <div className="border border-white border-solid w-[80vw] md:w-[35vw] overflow-hidden rounded-[4vw] flex flex-col bg-[linear-gradient(180deg,#E9B654,#363624)] cursor-pointer">
                    <div className={`w-full aspect-square bg-center bg-cover bg-no-repeat ${styles.chessboardBG}`}></div>
                    <div className="flex flex-col items-start justify-center">
                        <p className="text-[5rem] md:text-[3.5rem] text-center font-extrabold w-full my-[1vh]">Play with Bot</p>
                        <p className="text-[2rem] text-center opacity-80 w-full px-[4vw] mb-[2vh]">Challenge yourself with our trained bot</p>
                    </div>
                </div>
            </div>
        </div>
    )
}