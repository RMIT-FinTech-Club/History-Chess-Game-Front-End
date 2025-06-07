"use client";

import styles from "@/css/profile.module.css";
import GamePadIcon from "@/components/ui/gamePadIcon";

const matches = [
  {
    opponent: "Negic Legend",
    avt: "https://i.imgur.com/RoRONDn.jpeg",
    mode: "Rapid",
    time: 683,
    victory: true,
  },
  {
    opponent: "Negic LegendLegendLegendLegendLegendLegendLegend",
    avt: "https://i.imgur.com/RoRONDn.jpeg",
    mode: "Rapid",
    time: 683,
    victory: false,
  },
  {
    opponent: "Negic Legend",
    avt: "https://i.imgur.com/RoRONDn.jpeg",
    mode: "Rapid",
    time: 683,
    victory: true,
  },
  {
    opponent: "Negic Legend",
    avt: "https://i.imgur.com/RoRONDn.jpeg",
    mode: "Rapid",
    time: 683,
    victory: true,
  },
  {
    opponent: "Negic Legend",
    avt: "https://i.imgur.com/RoRONDn.jpeg",
    mode: "Rapid",
    time: 683,
    victory: true,
  },
  {
    opponent: "Negic Legend",
    avt: "https://i.imgur.com/RoRONDn.jpeg",
    mode: "Rapid",
    time: 683,
    victory: true,
  },
  {
    opponent: "Negic Legend",
    avt: "https://i.imgur.com/RoRONDn.jpeg",
    mode: "Rapid",
    time: 683,
    victory: true,
  },
  {
    opponent: "Negic Legend",
    avt: "https://i.imgur.com/RoRONDn.jpeg",
    mode: "Rapid",
    time: 683,
    victory: true,
  },
  {
    opponent: "Negic Legend",
    avt: "https://i.imgur.com/RoRONDn.jpeg",
    mode: "Rapid",
    time: 683,
    victory: true,
  },
  {
    opponent: "Negic Legend",
    avt: "https://i.imgur.com/RoRONDn.jpeg",
    mode: "Rapid",
    time: 683,
    victory: true,
  },
  {
    opponent: "Negic Legend",
    avt: "https://i.imgur.com/RoRONDn.jpeg",
    mode: "Rapid",
    time: 683,
    victory: true,
  },
];

export default function Matches() {
  return (
    <>
      <div className="flex items-center">
          <GamePadIcon width="3vw" />
          <p className="text-[3vw] leading-[3vw] ml-[1vw]">Matches</p>
      </div>
      <div className={`flex flex-col w-full h-[calc(100dvh-3vh-15vw-3vh-6vw-3vh-3vw-2vh+4px-6vh)] md:h-[100%] overflow-y-auto mt-[2vh] ${styles.list_container}`}>
          {matches.map((match, index) => (
              <div
                  key={index}
                  className={`${index !== matches.length - 1 ? 'mb-[3vh]' : 'mb-0'} ${styles.match} w-full rounded-[1vw] bg-[rgba(0,0,0,0.5)] border border-solid ${match.victory ? `border-[#1CFF07] ${styles.victory}` : 'border-[#EA4335]'}`}
              >
                  <div className="w-full flex items-center justify-start px-[2vw] md:px-[1vw] rounded-[1vw] overflow-y-hidden">
                      <div
                          style={{ backgroundImage: `url(${match.avt})` }}
                          className="w-[calc(8vw-2px)] md:w-[calc(4vw-2px)] my-[2vw] md:my-[1vw] aspect-square rounded-[50%] bg-center bg-cover bg-no-repeat border border-white border-solid mr-[2vw] md:mr-[1vw]"
                      ></div>
                      <div className="w-[100%] flex justify-between items-center mr-[3vw]">
                          <div className="flex flex-col justify-center items-start mr-[2vw]">
                              <p className="text-[1.8vw] md:text-[1vw] text-[#C4C4C4]">Opponent</p>
                              <p className="text-[1.8vw] md:text-[1vw] font-bold w-[30vw] md:w-[15vw] whitespace-nowrap overflow-hidden text-ellipsis">{match.opponent}</p>
                          </div>
                          <div className="flex justify-between items-center w-[100%]">
                              <div className="flex flex-col justify-center items-start">
                                  <p className="text-[1.8vw] md:text-[1vw] text-[#C4C4C4]">Game Mode</p>
                                  <p className="text-[1.8vw] md:text-[1vw] font-bold">{match.mode}</p>
                              </div>
                              <div className="flex flex-col justify-center items-start">
                                  <p className="text-[1.8vw] md:text-[1vw] text-[#C4C4C4]">Time</p>
                                  <p className="text-[1.8vw] md:text-[1vw] font-bold">{`${Math.floor(match.time / 60)}:${match.time % 60}`}</p>
                              </div>
                          </div>
                      </div>
                      <div className="w-[22vw] md:w-[16vw] flex justify-center items-center">
                          <p className={`text-[1.5vw] px-[2vw] mr-[1vw] relative ${match.victory ? 'text-[#1CFF07]' : 'text-[#EA4335]'} font-bold ${styles.result}`}>{match.victory ? 'Victory' : 'Defeat'}</p>
                      </div>
                  </div>
              </div>
          ))}
      </div>
    </>
  );
}
