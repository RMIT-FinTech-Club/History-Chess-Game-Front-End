import styles from "@/css/landing/landing.module.css"

export default function Button() {
    return (
        <div className={`text-black text-[2.5rem] sm:text-[3rem] py-[1vw] px-[5vw] bg-[#DBB968] transition-colors duration-200 font-extrabold my-[3dvh] md:my-[5dvh] rounded-[2vw] cursor-pointer hover:text-white tracking-[0.1vw] ${styles.auto_blur}`}>Start Your Game Now!</div>
    )
}