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

    if (!username && !password) {
      setError("Please enter your username or email and password.");
      return;
    }

    if (!username) {
      setError("Please enter your username or email.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    if (!user) {
      setError("The username or email you entered is not registered.");
      return;
    }
    if (user.password !== password) {
      setError("The password you entered is incorrect.");
      return;
    }
    alert(
      `Sign in successful!\nUsername/Email: ${username}\nPassword: ${password}`
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col justify-center bg-black text-white bg-[left] bg-[length:70%] bg-no-repeat p-[1.2%] pl-[50%] pr-[7%] font-poppins font-bold"
      style={{ backgroundImage: "url('/FTC_Logo.svg')" }}
    >
      <h2 className="text-center text-2xl sm:text-3xl md:text-4xl lg:text-[40px] mb-6">
        Sign In
      </h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-bold text-[0.85em] sm:text-[0.9em] md:text-[0.95em] lg:text-[1em] rounded-md">
                  Username/Email
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <MdEmail
                      className="
                      absolute top-2 left-2.5 text-black text-[1.3em] cursor-pointer
                      sm:top-2 sm:left-3 sm:text-[1.4em]
                      md:top-2.5 md:left-3.5 md:text-[l.5em]
                      lg:top-3 lg:left-4 lg:text-[1.6em]
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
                        pl-[3em] py-[1.2em] text-[0.8em]
                        sm:pl-[3.3em] sm:py-[1.3em] sm:text-[0.85em]
                        md:pl-[3.4em] md:py-[1.4em] md:text-[0.9em]
                        lg:pl-[3.5em] lg:py-[1.5em] lg:text-[0.95em]
                        bg-[#C4C4C4] border-gray-600 text-[#2F2F2F] font-medium rounded-md
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
                <FormLabel className="font-bold text-[0.85em] sm:text-[0.9em] md:text-[0.95em] lg:text-[1em] rounded-md">
                  Password
                </FormLabel>
                <FormControl>
                  <div className="relative">
                    <PasswordInput
                      placeholder="Enter your password"
                      {...field}
                      className="
                        pl-[3em] py-[1.2em] text-[0.8em]
                        sm:pl-[3.3em] sm:py-[1.3em] sm:text-[0.85em]
                        md:pl-[3.4em] md:py-[1.4em] md:text-[0.9em]
                        lg:pl-[3.5em] lg:py-[1.5em] lg:text-[0.95em]
                        bg-[#C4C4C4] border-gray-600 text-[#2F2F2F] font-medium rounded-md
                      "
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-between items-center text-[0.75em] sm:text-[0.8em] md:text-[0.9em] lg:1em">
            <label className="flex items-center font-normal">
              <input
                type="checkbox"
                className="mr-2 w-4 h-4 sm:w-4 sm:h-4 md:w-5 md:h-5 lg:w-5 lg:h-5 hover:cursor-pointer"
              />
              Remember me
            </label>
            <a href="#" className="hover:underline">
              Forgot Password?
            </a>
          </div>

          {error && <p className="text-red-500 text-sm font-bold">{error}</p>}

          <Button
            type="submit"
            className="w-full bg-[#000000] hover:shadow-xl hover:shadow-[#DCB968] cursor-pointer text-[#FFFFFF] font-bold rounded-md py-3 text-[0.8em]
            sm:text-[0.9em] sm:py-4 
            md:text-base md:py-5
            lg:text-[1.1em] lg:py-6"
          >
            Sign In
          </Button>
        </form>
      </Form>

      <div
        className="
          text-center text-[#C4C4C4] mt-1 mb-2
          text-[0.75em] sm:text-[0.8em] md:text-[0.85em] lg:text-base 
          font-normal
        "
      >
        or continue with
      </div>
      <div className="space-y-2 sm:space-y-3 md:space-y-4">
        <button
          className="
            w-full flex items-center justify-center 
            bg-[#1877F2]
            cursor-pointer text-white font-semibold 
            py-2.5 sm:py-3 md:py-3.5 rounded-md 
            text-xs sm:text-sm md:text-base
          "
        >
          <FaFacebook className="mr-2 text-lg sm:text-xl md:text-2xl" />
          Continue with Facebook
        </button>

        <button
          className="
            w-full flex items-center justify-center 
            bg-[#ECECEC]
            cursor-pointer text-gray-900 font-semibold 
            py-2.5 sm:py-3 md:py-3.5 rounded-md 
            text-xs sm:text-sm md:text-base
          "
        >
          <img
            src="/Google-Logo.svg"
            alt="Google Icon"
            className="mr-2 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"
          />
          Continue with Google
        </button>
      </div>

      <div className="text-center text-[#C4C4C4] font-normal mt-2 text-[0.75em] sm:text-[0.8em] md:text-[0.85em] lg:text-base">
        Don’t have an account?{" "}
        <a href="/sign_up" className="text-[#184BF2] font-bold hover:underline">
          Sign Up
        </a>
      </div>
    </div>
  );
};

export default Page;
