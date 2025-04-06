import styles from "@/css/landing/landing.module.css"

export default function Step1() {
    return (
        <div className={`flex flex-col items-center justify-center my-[3vh] md:my-[5vh] text-white w-[90vw] md:w-[60vw] ${styles.auto_blur}`}>
            <p className="md:text-[2.2rem] text-[2.5rem] text-center font-extrabold mb-[2vh] w-[90vw]">Step 1: Choose Game Mode</p>
            <div className="flex justify-between items-center flex-col md:flex-row">
                <div className="flex flex-col items-center md:items-start justify-center w-[90vw] md:w-[30vw] md:mb-0 mb-[3vh]">
                    <div className="md:w-[5vw] w-[12vw] bg-center bg-cover bg-no-repeat aspect-square" style={{ backgroundImage: `url(https://i.imgur.com/atVkdYE.png)` }}></div>
                    <p className="md:text-[1.5rem] text-[2.2rem] text-[#DBB968] my-[1vh] text-center">Bullet Mode (1 minute)</p>
                    <p className="md:text-[1rem] md:leading-[1.4rem] text-[1.7rem] leading-[2.5rem] text-justify md:text-justify md:w-[20vw] w-full">Lorem ipsum dolor sit amet consectetur. Quis faucibus nunc morbi nunc. Pharetra euismod arcu tellus sodales consectetur sagittis vitae quis.</p>
                </div>
                <div className="flex flex-col items-center md:items-start justify-center w-[90vw] md:w-[30vw]">
                    <div className="md:w-[5vw] w-[12vw] bg-center bg-cover bg-no-repeat aspect-square" style={{ backgroundImage: `url(https://i.imgur.com/atVkdYE.png)` }}></div>
                    <p className="md:text-[1.5rem] text-[2.2rem] text-[#DBB968] my-[1vh] text-center">Rapid Mode (10 minute)</p>
                    <p className="md:text-[1rem] md:leading-[1.4rem] text-[1.7rem] leading-[2.5rem] text-justify md:text-justify md:w-[20vw] w-full">Lorem ipsum dolor sit amet consectetur. Quis faucibus nunc morbi nunc. Pharetra euismod arcu tellus sodales consectetur sagittis vitae quis.</p>
                </div>
            </div>
        </div>
    )
}