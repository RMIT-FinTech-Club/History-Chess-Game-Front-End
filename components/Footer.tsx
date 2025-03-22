import Link from "next/link";
import styles from '@/css/footer.module.css'

export default function Footer() {
    return (
        <div className="overflow-hidden relative text-white">
            <div className="absolute top-0 -left-[100vw] border-x-[100vw] border-b-[10vh] border-t-0 border-transparent border-b-[#000]"></div>
            <div className="w-full flex justify-start bg-[#000] mt-[10vh] pt-[5vh] pb-[15vh]">
                <div className="w-[10vw] h-[20vw] mr-[5vw] flex flex-col justify-between items-center">
                    <Link href={'https://www.facebook.com/rmitfintechclub'} className={`w-[2vw] aspect-square bg-center bg-no-repeat bg-contain cursor-pointer ${styles.logo} ${styles.FB_logo}`}></Link>
                    <div className={`w-[2vw] aspect-square bg-center bg-no-repeat bg-contain cursor-pointer ${styles.logo} ${styles.GH_logo}`}></div>
                    <div className={`w-[2vw] aspect-square bg-center bg-no-repeat bg-contain cursor-pointer ${styles.logo} ${styles.TG_logo}`}></div>
                    <div className={`w-[2vw] aspect-square bg-center bg-no-repeat bg-contain cursor-pointer ${styles.logo} ${styles.FM_logo}`}></div>
                    <div className={`w-[2vw] aspect-square bg-center bg-no-repeat bg-contain cursor-pointer ${styles.logo} ${styles.IT_logo}`}></div>
                    <div className={`w-[2vw] aspect-square bg-center bg-no-repeat bg-contain cursor-pointer ${styles.logo} ${styles.YT_logo}`}></div>
                    <div className={`w-[2vw] aspect-square bg-center bg-no-repeat bg-contain cursor-pointer ${styles.logo} ${styles.TT_logo}`}></div>
                </div>
                <Link href={'https://www.rmitfintechclub.com/'} className={`w-[20vw] aspect-square bg-no-repeat bg-contain bg-center mr-[5vw] cursor-pointer ${styles.FTC_logo}`}></Link>
                <div className="flex flex-col justify-start items-start w-[20vw] mr-[5vw]">
                    <p className="md:text-[1.5rem] text-[2.2rem] text-[#DBB968] font-bold">ABOUT US</p>
                    <p className="md:text-[1rem] md:leading-[1.6rem] text-[2rem] leading-[2.6rem] my-[2vh]">RMIT FinTech Club is the first ever student-led Financial Technology club in Vietnam, founded in 2020. Founded on the mission to bring Business & Technology</p>
                    <div className="flex justify-start items-center mb-[2vh]">
                        <div className={`w-[2vw] aspect-square mr-[1vh] bg-no-repeat bg-center bg-contain ${styles.lc_ic}`}></div>
                        <p className="md:text-[1rem] md:leading-[1.6rem] text-[2rem] leading-[2.6rem] w-[calc(18vw-1vh)]">702 Đ. Nguyễn Văn Linh, Tân Hưng, Quận 7, Hồ Chí Minh</p>
                    </div>
                    <div className="flex justify-start items-center">
                        <div className={`w-[2vw] aspect-square mr-[1vh] bg-no-repeat bg-center bg-contain ${styles.em_ic}`}></div>
                        <Link href='mailto:fintechclub@rmit.edu.com' className={`md:text-[1rem] md:leading-[1.6rem] text-[2rem] leading-[2.6rem] w-[calc(18vw-1vh)] ${styles.link}`}>fintechclub@rmit.edu.com</Link>
                    </div>
                </div>
                <div className="flex flex-col justify-start items-start w-[20vw] mr-[5vw]">
                    <p className="md:text-[1.5rem] text-[2.2rem] text-[#DBB968] font-bold mb-[2vh]">IMPORTANT LINKS</p>
                    <Link href='' className={`md:text-[1rem] text-[2rem] mb-[2vh] ${styles.link}`}>Home</Link>
                    <Link href='' className={`md:text-[1rem] text-[2rem] mb-[2vh] ${styles.link}`}>About Us</Link>
                    <Link href='' className={`md:text-[1rem] text-[2rem] mb-[2vh] ${styles.link}`}>Events</Link>
                    <Link href='' className={`md:text-[1rem] text-[2rem] mb-[2vh] ${styles.link}`}>Projects</Link>
                    <Link href='' className={`md:text-[1rem] text-[2rem] mb-[2vh] ${styles.link}`}>Join Us</Link>
                </div>
            </div>
            <div className={`absolute right-0 bottom-0 w-[30vw] aspect-square bg-no-repeat bg-center bg-contain ${styles.bear}`}></div>
        </div>
    )
}