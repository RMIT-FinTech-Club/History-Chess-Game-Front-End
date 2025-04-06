"use client"

import styles from '@/css/online_list.module.css'

export default function OnlineList() {
  return (
    <div className={`w-full min-h-screen flex flex-col justify-start items-center relative text-white ${styles.container}`}>
      <p className="text-[3rem] md:text-[3rem] font-extrabold text-center mx-auto my-[3dvh] tracking-[0.2vw]">Online Players</p>
      <div className="w-[90vw] md:w-[70vw] flex flex-col justify-center items-start">
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className={`w-full h-[8dvh] sm:h-[15dvh] mb-[5dvh] rounded-[2vw] bg-[rgba(255,255,255,0.3)] border-[0.1px] border-solid border-[#EEFF07] flex justify-start items-center ${styles.player}`}>
            <div 
              className="sm:h-[9dvh] h-[5dvh] aspect-square rounded-[50%] mx-[1dvh] sm:mx-[3dvh] border border-solid border-white bg-center bg-cover bg-no-repeat" 
              style={{ backgroundImage: `url(https://scontent.fsgn10-1.fna.fbcdn.net/v/t1.6435-9/118843170_379063756428270_2153792653409035582_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=JATNLW_MvrkQ7kNvgH1FKnj&_nc_oc=AdkrzEto3CFrW11zTkWGbVlJHW5d57GxZhNZeLdL6gOJBvtAhJWuzle_3eo9z2qHLrOp6pbW2Uf6fTNW0coDOvmX&_nc_zt=23&_nc_ht=scontent.fsgn10-1.fna&_nc_gid=W4oGblMebgwyjL42w7AabQ&oh=00_AYFZLF4vd17ip1k3NzT7aXjlKOGgjbIXQZYTOxFea4UUmQ&oe=680139C7)` }}>
            </div>
            <div className="flex justify-center items-center w-[calc(100%-8dvh-2vw)] sm:w-[calc(100%-15dvh-2vw)] h-full ml-[2vw]">
              <div className="flex flex-col w-[calc(70%/2)] md:w-[calc(70%/3)] h-full items-start justify-center">
                <p className="text-[#C4C4C4] sm:text-[1.3rem] text-[1rem] mb-[1dvh]">Player</p>
                <p className="font-bold sm:text-[1.3rem] text-[1rem] whitespace-nowrap overflow-hidden text-ellipsis w-full">{index == 9 ? 'Negic LegendLegendLegendLegend' : 'Negic Legend'}</p>
              </div>
              <div className="flex flex-col w-[calc(70%/2)] md:w-[calc(70%/3)] h-full items-start justify-center">
                <p className="text-[#C4C4C4] sm:text-[1.3rem] text-[1rem] mb-[1dvh]">Mode</p>
                <p className="font-bold sm:text-[1.3rem] text-[1rem]">Classic</p>
              </div>
              <div className="md:flex hidden flex-col w-[calc(70%/3)] h-full items-start justify-center">
                <p className="text-[#C4C4C4] text-[1.3rem] mb-[1dvh]">Global Ranking</p>
                <p className="font-bold text-[1.3rem]">20:25</p>
              </div>
              <div className="w-[30%] h-full flex justify-start items-center">
                <p className={`sm:ml-[1vw] ml-0 text-[1.4rem] sm:text-[2rem] text-[#EEFF07] cursor-pointer relative font-bold ${styles.challenge}`}>Challenge</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}