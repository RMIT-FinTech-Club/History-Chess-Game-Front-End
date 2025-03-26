import { useRef } from "react"
import { motion, useInView } from 'framer-motion'

export default function Title() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: '0px 0px -20% 0px' })

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, transform: 'translateY(10%)' }}
            animate={isInView ? { opacity: 1, transform: 'translateY(0)'} : {}}
            transition={{ duration: 1, ease: "easeInOut" }}
        >
            <div className="flex flex-col justify-center items-center text-white my-[3vh] md:my-[5vh] w-[90vw]">
                <p className="md:text-[1rem] md:my-[1vh] sm:text-[2rem] sm:my-[1.5vh] text-[1.5rem] my-[1.5vh] font-medium">welcome to</p>
                <div className="w-full sm:text-[5rem] md:text-[3rem] text-[3rem] font-extrabold text-center flex flex-col justify-center items-center">
                    <p className="w-full tracking-[0.2vw]">FinTech History</p>
                    <p className="w-full tracking-[0.2vw]">Chess Game</p>
                </div>
                <p className="md:text-[1rem] md:my-[1vh] sm:text-[2rem] sm:my-[1.5vh] text-[1.5rem] my-[1.5vh] font-light text-center">Powered by <span className="font-bold">RMIT Vietnam FinTech Club</span></p>
                <div className="w-[90vw] md:w-[60vw] bg-center bg-cover bg-no-repeat aspect-[16/9] md:rounded-[2vw] rounded-[5vw]" style={{ backgroundImage: `url(https://i.imgur.com/1awORzp.jpeg)` }}></div>
            </div>
        </motion.div>
    )
}