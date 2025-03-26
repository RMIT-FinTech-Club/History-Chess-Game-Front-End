import { useRef } from "react"
import { motion, useInView } from 'framer-motion'

export default function Step1() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: '0px 0px -20% 0px' })

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, transform: 'translateY(10%)' }}
            animate={isInView ? { opacity: 1, transform: 'translateY(0)' } : {}}
            transition={{ duration: 1, ease: "easeInOut" }}
        >
            <div className="flex flex-col items-center justify-center my-[3vh] md:my-[5vh] text-white w-[90vw] md:w-[60vw]">
                <p className="md:text-[2.2rem] sm:text-[3.5rem] text-[2.5rem] text-center font-extrabold mb-[2vh] w-[90vw]">Step 1: Choose Game Mode</p>
                <div className="flex justify-between items-center flex-col sm:flex-row">
                    <div className="flex flex-col items-center md:items-start justify-center w-[90vw] sm:w-[45vw] md:w-[30vw] sm:mb-0 mb-[3vh]">
                        <div className="md:w-[5vw] sm:w-[7vw] w-[12vw] bg-center bg-cover bg-no-repeat aspect-square" style={{ backgroundImage: `url(https://i.imgur.com/atVkdYE.png)` }}></div>
                        <p className="md:text-[1.5rem] text-[2.2rem] text-[#DBB968] my-[1vh] text-center">Bullet Mode (1 minute)</p>
                        <p className="md:text-[1rem] md:leading-[1.4rem] sm:text-[2rem] sm:leading-[3rem] text-[1.7rem] leading-[2.5rem] text-justify md:text-justify md:w-[20vw] sm:w-[35vw] w-full">Lorem ipsum dolor sit amet consectetur. Quis faucibus nunc morbi nunc. Pharetra euismod arcu tellus sodales consectetur sagittis vitae quis.</p>
                    </div>
                    <div className="flex flex-col items-center md:items-start justify-center w-[90vw] sm:w-[45vw] md:w-[30vw]">
                        <div className="md:w-[5vw] sm:w-[7vw] w-[12vw] bg-center bg-cover bg-no-repeat aspect-square" style={{ backgroundImage: `url(https://i.imgur.com/atVkdYE.png)` }}></div>
                        <p className="md:text-[1.5rem] text-[2.2rem] text-[#DBB968] my-[1vh] text-center">Rapid Mode (10 minute)</p>
                        <p className="md:text-[1rem] md:leading-[1.4rem] sm:text-[2rem] sm:leading-[3rem] text-[1.7rem] leading-[2.5rem] text-justify md:text-justify md:w-[20vw] sm:w-[35vw] w-full">Lorem ipsum dolor sit amet consectetur. Quis faucibus nunc morbi nunc. Pharetra euismod arcu tellus sodales consectetur sagittis vitae quis.</p>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}