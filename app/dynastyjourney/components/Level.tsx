"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmPlay from "./ConfirmPlay";

type datatype = {
	level1: string;
	level2: string;
	level3: string;
	level4: string;
	level5: string;
	elo: number;
	mapEloToDepth: (elo: number) => number;
};

const Level = ({
	level1,
	level2,
	level3,
	level4,
	level5,
	mapEloToDepth,
	elo,
}: datatype) => {
	const [isModalOpen, setIsModalOpen] = useState(false);
	const router = useRouter();
	const stockfishDepth = mapEloToDepth(elo);

	const handlePlayClick = () => {
		setIsModalOpen(true);
	};

	return (
		<section className="flex justify-center">
			<div className="grid grid-cols-5 gap-20">
				<div className="flex justify-center pt-[30px] w-[200px] h-[200px] rounded-4xl border-4 border-[#8F802B] bg-[#D99F16]  font-semibold text-3xl">
					Level {level1}
					<div className="absolute flex justify-center items-center mt-[100px]">
						<button
							onClick={() => handlePlayClick()}
							className="absolute flex justify-center items-center w-[150px] h-[50px] !rounded-4xl border-2 !bg-[#8F802B] !font-extrabold !text-2xl cursor-pointer"
						>
							PLAY
						</button>

						{isModalOpen && (
							<ConfirmPlay
								isOpen={isModalOpen}
								message="Are you ready to play?"
								onConfirm={() => {
									router.push(
										`/dynastygame?level=${stockfishDepth}&elo=${elo}`
									);
									setIsModalOpen(false);
								}}
								onCancel={() => setIsModalOpen(false)}
							/>
						)}
					</div>
				</div>

				<div className="flex justify-center pt-[30px] w-[200px] h-[200px] rounded-4xl border-4 border-[#8F802B] bg-[#D99F16]  font-semibold text-3xl">
					Level {level2}
					<div className="absolute flex justify-center items-center mt-[100px]">
						<button
							onClick={() => handlePlayClick()}
							className="absolute flex justify-center items-center w-[150px] h-[50px] !rounded-4xl border-2 !bg-[#8F802B] !font-extrabold !text-2xl cursor-pointer"
						>
							PLAY
						</button>

						{isModalOpen && (
							<ConfirmPlay
								isOpen={isModalOpen}
								message="Are you ready to play?"
								onConfirm={() => {
									router.push(
										`/dynastygame?level=${stockfishDepth}&elo=${elo}`
									);
									setIsModalOpen(false);
								}}
								onCancel={() => setIsModalOpen(false)}
							/>
						)}
					</div>
				</div>

				<div className="flex justify-center pt-[30px] w-[200px] h-[200px] rounded-4xl border-4 border-[#8F802B] bg-[#D99F16]  font-semibold text-3xl">
					Level {level3}
					<div className="absolute flex justify-center items-center mt-[100px]">
						<button
							onClick={() => handlePlayClick()}
							className="absolute flex justify-center items-center w-[150px] h-[50px] !rounded-4xl border-2 !bg-[#8F802B] !font-extrabold !text-2xl cursor-pointer"
						>
							PLAY
						</button>

						{isModalOpen && (
							<ConfirmPlay
								isOpen={isModalOpen}
								message="Are you ready to play?"
								onConfirm={() => {
									router.push(
										`/dynastygame?level=${stockfishDepth}&elo=${elo}`
									);
									setIsModalOpen(false);
								}}
								onCancel={() => setIsModalOpen(false)}
							/>
						)}
					</div>
				</div>

				<div className="flex justify-center pt-[30px] w-[200px] h-[200px] rounded-4xl border-4 border-[#8F802B] bg-[#D99F16]  font-semibold text-3xl">
					Level {level4}
					<div className="absolute flex justify-center items-center mt-[100px]">
						<button
							onClick={() => handlePlayClick()}
							className="absolute flex justify-center items-center w-[150px] h-[50px] !rounded-4xl border-2 !bg-[#8F802B] !font-extrabold !text-2xl cursor-pointer"
						>
							PLAY
						</button>

						{isModalOpen && (
							<ConfirmPlay
								isOpen={isModalOpen}
								message="Are you ready to play?"
								onConfirm={() => {
									router.push(
										`/dynastygame?level=${stockfishDepth}&elo=${elo}`
									);
									setIsModalOpen(false);
								}}
								onCancel={() => setIsModalOpen(false)}
							/>
						)}
					</div>
				</div>

				<div className="flex justify-center pt-[30px] w-[200px] h-[200px] rounded-4xl border-4 border-[#8F802B] bg-[#D99F16]  font-semibold text-3xl">
					Level {level5}
					<div className="absolute flex justify-center items-center mt-[100px]">
						<button
							onClick={() => handlePlayClick()}
							className="absolute flex justify-center items-center w-[150px] h-[50px] !rounded-4xl border-2 !bg-[#8F802B] !font-extrabold !text-2xl cursor-pointer"
						>
							PLAY
						</button>

						{isModalOpen && (
							<ConfirmPlay
								isOpen={isModalOpen}
								message="Are you ready to play?"
								onConfirm={() => {
									router.push(
										`/dynastygame?level=${stockfishDepth}&elo=${elo}`
									);
									setIsModalOpen(false);
								}}
								onCancel={() => setIsModalOpen(false)}
							/>
						)}
					</div>
				</div>
			</div>
		</section>
	);
};

export default Level;
