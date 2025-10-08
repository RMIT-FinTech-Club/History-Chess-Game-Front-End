"use client";
import type React from "react";


interface EloBar {
  userElo: number;        
  levelStartElo: number;  
  levelEndElo: number;    
}

const EloBar = ({ userElo, levelStartElo, levelEndElo }: EloBar) => {
    const levelRange = levelEndElo - levelStartElo; 
    const progressInLevel = userElo - levelStartElo; 
    
    let percentage = (progressInLevel / levelRange) * 100;
    percentage = Math.max(0, Math.min(100, percentage));
    
    
    return (
			<section className="relative flex justify-center pt-20">
				<div className="max-w-[1000px] w-[1000px] max-h-[40px] h-[40px] rounded-xl bg-amber-50 relative overflow-hidden">
					<div
						className={`absolute top-0 left-0 h-full bg-amber-400 rounded-xl transition-all duration-500 ease-in-out`}
						style={{ width: `${percentage}%` }}
					/>

					<div className="absolute inset-0 flex items-center justify-center text-gray-800 font-bold z-10">
						{`ELO: ${userElo} / ${levelEndElo}`}
					</div>
				</div>
			</section>
		);
};

export default EloBar;













