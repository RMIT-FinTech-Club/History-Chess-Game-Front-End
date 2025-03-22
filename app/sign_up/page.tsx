"use client";
import React, { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { PasswordConfirm } from "@/components/ui/PasswordConfirm";
import { MdEmail } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { useRouter } from "next/navigation";

const formSchema = z
  .object({
    email: z
      .string()
      .min(1, { message: "Please enter your email." })
      .email({ message: "Invalid email address." }),
    username: z
      .string()
      .min(1, { message: "Please enter your username." })
      .min(2, { message: "Username must be at least 2 characters." }),
    password: z
      .string()
      .min(1, { message: "Please enter your password." })
      .min(8, { message: "Password must be at least 8 characters." })
      .refine((value) => /[A-Z]/.test(value), {
        message: "Password must contain at least one uppercase letter.",
      })
      .refine((value) => /[0-9]/.test(value), {
        message: "Password must contain at least one number.",
      })
      .refine((value) => /[^A-Za-z0-9]/.test(value), {
        message: "Password must contain at least one special character.",
      }),
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

const SignUp = () => {
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Password validation tracking
  const isMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert(
        `Sign up successful!\n\nEmail: ${data.email}\nUsername: ${data.username}\nPassword: ${data.password}`
      );
      router.push("/sign_in");
    } catch (error) {
      alert("Sign up failed");
    } finally {
      setLoading(false);
    }
  };

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
        <h2 className="text-center text-[7vh]">Sign Up</h2>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-3 w-[80vw] md:w-[42vw]"
          >
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-[3vh] rounded-md">
                    Email
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MdEmail
                        className="
                        absolute text-black cursor-pointer
                        top-[1.55vh] left-[1.45vw] sm:left-[1.2vw] md:left-[1vw] lg:left-[0.95vw] text-[5vh]
                        "
                        onClick={() =>
                          document.getElementById("email-input")?.focus()
                        }
                      />
                      <Input
                        {...field}
                        id="email-input"
                        placeholder="Enter your email"
                        className="
                          pl-[7.5vw]
                          sm:pl-[5.85vw]
                          md:pl-[4.5vw]
                          lg:pl-[3.75vw] 
                          py-[4vh] w-full
                          bg-[#C4C4C4] border-gray-600 text-[#2F2F2F] 
                          !text-[3vh] font-normal rounded-[1.5vh]
                        "
                        autoComplete="off"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[2.5vh] text-red-500" />
                </FormItem>
              )}
            />

            {/* Username Field */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-[3vh] rounded-md">
                    Username
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <FaUser
                        className="
                        absolute text-black cursor-pointer
                        top-[1.55vh] left-[1.45vw] sm:left-[1.2vw] md:left-[1vw] lg:left-[0.95vw] text-[5vh]
                        "
                        onClick={() =>
                          document.getElementById("username-input")?.focus()
                        }
                      />
                      <Input
                        {...field}
                        id="username-input"
                        placeholder="Enter your username"
                        className="
                          pl-[7.5vw]
                          sm:pl-[5.85vw]
                          md:pl-[4.5vw]
                          lg:pl-[3.75vw] 
                          py-[4vh] w-full
                          bg-[#C4C4C4] border-gray-600 text-[#2F2F2F] 
                          !text-[3vh] font-normal rounded-[1.5vh]
                        "
                        autoComplete="off"
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[2.5vh] text-red-500" />
                </FormItem>
              )}
            />

            {/* Password Field */}
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
                          bg-[#C4C4C4] border-gray-600 text-[#2F2F2F] 
                          !text-[3vh] font-normal rounded-[1.5vh]
                        "
                        onChange={(e) => {
                          field.onChange(e);
                          setPassword(e.target.value);
                        }}
                      />
                    </div>
                  </FormControl>

                  {/* Dynamic Password Checklist */}
                  <ul className="font-normal text-[2.5vh] rounded-md">
                    {!isMinLength && <li>✔ 8 characters minimum</li>}
                    {!hasUppercase && <li>✔ At least 1 capital letter</li>}
                    {!hasNumber && <li>✔ At least 1 digit</li>}
                    {!hasSpecialChar && <li>✔ At least 1 special character</li>}
                  </ul>
                  <FormMessage className="text-[2.5vh] text-red-500" />
                </FormItem>
              )}
            />

            {/* Confirm Password Field */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-[3vh] rounded-md">
                    Confirm Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <PasswordConfirm
                        placeholder="Confirm your password"
                        {...field}
                        className="
                          pl-[7.5vw]
                          sm:pl-[5.85vw]
                          md:pl-[4.5vw]
                          lg:pl-[3.75vw] 
                          py-[4vh] w-full
                          bg-[#C4C4C4] border-gray-600 text-[#2F2F2F] 
                          !text-[3vh] font-normal rounded-[1.5vh]
                        "
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[2.5vh] text-red-500" />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#000000] hover:shadow-2xl hover:shadow-amber-400 cursor-pointer text-[#FFFFFF] font-bold text-[3.5vh] py-[4vh] md:py-[4vh] lg:py-[4.5vh] mt-[1.75vh] mb-[1.75vh] rounded-[1.5vh]"
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </Button>
          </form>
        </Form>

        {/* Sign In Link */}
        <div
          className="
          text-center text-[#C4C4C4]
          text-[3vh]
          font-normal
        "
        >
          Already have an account?{" "}
          <a
            href="/sign_in"
            className="text-[#184BF2] font-bold hover:underline"
          >
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
