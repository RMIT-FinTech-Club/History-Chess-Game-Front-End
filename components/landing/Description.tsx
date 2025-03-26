import { useRef } from "react"
import { motion, useInView } from 'framer-motion'

export default function Description() {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, margin: '0px 0px -20% 0px' })

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, transform: 'translateY(10%)' }}
            animate={isInView ? { opacity: 1, transform: 'translateY(0)' } : {}}
            transition={{ duration: 1, ease: "easeInOut" }}
        >
            <div className="flex flex-col justify-center items-center text-white my-[3vh] md:my-[5vh]">
                <div className="flex flex-col justify-center items-center">
                    <p className="md:text-[2.2rem] sm:text-[3.5rem] text-[2.5rem] text-center font-extrabold w-[90vw]">What is <span className="text-[#DBB968]">FinTech History Chess Game</span>?</p>
                    <p className="md:text-[1rem] md:leading-[1.4rem] sm:text-[2rem] sm:leading-[3rem] text-[1.7rem] leading-[2.5rem] text-justify mt-[2vh] w-[90vw] md:w-[60vw]">Lorem ipsum dolor sit amet consectetur. Quis faucibus nunc morbi nunc. Pharetra euismod arcu tellus sodales consectetur sagittis vitae quis. Quam suscipit suspendisse sagittis auctor et semper egestas neque pellentesque. Facilisi vulputate porttitor metus fermentum gravida eget. Ipsum arcu tempus in lacinia blandit maecenas condimentum enim. In leo dui sed aliquam leo fermentum neque. Elementum sed at eget amet purus tellus. Leo euismod nisi semper blandit sed id. Tortor nulla velit posuere in mauris tincidunt elementum donec sed.</p>
                </div>
            </div>
        </motion.div>
    )
}