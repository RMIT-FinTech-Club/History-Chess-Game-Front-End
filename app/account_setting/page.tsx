"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { FaCrown } from "react-icons/fa";

const AccountSettings = () => {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm();
  const [successMessage, setSuccessMessage] = useState("");

  const onSubmit = (data: any) => {
    console.log("Updated User Data:", data);
    setSuccessMessage("Settings updated successfully!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  

  return (
    <div className="p-[10vh] min-h-screen bg-[#131313] text-white flex flex-col items-center">
      <Card className="w-full p-[3vh] bg-[#1D1D1D] flex flex-col md:flex-row justify-between items-center gap-[3vh] md:gap-0  border border-[#C4C4C4]">
        <div className="flex flex-col md:flex-row items-center gap-[4vh]">
          <div className="w-[18vh] h-[18vh] rounded-full border-2 border-white flex items-center justify-center overflow-hidden">
            <img
              src="/boy.png"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-[4vh] sm:text-[5vh] md:text-[6vh] font-bold flex items-center justify-center md:justify-start gap-2">
              Jacky Do{" "}
              <FaCrown className="text-[#00000080] border-2 bg-[#DCB968] p-[0.95vh] rounded-[2vw] w-[3.95vw] ml-[0.5vw]" />
            </h2>
            <p className="text-[2vh] sm:text-[2.5vh] font-normal">
              National Ranking: #100
            </p>
            <p className="text-[2vh] sm:text-[2.5vh] font-normal">
              Player ID: 4111201
            </p>
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-[4vh]">
          <div className="flex flex-col items-center justify-center border p-[1.5vh] rounded-[2vh] bg-[#000000] border-[#77878B] w-[20vw] sm:w-[15vw] md:w-[10vw] lg:w-[7.5vw] text-center">
            <img
              src="/chess_icon.svg"
              alt="chess icon"
              className="w-[8vw] h-[8vh] sm:w-[6vw] sm:h-[6vh] md:w-[5vw] md:h-[5vh] mb-[1vh]"
            />
            <p className="text-[2vh] sm:text-[2.2vh] md:text-[2.5vh] text-[#C4C4C4] font-normal">
              Level
            </p>
            <p className="text-[3vh] sm:text-[4vh] md:text-[4.5vh] font-bold">
              5
            </p>
          </div>
          <div className="flex flex-col items-center justify-center border p-[1.5vh] rounded-[2vh] bg-[#000000] border-[#77878B] w-[20vw] sm:w-[15vw] md:w-[10vw] lg:w-[7.5vw] text-center">
            <img
              src="/scope.svg"
              alt="scope icon"
              className="w-[8vw] h-[8vh] sm:w-[6vw] sm:h-[6vh] md:w-[5vw] md:h-[5vh] mb-[1vh]"
            />
            <p className="text-[2vh] sm:text-[2.2vh] md:text-[2.5vh] text-[#C4C4C4] font-normal">
              Game Mode
            </p>
            <p className="text-[3vh] sm:text-[4vh] md:text-[4.5vh] font-bold">
              1vs1
            </p>
          </div>
          <div className="flex flex-col items-center justify-center border p-[1.5vh] rounded-[2vh] bg-[#000000] border-[#77878B] w-[20vw] sm:w-[15vw] md:w-[10vw] lg:w-[7.5vw] text-center">
            <img
              src="/wallet.svg"
              alt="wallet icon"
              className="w-[8vw] h-[8vh] sm:w-[6vw] sm:h-[6vh] md:w-[5vw] md:h-[5vh] mb-[1vh]"
            />
            <p className="text-[2vh] sm:text-[2.2vh] md:text-[2.5vh] text-[#C4C4C4] font-normal">
              Wallet
            </p>
            <p className="text-[3vh] sm:text-[4vh] md:text-[4.5vh] font-bold">
              5
            </p>
          </div>
          <div className="flex flex-col items-center justify-center border p-[1.5vh] rounded-[2vh] bg-[#000000] border-[#77878B] w-[20vw] sm:w-[15vw] md:w-[10vw] lg:w-[7.5vw] text-center">
            <img
              src="/cup_star.svg"
              alt="cup icon"
              className="w-[8vw] h-[8vh] sm:w-[6vw] sm:h-[6vh] md:w-[5vw] md:h-[5vh] mb-[1vh]"
            />
            <p className="text-[2vh] sm:text-[2.2vh] md:text-[2.5vh] text-[#C4C4C4] font-normal">
              Won Matches
            </p>
            <p className="text-[3vh] sm:text-[4vh] md:text-[4.5vh] font-bold">
              12
            </p>
          </div>
        </div>
      </Card>
      <div className="flex flex-col md:flex-row gap-[3vh] w-full mt-[3vh]">
        <Card className="flex flex-col items-start bg-[#1D1D1D] p-[4vh] w-[35%]">
          <Button className="w-[100%] px-[2vh] py-[2vh] cursor-pointer flex items-center gap-[1vh] font-bold text-[3vh] justify-start hover:bg-[#DBB968] focus:bg-[#DBB968] h-auto">
            <img
              src="/cup.svg"
              alt="Statistic icon"
              className="h-[4vh] aspect-square border-1 rounded-[100%] p-1"
            />
            Statistic
          </Button>
          <Button className="w-[100%] px-[2vh] py-[2vh] cursor-pointer flex items-center gap-[1vh] font-bold text-[3vh] justify-start hover:bg-[#DBB968] focus:bg-[#DBB968] h-auto">
            <img
              src="/game_console.svg"
              alt="Matching icon"
              className="h-[4vh] aspect-square border-1 rounded-[100%] p-1"
            />
            Matching
          </Button>
          <Button className="w-[100%] px-[2vh] py-[2vh] cursor-pointer flex items-center gap-[1vh] font-bold text-[3vh] justify-start hover:bg-[#DBB968] focus:bg-[#DBB968] h-auto">
            <img
              src="/Settings.svg"
              alt="Settings icon"
              className="h-[4vh] aspect-square border-1 rounded-[100%] p-1"
            />
            Account Settings
          </Button>
        </Card>

        <Card className="flex-grow w-full bg-[#1D1D1D] pl-[3vw] pr-[3vw] pt-[6vh] pb-[6vh]">
          <div className="flex items-center flex-col md:flex-row text-center md:text-left">
            <img
              src="/Settings.svg"
              alt="Settings icon"
              className="h-[6vh] aspect-square mb-[1vh] md:mb-0 md:mr-[1vh]"
            />
            <h3 className="text-[3vh] sm:text-[3.5vh] md:text-[4vh] font-bold">
              Settings
            </h3>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-[2vh]">
            <div className="flex flex-col md:flex-row gap-[3vh]">
              <div className="flex items-center justify-center w-full md:w-auto">
                <label className="cursor-pointer flex items-center justify-center border border-dashed border-[#77878B] rounded-[1vh] h-[19vh] aspect-square">
                  <img
                    src="/Upload.svg"
                    alt="Upload Icon"
                    className="h-[6vh] aspect-square"
                  />
                  <Input
                    type="file"
                    accept="image/*"
                    {...register("profilePicture")}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex flex-col gap-[2vh] w-full h-full justify-center">
                <div>
                  <label className="block text-[#EBEBEB] text-[2.8vh] font-normal">
                    User Information
                  </label>
                  <Input
                    {...register("username")}
                    placeholder="Enter your new username"
                    autoComplete="off"
                    className="w-full h-[6vh] mt-[1vh] bg-[#F9F9F9] border-[1px] border-[#B7B7B7] rounded-[1vh] placeholder-[#8C8C8C] placeholder:text-[2.5vh] text-black"
                  />
                  <Input
                    {...register("email")}
                    placeholder="Your email"
                    autoComplete="off"
                    className="w-full h-[6vh] mt-[2vh] bg-[#F9F9F9] border-[1px] border-[#B7B7B7] rounded-[1vh] placeholder-[#8C8C8C] placeholder:text-[2.5vh] text-black"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[#FFFFFF] text-[2.8vh]">
                New password <span className="text-[#BB2649]">*</span>
              </label>
              <Input
                type="password"
                {...register("password")}
                className="w-full p-[1.5vh] mt-[1vh] border-[1.34px] border-[#DBB968] rounded-[1vh]"
              />
            </div>

            <div>
              <label className="block text-[#FFFFFF] text-[2.8vh]">
                Confirm new password <span className="text-[#BB2649]">*</span>
              </label>
              <Input
                type="password"
                {...register("confirmPassword")}
                className="w-full p-[1.5vh] mt-[1vh] border-[1.34px] border-[#DBB968] rounded-[1vh]"
              />
            </div>

            <div className="space-y-[1vh]">
              <label className="block text-[#FFFFFF] text-[2.8vh]">
                Language <span className="text-[#BB2649]">*</span>
              </label>
              <Select
                {...register("language")}
                defaultValue="English"
                onValueChange={(value) => {
                  setValue("language", value);
                  console.log(`Language changed to: ${value}`);
                }}
              >
                <SelectTrigger className="w-full p-[1.5vh] mt-[1vh] border-[1.34px] border-[#DBB968] rounded-[1vh] text-[#DBB968]">
                  <SelectValue placeholder="Select your language" />
                </SelectTrigger>
                <SelectContent className="w-full bg-black text-[#FFFFFF] z-50 border border-[#DBB968] rounded-[1vh]">
                  <SelectItem
                    value="English"
                    className="hover:bg-[#E5C27B] data-[state=checked]:bg-[#B8933C]"
                  >
                    English
                  </SelectItem>
                  <SelectItem
                    value="Vietnamese"
                    className="hover:bg-[#E5C27B] data-[state=checked]:bg-[#B8933C]"
                  >
                    Vietnamese
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {successMessage && (
              <p className="text-[#4CAF50] text-[2vh]">{successMessage}</p>
            )}

            <div className="flex justify-end gap-[2vh]">
              <Button
                type="button"
                className="px-[2vh] py-[1.5vh] border w-[10vw] h-[6vh] border-[#DBB968] rounded-[1vh] text-[#EBEBEB] font-normal text-[2.5vh] 
  cursor-pointer hover:bg-[#E57373] hover:text-black transition duration-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-[#DCB968] px-[2vh] py-[1.5vh] w-[10vw] h-[6vh] rounded-[1vh] text-[#000000] font-normal text-[2.5vh] 
  cursor-pointer hover:bg-[#BFA55D] transition duration-200"
              >
                Save
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AccountSettings;
