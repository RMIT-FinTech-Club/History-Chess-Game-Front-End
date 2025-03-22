"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { FaFacebook } from "react-icons/fa";
import { MdEmail } from "react-icons/md";

const mockUsers = [
  { username: "test@example.com", password: "Password123!" },
  { username: "user@example.com", password: "SecurePass1@" },
];

const Page = () => {
  const [error, setError] = useState("");
  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  type FormValues = {
    username: string;
    password: string;
  };

  function onSubmit(values: FormValues) {
    const { username, password } = values;
    const user = mockUsers.find((u) => u.username === username);

    if (!username) {
      setError("Please enter your username or email.");
      document
      .getElementById("username-input")
      ?.classList.add("border-red-500", "border-[0.3vh]");
    } else {
      document
      .getElementById("username-input")
      ?.classList.remove("border-red-500", "border-[0.3vh]");
    }

    if (!password) {
      setError("Please enter your password.");
      document
      .querySelector("input[type='password']")
      ?.classList.add("border-red-500", "border-[0.3vh]");
    } else {
      document
      .querySelector("input[type='password']")
      ?.classList.remove("border-red-500", "border-[0.3vh]");
    }

    if (!username || !password) {
      return;
    }

    if (!user) {
      setError("The username or email you entered is not registered.");
      document
      .getElementById("username-input")
      ?.classList.add("border-red-500", "border-[0.3vh]");
      return;
    } else {
      document
      .getElementById("username-input")
      ?.classList.remove("border-red-500", "border-[0.3vh]");
      document
      .getElementById("username-input")
      ?.classList.add("border-green-500", "border-[0.3vh]");
    }

    if (user.password !== password) {
      setError("The password you entered is incorrect.");
      document
      .querySelector("input[type='password']")
      ?.classList.add("border-red-500", "border-[0.3vh]");
      return;
    } else {
      document
      .querySelector("input[type='password']")
      ?.classList.remove("border-red-500", "border-[0.3vh]");
      document
      .querySelector("input[type='password']")
      ?.classList.add("border-green-500", "border-[0.3vh]");
    }
    document
      .getElementById("username-input")
      ?.classList.add("border-green-500", "border-[0.3vh]");
    document
      .querySelector("input[type='password']")
      ?.classList.add("border-green-500", "border-[0.3vh]");
    setError("");
    
    // Ensure the border color changes are applied before showing the alert
    setTimeout(() => {
      alert(
      `Sign in successful!\nUsername/Email: ${username}\nPassword: ${password}`
      );
    }, 0);
  }

  return (
    <div className="min-h-screen flex items-center justify-center md:justify-start text-white font-poppins font-bold relative">
      <div className="w-[40vw] aspect-[1/1] ml-[5vw] mr-[3vw] relative md:block hidden">
        <div className="w-full absolute aspect-[1/1] bg-[#DBB968] rounded-[50%] blur-[15vw] left-0 top-[50%] -translate-y-[50%]"></div>
        <div
          className="w-full absolute aspect-[1/1] bg-no-repeat bg-center bg-contain left-0 top-[50%] -translate-y-[50%]"
          style={{ backgroundImage: "url('/FTC_Logo.png')" }}
        ></div>
      </div>
      <div className="p-7">
        <h2 className="text-center text-[7vh]">Sign In</h2>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-3 w-[80vw] md:w-[42vw]"
          >
            {" "}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-[3vh] rounded-md">
                    Username/Email
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MdEmail
                        className="
                         absolute text-black cursor-pointer
                         top-[1.55vh] left-[1.45vw] sm:left-[1.2vw] md:left-[1vw] lg:left-[0.95vw] text-[5vh]
                         "
                        onClick={() =>
                          document.getElementById("username-input")?.focus()
                        }
                      />
                      <Input
                        id="username-input"
                        placeholder="Enter your email"
                        {...field}
                        className="
                          pl-[7.5vw]
                          sm:pl-[5.85vw]
                          md:pl-[4.5vw]
                          lg:pl-[3.75vw] 
                          py-[4vh] w-full
                          bg-[#C4C4C4] border-[#DCB968] focus:border-[0.35vh] text-[#2F2F2F] 
                          !text-[3vh] font-normal rounded-[1.5vh]
                        "
                        autoComplete="off"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-[3vh] rounded-md">
                    Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <PasswordInput
                        placeholder="Enter your password"
                        {...field}
                        className="
                          pl-[7.5vw]
                          sm:pl-[5.85vw]
                          md:pl-[4.5vw]
                          lg:pl-[3.75vw] 
                          py-[4vh] w-full
                          bg-[#C4C4C4] border-[#DCB968] focus:border-[0.35vh] text-[#2F2F2F] 
                          !text-[3vh] font-normal rounded-[1.5vh]
                        "
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-between items-center text-[2.5vh]">
              <label className="flex items-center font-normal">
                <input
                  type="checkbox"
                  className="mr-[1vw] md:mr-[0.5vw] hover:cursor-pointer"
                />
                Remember me
              </label>
              <a href="#" className="hover:underline text-[#184BF2]">
                Forgot Password?
              </a>
            </div>
            {error && (
              <p className="text-red-500 text-[2.5vh] font-bold">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full bg-[#000000] hover:shadow-2xl hover:shadow-amber-400 cursor-pointer text-[#FFFFFF] font-bold text-[3.5vh] py-[4vh] md:py-[4vh] lg:py-[4.5vh] mt-[1.75vh] mb-[1.75vh] rounded-[1.5vh]"
            >
              Sign In
            </Button>
          </form>
        </Form>

        <div
          className="
          text-center text-[#C4C4C4]
          text-[3vh]
          font-normal
        "
        >
          or continue with
        </div>
        <div className="space-y-2 sm:space-y-3 md:space-y-4">
          <button
            className="
              w-full flex items-center justify-center 
              bg-[#1877F2] cursor-pointer 
              text-[#FFFFFF] font-bold text-[3vh]
              py-[1.5vh] md:py-[2.45vh] mt-[1.75vh] mb-[1.75vh] rounded-[1.5vh]
            "
          >
            <FaFacebook className="mr-[1vw] md:mr-[0.5vw] text-[4vh]" />
            Continue with Facebook
          </button>

          <button
            className="
              w-full flex items-center justify-center 
              bg-[#ECECEC] cursor-pointer 
              text-[#000000] font-bold text-[3vh] 
              py-[1.5vh] md:py-[2.45vh] mt-[1.75vh] mb-[1.75vh] rounded-[1.5vh]
            "
          >
            <img
              src="/Google-Logo.svg"
              alt="Google Icon"
              className="mr-[1vw] md:mr-[0.5vw] w-[4vh] h-[4vh]"
            />
            Continue with Google
          </button>
        </div>

        <div
          className="
          text-center text-[#C4C4C4]
          text-[3vh]
          font-normal
        "
        >
          Don’t have an account?{" "}
          <a
            href="/sign_up"
            className="text-[#184BF2] font-bold hover:underline"
          >
            Sign Up
          </a>
        </div>
      </div>
    </div>
  );
};

export default Page;
