"use client";
import { Card, CardBody } from "@heroui/react";


type datatype = {
	id: number;
	image_url: string;
	name: string;
	EloRange: string;
	onPlayClick: () => void;
};

const DynastyCard: React.FC<datatype> = ({
	image_url,
	name,
	EloRange,
	onPlayClick,
}: datatype) => {
	return (
		<div>
			<Card className="flex justify-center w-[300px] h-[450px] rounded-md border-2 border-[#BBA16780]">
				<CardBody className="relative overflow-hidden flex flex-col place-items-center">
					<img
						src={image_url}
						className="w-full h-[450px] object-cover bg-fixed"
					/>
					<div className="absolute mt-[350px] w-[350px] h-[130px] bg-black blur-lg"></div>
					<button
						onClick={onPlayClick}
						className="absolute z-10 flex justify-center items-center mt-[290px] w-[100px] h-[50px] !rounded-4xl border-2 border-[#8F802B] !bg-[#D99F16] font-medium text-2xl cursor-pointer"
					>
						PLAY
					</button>
					<div className="absolute pt-[350px] font-extrabold text-3xl font-serif text-white">
						{name}
					</div>
					<div className="absolute pt-[400px] font-extrabold text-xl font-serif text-white">
						ELO {EloRange}
					</div>
				</CardBody>
			</Card>
		</div>
	);
};

export default DynastyCard;
