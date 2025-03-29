"use client"

import styles from '@/css/profile.module.css'

export default function ProfilePage() {
    return (
        <div className="w-[80vw] flex flex-col mx-[10vw] text-white">
            <div className="w-full flex items-center rounded-[2vw] bg-[#1D1D1D] border border-solid border-[#77878B]">
                <div className="w-[32vw] flex justify-between items-center">
                    <div 
                        style={{ backgroundImage: `url(https://i.imgur.com/RoRONDn.jpeg)` }}
                        className="w-[8vw] m-[2vw] aspect-square rounded-[50%] bg-center bg-cover bg-no-repeat border border-white border-solid"
                    ></div>
                    <div className="w-[20vw] flex flex-col justify-between items-start">
                        <p className="text-[2rem] font-bold">Negic Legend</p>
                        <p className="text-[1.2rem] font-thin">Global Ranking: #100</p>
                        <p className="text-[1.2rem] font-thin">Player ID: 31082007</p>
                    </div>
                </div>
                <div className="w-[48vw] flex justify-around items-center">
                    <div className="w-[8vw] h-[10vw] flex flex-col justify-center items-center bg-black rounded-[1vw] border border-solid border-[#77878B]">
                        <div className={`w-[2.5vw] aspect-square bg-center bg-contain bg-no-repeat ${styles.profile_icon_1}`}></div>
                        <p className="text-[1vw] text-[#77878B] my-[1vh]">Level</p>
                        <p className="text-[1.5vw] leading-[1vw]">5</p>
                    </div>
                    <div className="w-[8vw] h-[10vw] flex flex-col justify-center items-center bg-black rounded-[1vw] border border-solid border-[#77878B]">
                        <div className={`w-[2.5vw] aspect-square bg-center bg-contain bg-no-repeat ${styles.profile_icon_2}`}></div>
                        <p className="text-[1vw] text-[#77878B] my-[1vh]">Game Mode</p>
                        <p className="text-[1.5vw] leading-[1vw]">1vs1</p>
                    </div>
                    <div className="w-[8vw] h-[10vw] flex flex-col justify-center items-center bg-black rounded-[1vw] border border-solid border-[#77878B]">
                        <div className={`w-[2.5vw] aspect-square bg-center bg-contain bg-no-repeat ${styles.profile_icon_3}`}></div>
                        <p className="text-[1vw] text-[#77878B] my-[1vh]">Wallet</p>
                        <p className="text-[1.5vw] leading-[1vw]">500K</p>
                    </div>
                    <div className="w-[8vw] h-[10vw] flex flex-col justify-center items-center bg-black rounded-[1vw] border border-solid border-[#77878B]">
                        <div className={`w-[2.5vw] aspect-square bg-center bg-contain bg-no-repeat ${styles.profile_icon_4}`}></div>
                        <p className="text-[1vw] text-[#77878B] my-[1vh]">Won Matches</p>
                        <p className="text-[1.5vw] leading-[1vw]">120</p>
                    </div>
                </div>
            </div>
            <div className="w-[80vw] ">
                
            </div>
        </div>
    )
}