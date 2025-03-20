"use client"

import YellowLight from "@/components/decor/YellowLight"

export default function LandingPage() {
  return (
    <>
      <YellowLight top={'20vh'} left={'60vw'} />
      <YellowLight top={'140vh'} left={'-30vw'} />
      <div className="flex flex-col items-center justify-center">
        <div className="flex flex-col justify-center items-center text-white my-[5vh] w-[90vw]">
          <p className="md:text-[1rem] md:my-[1vh] text-[2rem] my-[1.5vh] font-medium">welcome to</p>
          <div className="w-full text-[5rem] md:text-[3rem] font-extrabold text-center flex flex-col justify-center items-center">
            <p className="w-full tracking-[0.2vw]">FinTech History</p>
            <p className="w-full tracking-[0.2vw]">Chess Game</p>
          </div>
          <p className="md:text-[1rem] md:my-[1vh] text-[2rem] my-[1.5vh] font-light">Powered by <span className="font-bold">RMIT Vietnam FinTech Club</span></p>
          <div className="w-[60vw] bg-center bg-cover bg-no-repeat aspect-[16/9] rounded-[2vw]" style={{ backgroundImage: `url(https://i.imgur.com/1awORzp.jpeg)` }}></div>
        </div>
        <div className="flex flex-col justify-center items-center text-white my-[5vh]">
          <div className="flex flex-col justify-center items-center">
            <p className="md:text-[2.2rem] text-[3.5rem] text-center font-extrabold w-[90vw]">What is <span className="text-[#DBB968]">FinTech History Chess Game</span>?</p>
            <p className="md:text-[1rem] md:leading-[1.4rem] text-[2rem] leading-[2.6rem]  text-justify mt-[2vh] w-[60vw]">Lorem ipsum dolor sit amet consectetur. Quis faucibus nunc morbi nunc. Pharetra euismod arcu tellus sodales consectetur sagittis vitae quis. Quam suscipit suspendisse sagittis auctor et semper egestas neque pellentesque. Facilisi vulputate porttitor metus fermentum gravida eget. Ipsum arcu tempus in lacinia blandit maecenas condimentum enim. In leo dui sed aliquam leo fermentum neque. Elementum sed at eget amet purus tellus. Leo euismod nisi semper blandit sed id. Tortor nulla velit posuere in mauris tincidunt elementum donec sed.</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center my-[5vh] text-white w-[60vw]">
          <p className="md:text-[2.2rem] text-[3.5rem] text-center font-extrabold mb-[2vh] w-[90vw]">Step 1: Choose Game Mode</p>
          <div className="flex justify-between items-center">
            <div className="flex flex-col items-start justify-center w-[30vw]">
              <div className="md:w-[5vw] w-[7vw] bg-center bg-cover bg-no-repeat aspect-square" style={{ backgroundImage: `url(https://i.imgur.com/atVkdYE.png)` }}></div>
              <p className="md:text-[1.5rem] text-[2.2rem] text-[#DBB968] my-[1vh]">Bullet Mode (1 minute)</p>
              <p className="md:text-[1rem] md:leading-[1.4rem] text-[2rem] leading-[2.6rem] text-justify md:w-[20vw] w-[22vw]">Lorem ipsum dolor sit amet consectetur. Quis faucibus nunc morbi nunc. Pharetra euismod arcu tellus sodales consectetur sagittis vitae quis.</p>
            </div>
            <div className="flex flex-col items-start justify-center w-[30vw]">
              <div className="md:w-[5vw] w-[7vw] bg-center bg-cover bg-no-repeat aspect-square" style={{ backgroundImage: `url(https://i.imgur.com/atVkdYE.png)` }}></div>
              <p className="md:text-[1.5rem] text-[2.2rem] text-[#DBB968] my-[1vh]">Rapid Mode (10 minute)</p>
              <p className="md:text-[1rem] md:leading-[1.4rem] text-[2rem] leading-[2.6rem] text-justify md:w-[20vw] w-[22vw]">Lorem ipsum dolor sit amet consectetur. Quis faucibus nunc morbi nunc. Pharetra euismod arcu tellus sodales consectetur sagittis vitae quis.</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-center items-center text-white my-[5vh]">
          <p className="md:text-[2.2rem] text-[3.5rem] text-center font-extrabold mb-[2vh] w-[90vw]">Step 2: Challenge Other Players</p>
          <div className="flex flex-col justify-center items-start bg-[#1D1D1D] p-[2vw] rounded-[2vw] w-[50vw]">
            <p className="md:text-[1.8rem] text-[2.5rem] font-bold">Other Players</p>
            <div className="w-full my-[2vh] flex justify-between items-center">
              <div className="w-[70%] flex justify-start items-center">
                <div className="w-[3vw] aspect-square rounded-[50%] mr-[2vw] relative border border-solid border-white bg-center bg-cover bg-no-repeat" style={{ backgroundImage: `url(https://scontent.fsgn10-1.fna.fbcdn.net/v/t1.6435-9/118843170_379063756428270_2153792653409035582_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=JATNLW_MvrkQ7kNvgH1FKnj&_nc_oc=AdkrzEto3CFrW11zTkWGbVlJHW5d57GxZhNZeLdL6gOJBvtAhJWuzle_3eo9z2qHLrOp6pbW2Uf6fTNW0coDOvmX&_nc_zt=23&_nc_ht=scontent.fsgn10-1.fna&_nc_gid=W4oGblMebgwyjL42w7AabQ&oh=00_AYFZLF4vd17ip1k3NzT7aXjlKOGgjbIXQZYTOxFea4UUmQ&oe=680139C7)` }}>
                  <div className="w-1/2 bottom-[-0.2vw] absolute left-[0.75vw] aspect-[38/21] bg-center bg-cover bg-no-repeat" style={{ backgroundImage: `url(https://i.imgur.com/oAxJZQs.png)` }}></div>
                </div>
                <p className="md:text-[1.8rem] text-[2.5rem] font-bold whitespace-nowrap overflow-hidden text-ellipsis w-[27vw]">Negic Legend</p>
              </div>
              <div className="w-[30%] flex justify-center items-center">
                <p className="md:text-[1.8rem] text-[2.5rem] font-bold cursor-pointer hover:text-[#DBB968] transition-colors duration-200 p-[0.2vw]">Challenge</p>
              </div>
            </div>
            <div className="w-full my-[2vh] flex justify-between items-center">
              <div className="w-[70%] flex justify-start items-center">
                <div className="w-[3vw] aspect-square rounded-[50%] mr-[2vw] relative border border-solid border-white bg-center bg-cover bg-no-repeat" style={{ backgroundImage: `url(https://scontent.fsgn10-1.fna.fbcdn.net/v/t1.6435-9/118843170_379063756428270_2153792653409035582_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=JATNLW_MvrkQ7kNvgH1FKnj&_nc_oc=AdkrzEto3CFrW11zTkWGbVlJHW5d57GxZhNZeLdL6gOJBvtAhJWuzle_3eo9z2qHLrOp6pbW2Uf6fTNW0coDOvmX&_nc_zt=23&_nc_ht=scontent.fsgn10-1.fna&_nc_gid=W4oGblMebgwyjL42w7AabQ&oh=00_AYFZLF4vd17ip1k3NzT7aXjlKOGgjbIXQZYTOxFea4UUmQ&oe=680139C7)` }}>
                  <div className="w-1/2 bottom-[-0.2vw] absolute left-[0.75vw] aspect-[38/21] bg-center bg-cover bg-no-repeat" style={{ backgroundImage: `url(https://i.imgur.com/oAxJZQs.png)` }}></div>
                </div>
                <p className="md:text-[1.8rem] text-[2.5rem] font-bold whitespace-nowrap overflow-hidden text-ellipsis w-[27vw]">Negic Legend</p>
              </div>
              <div className="w-[30%] flex justify-center items-center">
                <p className="md:text-[1.8rem] text-[2.5rem] font-bold cursor-pointer hover:text-[#DBB968] transition-colors duration-200 p-[0.2vw]">Challenge</p>
              </div>
            </div>
            <div className="w-full my-[2vh] flex justify-between items-center">
              <div className="w-[70%] flex justify-start items-center">
                <div className="w-[3vw] aspect-square rounded-[50%] mr-[2vw] relative border border-solid border-white bg-center bg-cover bg-no-repeat" style={{ backgroundImage: `url(https://scontent.fsgn10-1.fna.fbcdn.net/v/t1.6435-9/118843170_379063756428270_2153792653409035582_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=JATNLW_MvrkQ7kNvgH1FKnj&_nc_oc=AdkrzEto3CFrW11zTkWGbVlJHW5d57GxZhNZeLdL6gOJBvtAhJWuzle_3eo9z2qHLrOp6pbW2Uf6fTNW0coDOvmX&_nc_zt=23&_nc_ht=scontent.fsgn10-1.fna&_nc_gid=W4oGblMebgwyjL42w7AabQ&oh=00_AYFZLF4vd17ip1k3NzT7aXjlKOGgjbIXQZYTOxFea4UUmQ&oe=680139C7)` }}>
                  <div className="w-1/2 bottom-[-0.2vw] absolute left-[0.75vw] aspect-[38/21] bg-center bg-cover bg-no-repeat" style={{ backgroundImage: `url(https://i.imgur.com/oAxJZQs.png)` }}></div>
                </div>
                <p className="md:text-[1.8rem] text-[2.5rem] font-bold whitespace-nowrap overflow-hidden text-ellipsis w-[27vw]">Negic Legend</p>
              </div>
              <div className="w-[30%] flex justify-center items-center">
                <p className="md:text-[1.8rem] text-[2.5rem] font-bold cursor-pointer hover:text-[#DBB968] transition-colors duration-200 p-[0.2vw]">Challenge</p>
              </div>
            </div>
            <div className="w-full my-[2vh] flex justify-between items-center">
              <div className="w-[70%] flex justify-start items-center">
                <div className="w-[3vw] aspect-square rounded-[50%] mr-[2vw] relative border border-solid border-white bg-center bg-cover bg-no-repeat" style={{ backgroundImage: `url(https://scontent.fsgn10-1.fna.fbcdn.net/v/t1.6435-9/118843170_379063756428270_2153792653409035582_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=JATNLW_MvrkQ7kNvgH1FKnj&_nc_oc=AdkrzEto3CFrW11zTkWGbVlJHW5d57GxZhNZeLdL6gOJBvtAhJWuzle_3eo9z2qHLrOp6pbW2Uf6fTNW0coDOvmX&_nc_zt=23&_nc_ht=scontent.fsgn10-1.fna&_nc_gid=W4oGblMebgwyjL42w7AabQ&oh=00_AYFZLF4vd17ip1k3NzT7aXjlKOGgjbIXQZYTOxFea4UUmQ&oe=680139C7)` }}>
                  <div className="w-1/2 bottom-[-0.2vw] absolute left-[0.75vw] aspect-[38/21] bg-center bg-cover bg-no-repeat" style={{ backgroundImage: `url(https://i.imgur.com/oAxJZQs.png)` }}></div>
                </div>
                <p className="md:text-[1.8rem] text-[2.5rem] font-bold whitespace-nowrap overflow-hidden text-ellipsis w-[27vw]">Negic Legend</p>
              </div>
              <div className="w-[30%] flex justify-center items-center">
                <p className="md:text-[1.8rem] text-[2.5rem] font-bold cursor-pointer hover:text-[#DBB968] transition-colors duration-200 p-[0.2vw]">Challenge</p>
              </div>
            </div>
            <div className="w-full my-[2vh] flex justify-between items-center">
              <div className="w-[70%] flex justify-start items-center">
                <div className="w-[3vw] aspect-square rounded-[50%] mr-[2vw] relative border border-solid border-white bg-center bg-cover bg-no-repeat" style={{ backgroundImage: `url(https://scontent.fsgn10-1.fna.fbcdn.net/v/t1.6435-9/118843170_379063756428270_2153792653409035582_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=a5f93a&_nc_ohc=JATNLW_MvrkQ7kNvgH1FKnj&_nc_oc=AdkrzEto3CFrW11zTkWGbVlJHW5d57GxZhNZeLdL6gOJBvtAhJWuzle_3eo9z2qHLrOp6pbW2Uf6fTNW0coDOvmX&_nc_zt=23&_nc_ht=scontent.fsgn10-1.fna&_nc_gid=W4oGblMebgwyjL42w7AabQ&oh=00_AYFZLF4vd17ip1k3NzT7aXjlKOGgjbIXQZYTOxFea4UUmQ&oe=680139C7)` }}>
                  <div className="w-1/2 bottom-[-0.2vw] absolute left-[0.75vw] aspect-[38/21] bg-center bg-cover bg-no-repeat" style={{ backgroundImage: `url(https://i.imgur.com/oAxJZQs.png)` }}></div>
                </div>
                <p className="md:text-[1.8rem] text-[2.5rem] font-bold whitespace-nowrap overflow-hidden text-ellipsis w-[27vw]">Negic Legend Legend Legend Legend Legend</p>
              </div>
              <div className="w-[30%] flex justify-center items-center">
                <p className="md:text-[1.8rem] text-[2.5rem] font-bold cursor-pointer hover:text-[#DBB968] transition-colors duration-200 p-[0.2vw]">Challenge</p>
              </div>
            </div>
          </div>
        </div>
        <div className="text-black text-[3rem] py-[1vw] px-[5vw] bg-[#DBB968] transition-colors duration-200 font-extrabold my-[5vh] rounded-[2vw] cursor-pointer hover:text-white tracking-[0.1vw]">Start Your Game Now!</div>
      </div>
    </>
  )
}