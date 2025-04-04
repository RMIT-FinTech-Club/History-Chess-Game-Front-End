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
import styles from "@/css/profile.module.css";

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
      <div>
          <div className="flex items-center">
            <img
              src="/Settings.svg"
              alt="Settings icon"
              className="w-[2.5vw] mb-[1vh]"
            />
            <h3 className="text-[2.5vw] leading-[3vw] ml-[1vw]">
              Settings
            </h3>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className={`flex flex-col w-full h-[calc(100dvh-3vh-15vw-3vh-6vw-3vh-3vw-2vh+4px-6vh)] md:h-[100%] overflow-y-auto mt-[2vh] ${styles.list_container}`}>
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
      </div>
  );
};

export default AccountSettings;
