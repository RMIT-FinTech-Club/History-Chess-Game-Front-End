import React from 'react';

interface YellowLightProps {
    top: string;
    left: string;
}

export default function YellowLight({ top, left }: YellowLightProps) {
    return (
        <div 
            className="hidden md:block absolute w-[40vw] aspect-square rounded-[50%] z-[-10] bg-[#DDBA68]"
            style={{ 
                filter: 'blur(100px)',
                top: `${top}`,
                left: `${left}`,
            }}
        ></div>
    );
}