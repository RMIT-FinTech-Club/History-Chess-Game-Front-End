"use client";
import { useState } from "react";
import { StockfishLevel } from "@/app/game/offline/hooks/useStockfish";
import type React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import DynastyCard from "./components/DynastyCard";
import EloBar from "./components/EloBar";
import { useRouter } from "next/navigation";

type datatype = {
	id: number;
	image_url: string;
	name: string;
	botLevel: StockfishLevel;
	EloRange: string;
};

const dynasty: datatype[] = [
	{
		id: 1,
		image_url:
			"https://ik.imagekit.io/historygame/ngoquyen.jpg?updatedAt=1755866819730",
		name: "Ngo Dynasty",
		botLevel: 1,
		EloRange: "0 - 200",
	},

	{
		id: 2,
		image_url:
			"https://ik.imagekit.io/historygame/ngoquyen.jpg?updatedAt=1755866819730",
		name: "Tran Dynasty",
		botLevel: 1,
		EloRange: "100 - 200",
	},

	{
		id: 3,
		image_url:
			"https://ik.imagekit.io/historygame/ngoquyen.jpg?updatedAt=1755866819730",
		name: "Ngo Dynasty",
		botLevel: 2,
		EloRange: "100 - 200",
	},

	{
		id: 4,
		image_url:
			"https://ik.imagekit.io/historygame/ngoquyen.jpg?updatedAt=1755866819730",
		name: "Ngo Dynasty",
		botLevel: 2,
		EloRange: "100 - 200",
	},

	{
		id: 5,
		image_url:
			"https://ik.imagekit.io/historygame/ngoquyen.jpg?updatedAt=1755866819730",
		name: "Ngo Dynasty",
		botLevel: 3,
		EloRange: "100 - 200",
	},

	{
		id: 6,
		image_url:
			"https://ik.imagekit.io/historygame/ngoquyen.jpg?updatedAt=1755866819730",
		name: "Ngo Dynasty",
		botLevel: 5,
		EloRange: "100 - 200",
	},

	{
		id: 7,
		image_url:
			"https://ik.imagekit.io/historygame/ngoquyen.jpg?updatedAt=1755866819730",
		name: "Ngo Dynasty",
		botLevel: 8,
		EloRange: "100 - 200",
	},

	{
		id: 8,
		image_url:
			"https://ik.imagekit.io/historygame/ngoquyen.jpg?updatedAt=1755866819730",
		name: "Ngo Dynasty",
		botLevel: 10,
		EloRange: "100 - 200",
	},

	{
		id: 9,
		image_url:
			"https://ik.imagekit.io/historygame/ngoquyen.jpg?updatedAt=1755866819730",
		name: "Ngo Dynasty",
		botLevel: 15,
		EloRange: "100 - 200",
	},

	{
		id: 10,
		image_url:
			"https://ik.imagekit.io/historygame/ngoquyen.jpg?updatedAt=1755866819730",
		name: "Ngo Dynasty",
		botLevel: 20,
		EloRange: "100 - 200",
	},
];

export default function DynastyJourney() {
	const [imageIndex, setImageIndex] = useState(1);
	const currentLevelStartElo = 40;
	const currentLevelEndElo = 2000;
	const [userElo] = useState<number>(400);
	const router = useRouter();

	const updateActiveCard = (index: number) => {
		const nextDynasty = dynasty[index];
		if (nextDynasty) {
			setImageIndex(nextDynasty.id);
		}
	};

	const settings = {
		infinite: true,
		speed: 400,
		focusOnSelect: true,
		lazyload: true,
		slidesToShow: 5,
		centerMode: true,
		centerPadding: "0px",
		adaptiveHeight: false,
		arrows: false,
		beforeChange: (_: number, next: number) => updateActiveCard(next),
		afterChange: (currentpage: number) => {
			updateActiveCard(currentpage);
		},
	};
	const handlePlay = (level: StockfishLevel) => {
		router.push(`/game/offline?mode=singleplayer&level=${level}&autostart=1&color=white`);
	};

	return (
		<section className="h-[calc(100dvh-var(--navbar-height))] flex flex-col p-[5vh]">
			<div className="my-auto w-full">
				<Slider {...settings}>
					{dynasty.map((item) => (
						<div key={item.id} className="px-[1.5vh] flex justify-center">
							<DynastyCard
								id={item.id}
								image_url={item.image_url}
								name={item.name}
								EloRange={item.EloRange}
								active={item.id === imageIndex}
								onPlay={() => handlePlay(item.botLevel)}
							/>
						</div>
					))}
				</Slider>
			</div>
			<EloBar
				userElo={userElo}
				levelStartElo={currentLevelStartElo}
				levelEndElo={currentLevelEndElo}
			/>
		</section>
	);
}
