"use client";
import { Card, CardBody } from "@heroui/react";

type DynastyCardProps = {
	id: number;
	image_url: string;
	name: string;
	EloRange: string;
	active: boolean;
	onPlay: () => void;
};

const DynastyCard: React.FC<DynastyCardProps> = ({
	image_url,
	name,
	EloRange,
	active,
	onPlay,
}: DynastyCardProps) => {
	const cardClassName = `group relative flex justify-center items-end h-[45vh] aspect-[2/3] rounded-[2vh] border-2 border-[#bba16780] overflow-hidden transition-transform duration-300 ease-out will-change-transform ${
		active
			? "scale-100 border-[#d9b76b] shadow-[0px_18px_38px_rgba(0,0,0,0.45)] z-10"
			: "scale-90 cursor-pointer bg-black"
	}`;

	const cardBodyClasses = `w-full h-full bg-center bg-cover bg-no-repeat transition-transform duration-300 ${active ? "" : "opacity-70 hover:opacity-100"}`;

	const titleClassName = `uppercase text-center font-bold tracking-[0.1vh] transition-all duration-300 ${
		active ? "text-[3vh]" : "text-[2vh]"
	}`;

	const eloClassName = `uppercase text-center transition-all duration-300 ${
		active ? "text-[2vh]" : "text-[1.4vh]"
	}`;

	const glowClasses = active
		? "bottom-[-5vh] h-[16vh]"
		: "bottom-[-3vh] h-[12vh]";

	const overlayHeight = active ? "h-[10vh]" : "h-[8vh]";

	return (
		<Card className={cardClassName}>
			<CardBody
				className={cardBodyClasses}
				style={{ backgroundImage: `url(${image_url})` }}
			>
				<div
					className={`absolute left-1/2 translate-x-[-50%] w-[120%] bg-black blur-lg transition-all duration-300 ${glowClasses}`}
				></div>
				<div
					className={`absolute bottom-0 left-0 w-full py-[1vh] px-[2vh] flex flex-col text-white ${overlayHeight}`}
				>
					<p className={titleClassName}>{name}</p>
					<p className={`${eloClassName} my-auto`}>
						Elo <span className="text-primary-yellow-1">{EloRange}</span>
					</p>
					<div
						className={`absolute left-1/2 translate-x-[-50%] bottom-[calc(100%+2vh)] bg-[linear-gradient(0deg,#8F802B,#DEAD26)] p-[0.4vh] rounded-[2.4vh] transition-all duration-300 ${
							active
								? "opacity-100 translate-y-0"
								: "opacity-0 translate-y-2 pointer-events-none"
						}`}
					>
						<button
							type="button"
							onClick={onPlay}
							className="text-[3vh] leading-[3vh] !py-[0.5vh] !px-[2vw] !text-white !bg-[#D99F16] uppercase !rounded-[2vh] hover:!text-black transition-colors duration-200 cursor-pointer"
						>
							Play
						</button>
					</div>
				</div>
			</CardBody>
		</Card>
	);
};

export default DynastyCard;
