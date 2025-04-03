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
    <div className="p-[10vh] min-h-screen bg-black text-white flex flex-col items-center">
      <Card className="w-[90vw] p-[3vh] bg-[#1D1D1D] border-[1.21px] border-[#C4C4C4] rounded-[2vh] flex flex-row justify-between">
        <div className="flex items-center gap-[4vh]">
          <div className="w-[18vh] h-[18vh] rounded-full border-2 border-white flex items-center justify-center overflow-hidden">
            <img
              src="/boy.png"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 className="text-[6vh] font-bold flex items-center gap-2">
              Jacky Do{" "}
              <FaCrown className="text-[#00000080] border-2 bg-[#DCB968] p-[0.95vh] rounded-[2vw] w-[3.95vw] ml-[0.5vw]" />
            </h2>
            <p className="text-[2.5vh] font-normal">National Ranking: #100</p>
            <p className="text-[2.5vh] font-normal">Player ID: 4111201</p>
          </div>
        </div>
        <div className="flex gap-[4vh]">
          <div className="flex flex-col items-center border-1 pt-[1.5vh] pb-[1.5vh] !w-[7.5vw] rounded-[2vh] border-[#77878B]">
            <img
              src="/chess_icon.svg"
              alt="chess icon"
              className="w-[5vw] h-[5vh] mb-[1vh]"
            />
            <p className="text-[2.2vh] text-[#C4C4C4] font-normal">Level</p>
            <p className="text-[4vh] font-bold">5</p>
          </div>
          <div className="flex flex-col items-center border-1 pt-[1.5vh] pb-[1.5vh] !w-[7.5vw] rounded-[2vh] border-[#77878B]">
            <img
              src="/scope.svg"
              alt="scope icon"
              className="w-[5vw] h-[5vh] mb-[1vh]"
            />
            <p className="text-[2.2vh] text-[#C4C4C4] font-normal">Game Mode</p>
            <p className="text-[4vh] font-bold">1vs1</p>
          </div>
          <div className="flex flex-col items-center border-1 pt-[1.5vh] pb-[1.5vh] !w-[7.5vw] rounded-[2vh] border-[#77878B]">
            <img
              src="/wallet.svg"
              alt="wallet icon"
              className="w-[5vw] h-[5vh] mb-[1vh]"
            />
            <p className="text-[2.2vh] text-[#C4C4C4] font-normal">Wallet</p>
            <p className="text-[4vh] font-bold">5</p>
          </div>
          <div className="flex flex-col items-center border-1 pt-[1.5vh] pb-[1.5vh] !w-[7.5vw] rounded-[2vh] border-[#77878B]">
            <img
              src="/cup_star.svg"
              alt="cup icon"
              className="w-[5vw] h-[5vh] mb-[1vh]"
            />
            <p className="text-[2.2vh] text-[#C4C4C4] font-normal">
              Won Matches
            </p>
            <p className="text-[4vh] font-bold">12</p>
          </div>
        </div>
      </Card>

      <Card className="w-full max-w-2xl p-6 mt-6 bg-gray-900 rounded-xl">
        <h3 className="text-xl font-bold mb-4">Settings</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-gray-400">Username</label>
            <Input
              {...register("username")}
              defaultValue="jackydo"
              className="w-full p-2 mt-1 bg-gray-800 border border-gray-700 rounded"
            />
          </div>

          <div>
            <label className="block text-gray-400">Email</label>
            <Input
              {...register("email")}
              defaultValue="jackydo@troll.com"
              className="w-full p-2 mt-1 bg-gray-800 border border-gray-700 rounded"
            />
          </div>

          <div>
            <label className="block text-gray-400">New Password</label>
            <Input
              type="password"
              {...register("password")}
              className="w-full p-2 mt-1 bg-gray-800 border border-gray-700 rounded"
            />
          </div>

          <div>
            <label className="block text-gray-400">Confirm New Password</label>
            <Input
              type="password"
              {...register("confirmPassword")}
              className="w-full p-2 mt-1 bg-gray-800 border border-gray-700 rounded"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-gray-400 text-sm font-medium">
              Preferred Language
            </label>
            <Select
              {...register("language")}
              defaultValue="English"
              onValueChange={(value) => {
                setValue("language", value);
                // Logic to change the language of the page
                console.log(`Language changed to: ${value}`);
                // You can integrate a library like i18next here to handle translations
              }}
            >
              <SelectTrigger className="w-full bg-gray-800 border border-gray-700 rounded p-2">
                <SelectValue placeholder="Select your language" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 text-white z-50">
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="French">French</SelectItem>
                <SelectItem value="Spanish">Spanish</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {successMessage && (
            <p className="text-green-500 text-sm">{successMessage}</p>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" className="bg-gray-700 px-4 py-2 rounded">
              Cancel
            </Button>
            <Button type="submit" className="bg-yellow-500 px-4 py-2 rounded">
              Save
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AccountSettings;
