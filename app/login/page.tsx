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
import { FaFacebook} from "react-icons/fa";
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
    alert(`Sign in successful!\nUsername/Email: ${username}\nPassword: ${password}`);
  }

  return (
    <div
      className="bg-black bg-opacity-70 text-white p-[1.25%] pl-[50%] pr-[7%] font-poppins font-bold"
      style={{
        backgroundImage: "url('/FTC_Logo.svg')",
        backgroundPosition: "left",
        backgroundRepeat: "no-repeat",
        backgroundSize: "70%",
        backgroundAttachment: "fixed",
      }}
      
    >
      <h2 className="text-center text-[40px] mb-6">Sign In</h2>
      <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
        control={form.control}
        name="username"
        render={({ field }) => (
          <FormItem>
          <FormLabel className="font-bold rounded-md">
            Username/Email
          </FormLabel>
          <FormControl>
            <div className="relative">
            <MdEmail
              className="absolute left-4 top-2.5 text-black text-2xl cursor-pointer"
              onClick={() =>
              document.getElementById("username-input")?.focus()
              }
            />
            <Input
              id="username-input"
              placeholder="Enter your email"
              {...field}
              className="pl-13 py-5.5 bg-[#C4C4C4] border-gray-600 text-[#2F2F2F] font-medium rounded-md"
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
          <FormLabel className="font-bold rounded-md">Password</FormLabel>
          <FormControl>
            <div className="relative">
            <PasswordInput
              placeholder="Enter your password"
              {...field}
              className="pl-13 py-5.5 font-medium rounded-md"
            />
            </div>
          </FormControl>
          <FormMessage />
          </FormItem>
        )}
        />

        <div className="flex justify-between items-center text-sm">
        <label className="flex items-center">
          <input type="checkbox" className="mr-2 hover:cursor-pointer" /> Remember me
        </label>
        <a href="#">Forgot Password?</a>
        </div>

        {error && <p className="text-red-500 text-sm font-bold">{error}</p>}
        
        <Button
        type="submit"
        className="w-full bg-[#000000] hover:shadow-xl hover:shadow-[#DCB968] cursor-pointer text-[#FFFFFF] font-bold py-6 rounded-md"
        >
        Sign In
        </Button>
      </form>
      </Form>

      <div className="text-center text-[#C4C4C4] my-2 font-normal">
      or continue with
      </div>
      <div className="space-y-3">
      <button className="w-full flex items-center justify-center bg-[#1877F2] hover:shadow-[#DCB968] cursor-pointer text-white font-bold py-3 rounded-md">
        <FaFacebook className="mr-2 text-2xl" /> Continue with Facebook
      </button>
      <button className="w-full flex items-center justify-center bg-[#ECECEC] hover:shadow-[#DCB968] cursor-pointer text-gray-900 font-bold py-3 rounded-md">
        <img
        src="/Google-Logo.svg"
        alt="Google Icon"
        className="mr-2 w-5 h-5"
        />{" "}
        Continue with Google
      </button>
      </div>

      <div className="text-center text-[#C4C4C4] font-normal mt-6">
      Don’t have an account?{" "}
      <a href="/sign_up" className="text-[#184BF2] font-bold">
        Sign Up
      </a>
      </div>
    </div>
  );
};

export default Page;
