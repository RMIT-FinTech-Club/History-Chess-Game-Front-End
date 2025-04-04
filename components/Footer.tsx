import Link from "next/link";
import styles from '@/css/footer.module.css'

export default function Footer() {
    return (
        <div className="overflow-hidden relative text-white shadow-[0 20dvh] md:mt-0 mt-[3dvh]">
            <div className="absolute md:block hidden top-[1px] -left-[100vw] border-x-[100vw] border-b-[10dvh] border-t-0 border-transparent border-b-[#000]"></div>
            <div className="absolute md:hidden block top-[1px] left-0 w-full h-[15dvh] bg-[#000] rounded-[15dvh_15dvh_0_0]"></div>
            <div className="w-full flex md:flex-row flex-col md:items-start items-center justify-start bg-[#000] mt-[15dvh] md:mt-[10dvh] md:pt-[5dvh] md:pb-[15dvh] pt-0 pb-[15dvh]">
                <div className="flex md:flex-row flex-col-reverse items-center">
                    <div className="md:w-[2vw] md:h-[20vw] w-[50vw] h-[5vw] mx-[5vw] flex flex-row md:flex-col justify-between items-center my-[3dvh] md:my-0">
                        <Link href={'https://www.facebook.com/rmitfintechclub'} className={`w-[5vw] md:w-[2vw] aspect-square bg-center bg-no-repeat bg-contain cursor-pointer ${styles.logo} ${styles.FB_logo}`}></Link>
                        <div className={`w-[5vw] md:w-[2vw] aspect-square bg-center bg-no-repeat bg-contain cursor-pointer ${styles.logo} ${styles.GH_logo}`}></div>
                        <div className={`w-[5vw] md:w-[2vw] aspect-square bg-center bg-no-repeat bg-contain cursor-pointer ${styles.logo} ${styles.TG_logo}`}></div>
                        <div className={`w-[5vw] md:w-[2vw] aspect-square bg-center bg-no-repeat bg-contain cursor-pointer ${styles.logo} ${styles.FM_logo}`}></div>
                        <div className={`w-[5vw] md:w-[2vw] aspect-square bg-center bg-no-repeat bg-contain cursor-pointer ${styles.logo} ${styles.IT_logo}`}></div>
                        <div className={`w-[5vw] md:w-[2vw] aspect-square bg-center bg-no-repeat bg-contain cursor-pointer ${styles.logo} ${styles.YT_logo}`}></div>
                        <div className={`w-[5vw] md:w-[2vw] aspect-square bg-center bg-no-repeat bg-contain cursor-pointer ${styles.logo} ${styles.TT_logo}`}></div>
                    </div>
                    <Link href={'https://www.rmitfintechclub.com/'} className={`w-[50vw] md:w-[20vw] aspect-square bg-no-repeat bg-contain bg-center mr-0 md:mr-[5vw] cursor-pointer ${styles.FTC_logo}`}></Link>
                </div>
                <div className="flex flex-col justify-start items-center md:items-start w-[80vw] md:w-[20vw] mr-0 md:mr-[5vw] mb-[3dvh] md:mb-0">
                    <p className="md:text-[1.5rem] text-[2.2rem] text-[#DBB968] mx-auto md:mx-0 font-bold mb-[1dvh] md:mb-0">ABOUT US</p>
                    <p className="md:text-[1rem] md:leading-[1.6rem] text-[2rem] leading-[3rem] my-0 md:my-[2dvh] md:text-left text-center mb-[3dvh] md:mb-[2dvh]">RMIT FinTech Club is the first ever student-led Financial Technology club in Vietnam, founded in 2020. Founded on the mission to bring Business & Technology</p>
                    <p className="md:hidden block md:text-[1.5rem] text-[2.2rem] text-[#DBB968] mx-auto md:mx-0 font-bold mb-[1dvh] md:mb-0">CONTACT US</p>
                    <div className="flex md:justify-start justify-center md:items-center items-start mb-[2dvh]">
                        <div className={`w-[5vw] md:w-[2vw] aspect-square mr-[1dvh] bg-no-repeat bg-center bg-contain ${styles.lc_ic}`}></div>
                        <p className="md:text-[1rem] md:leading-[1.6rem] text-[2rem] leading-[2.6rem] w-full md:w-[calc(18vw-1dvh)] md:text-left text-center">702 Đ. Nguyễn Văn Linh, Tân Hưng, Quận 7, Hồ Chí Minh</p>
                    </div>
                    <div className="flex md:justify-start justify-center items-center">
                        <div className={`w-[5vw] md:w-[2vw] aspect-square mr-[1dvh] bg-no-repeat bg-center bg-contain ${styles.em_ic}`}></div>
                        <Link href='mailto:fintechclub@rmit.edu.com' className={`md:text-[1rem] md:leading-[1.6rem] text-[2rem] leading-[2.6rem] w-full md:w-[calc(18vw-1dvh)] md:text-left text-center ${styles.link}`}>fintechclub@rmit.edu.com</Link>
                    </div>
                </div>
                <div className="flex flex-col justify-start items-center md:items-start w-[80vw] md:w-[20vw] mr-0 md:mr-[5vw]">
                    <p className="md:text-[1.5rem] text-[2.2rem] text-[#DBB968] font-bold mb-[2dvh]">IMPORTANT LINKS</p>
                    <Link href='' className={`md:text-[1rem] text-[2rem] mb-[2dvh] ${styles.link}`}>Home</Link>
                    <Link href='' className={`md:text-[1rem] text-[2rem] mb-[2dvh] ${styles.link}`}>About Us</Link>
                    <Link href='' className={`md:text-[1rem] text-[2rem] mb-[2dvh] ${styles.link}`}>Events</Link>
                    <Link href='' className={`md:text-[1rem] text-[2rem] mb-[2dvh] ${styles.link}`}>Projects</Link>
                    <Link href='' className={`md:text-[1rem] text-[2rem] mb-[2dvh] ${styles.link}`}>Join Us</Link>
                </div>
            </div>
            <div className={`absolute right-0 bottom-0 w-[50vw] md:w-[30vw] aspect-square bg-no-repeat bg-center bg-contain ${styles.bear}`}></div>
        </div>
    )
}