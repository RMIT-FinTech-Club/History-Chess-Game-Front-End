import Heading from "@/public/landing/SVG/heading"
import styles from "@/css/landing/title.module.css"

export default function Title() {
    return (
        <div className={`grid place-items-center relative text-white mb-[20dvh] md:mb-[30dvh] w-full h-[100ddvh] overflow-x-clip`}>
            <div className={`${styles.content} opacity-[1] flex flex-col justify-center items-center px-[5vw]`}>
                <p className="md:text-[4rem] text-[5rem] font-medium">welcome to</p>
                <Heading classes={`${styles.SVG} my-[3dvh] md:w-[60vw] w-[90vw]`} width="60vw" />
                <p className="md:text-[4rem] text-[5rem] font-light text-center">Powered by <span className="font-bold">RMIT Vietnam FinTech Club</span></p>
            </div>
            <video
                src="https://i.imgur.com/XpCnSpD.mp4"
                className={`${styles.bg} absolute grid-column-[1/-1] inset-0 w-full h-full object-cover z-[-1] brightness-[0.2]`}
                autoPlay
                loop
                muted
            />
        </div>
    )
}