import { useRef } from "react"
import { motion, useInView } from 'framer-motion'

export default function Button() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: '0px 0px -20% 0px' })

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, transform: 'translateY(10%)' }}
            animate={isInView ? { opacity: 1, transform: 'translateY(0)' } : {}}
            transition={{ duration: 1, ease: "easeInOut" }}
        >
            <div className="text-black text-[2.5rem] sm:text-[3rem] py-[1vw] px-[5vw] bg-[#DBB968] transition-colors duration-200 font-extrabold my-[3vh] md:my-[5vh] rounded-[2vw] cursor-pointer hover:text-white tracking-[0.1vw]">Start Your Game Now!</div>
        </motion.div>
    )
}