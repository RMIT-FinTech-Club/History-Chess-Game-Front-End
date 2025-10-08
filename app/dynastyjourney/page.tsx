"use client";
import { useState} from "react";
import { StockfishLevel } from "@/app/game/offline/hooks/useStockfish";
import type React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import "./components/carousel.css";
import DynastyCard from "./components/DynastyCard";
import EloBar from "./components/EloBar";
import Level from "./components/Level";

type datatype = {
	id: number;
	image_url: string;
	name: string;
	level1: string;
	level2: string;
	level3: string;
	level4: string;
	level5: string;
	EloRange: string;
};

const dynasty: datatype[] = [
	{
		id: 1,
		image_url:
			"https://ik.imagekit.io/historygame/ngoquyen.jpg?updatedAt=1755866819730",
		name: "Ngo Dynasty",
		level1: "40",
		level2: "80",
		level3: "120",
		level4: "160",
		level5: "200",
		EloRange: "0-200",
	},

	{
		id: 2,
		image_url:
			"https://ik.imagekit.io/historygame/ngoquyen.jpg?updatedAt=1755866819730",
		name: "Tran Dynasty",
		level1: "240",
		level2: "280",
		level3: "320",
		level4: "360",
		level5: "400",
		EloRange: "100-200",
	},

	{
		id: 3,
		image_url:
			"https://ik.imagekit.io/historygame/ngoquyen.jpg?updatedAt=1755866819730",
		name: "Ngo Dynasty",
		level1: "40",
		level2: "80",
		level3: "120",
		level4: "160",
		level5: "200",
		EloRange: "100-200",
	},

	{
		id: 4,
		image_url:
			"https://ik.imagekit.io/historygame/ngoquyen.jpg?updatedAt=1755866819730",
		name: "Ngo Dynasty",
		level1: "40",
		level2: "80",
		level3: "120",
		level4: "160",
		level5: "200",
		EloRange: "100-200",
	},

	{
		id: 5,
		image_url:
			"https://ik.imagekit.io/historygame/ngoquyen.jpg?updatedAt=1755866819730",
		name: "Ngo Dynasty",
		level1: "40",
		level2: "80",
		level3: "120",
		level4: "160",
		level5: "200",
		EloRange: "100-200",
	},

	{
		id: 6,
		image_url:
			"https://ik.imagekit.io/historygame/ngoquyen.jpg?updatedAt=1755866819730",
		name: "Ngo Dynasty",
		level1: "40",
		level2: "80",
		level3: "120",
		level4: "160",
		level5: "200",
		EloRange: "100-200",
	},

	{
		id: 7,
		image_url:
			"https://ik.imagekit.io/historygame/ngoquyen.jpg?updatedAt=1755866819730",
		name: "Ngo Dynasty",
		level1: "40",
		level2: "80",
		level3: "120",
		level4: "160",
		level5: "200",
		EloRange: "100-200",
	},

	{
		id: 8,
		image_url:
			"https://ik.imagekit.io/historygame/ngoquyen.jpg?updatedAt=1755866819730",
		name: "Ngo Dynasty",
		level1: "40",
		level2: "80",
		level3: "120",
		level4: "160",
		level5: "200",
		EloRange: "100-200",
	},

	{
		id: 9,
		image_url:
			"https://ik.imagekit.io/historygame/ngoquyen.jpg?updatedAt=1755866819730",
		name: "Ngo Dynasty",
		level1: "40",
		level2: "80",
		level3: "120",
		level4: "160",
		level5: "200",
		EloRange: "100-200",
	},

	{
		id: 10,
		image_url:
			"https://ik.imagekit.io/historygame/ngoquyen.jpg?updatedAt=1755866819730",
		name: "Ngo Dynasty",
		level1: "40",
		level2: "80",
		level3: "120",
		level4: "160",
		level5: "200",
		EloRange: "100-200",
	},
];



export default function DynastyJourney() {
	const [imageIndex, setImageIndex] = useState(1);
	const [showLevels, setShowLevels] = useState<datatype | null>(null);
	const currentLevelStartElo = 40;
	const currentLevelEndElo = 2000;
	const [userElo, setUserElo] = useState<number>(400);
	const [unlockedDynastyid, setUnlockedDynastyid] = useState<number[]>([]);
	const difficultyLevels: StockfishLevel[] = [1, 2, 3, 5, 8, 10, 15, 20];

	const mapEloToDepth = (elo: number): StockfishLevel => {
		const baseElo = 40;
		const baseDepth = 1;
		const depthIncrement = Math.floor(Math.max(0, elo - baseElo) / 40);
		let calculatedDepth = baseDepth + depthIncrement;
		
		return Math.min(20, calculatedDepth) as StockfishLevel;
	};


	const handleButtonClick = (dynastyData: datatype) => {
		const Elo = parseInt(dynastyData.EloRange.split("-")[0]);
		const isUnlocked = unlockedDynastyid.includes(dynastyData.id);

		if (isUnlocked) {
			setShowLevels(dynastyData);
		} else {
			if (userElo >= Elo) {
				setShowLevels(dynastyData);
			} else {
				alert(`You need Elo ${Elo} to unlock ${dynastyData.name}`);
				setShowLevels(null);
			}
		}
	};

	const settings = {
		infinite: true,
		speed: 200,
		focusOnSelect: true,
		lazyload: true,
		slidesToShow: 3,
		centerMode: true,
		centerPadding: "0px",
		adaptiveHeight: true,
		arrows: false,
		afterChange: (currentpage: number) => {
			const dynastycurrent = dynasty[currentpage];
			if (dynastycurrent) {
				setImageIndex(dynastycurrent.id);
			}
		},
	};
	

	return (
		<section className="pb-32">
			<div className="page">
				<Slider {...settings} className="gap-20">
					{dynasty.map((item) => (
						<div className={item.id === imageIndex ? "activeSlide": "slide"}>

								<DynastyCard
									key={item.id}
									id={item.id}
									image_url={item.image_url}
									name={item.name}
									EloRange={item.EloRange}
									onPlayClick={() => handleButtonClick(item)}
								/>
							</div>
					))}
				</Slider>
</div>
			<div className="">
				{showLevels && showLevels.id === imageIndex ? (
					<Level
						level1={showLevels.level1}
						level2={showLevels.level2}
						level3={showLevels.level3}
						level4={showLevels.level4}
						level5={showLevels.level5}
						mapEloToDepth={mapEloToDepth}
						elo={userElo}
					/>
				) : (
					""
				)}
				<div>
					<EloBar
						userElo={userElo}
						levelStartElo={currentLevelStartElo}
						levelEndElo={currentLevelEndElo}
					/>
				</div>
			</div>
		</section>
	);
}


