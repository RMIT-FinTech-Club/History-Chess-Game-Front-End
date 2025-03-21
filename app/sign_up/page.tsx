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
    <div
      className="min-h-screen flex flex-col justify-center bg-black text-white bg-fixed bg-[left] bg-[length:70%] bg-no-repeat p-[1.2%] pl-[50%] pr-[7%] font-poppins font-bold"
      style={{ backgroundImage: "url('/FTC_Logo.svg')" }}
    >
      <div>
        <h2 className="text-center text-2xl sm:text-3xl md:text-4xl lg:text-[40px] mb-6">
          Sign Up
        </h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-[0.85em] sm:text-[0.9em] md:text-[0.95em] lg:text-[1em] rounded-md">
                    Email
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MdEmail
                        className="
                        absolute top-2 left-2.5 text-black text-[1.3em] cursor-pointer
                        sm:top-2 sm:left-3 sm:text-[1.4em]
                        md:top-2.5 md:left-3.5 md:text-[l.5em]
                        lg:top-2.5 lg:left-3.5 lg:text-[1.6em]
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

            {/* Username Field */}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-[0.85em] sm:text-[0.9em] md:text-[0.95em] lg:text-[1em] rounded-md">
                    Username
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <FaUser
                        className="
                        absolute top-2 left-2.5 text-black text-[1.3em] cursor-pointer
                        sm:top-2 sm:left-3 sm:text-[1.4em]
                        md:top-2.5 md:left-3.5 md:text-[l.5em]
                        lg:top-2.5 lg:left-3.5 lg:text-[1.6em]
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

            {/* Password Field */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-[0.85em] sm:text-[0.9em] md:text-[0.95em] lg:text-[1em] rounded-md">
                    Password
                  </FormLabel>
                  <FormControl>
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
                      onChange={(e) => {
                        field.onChange(e);
                        setPassword(e.target.value);
                      }}
                    />
                  </FormControl>

                  {/* Dynamic Password Checklist */}
                  <ul className="font-normal text-[0.75em] sm:text-[0.8em] md:text-[0.85em] lg:text-[0.9em] rounded-md">
                    {!isMinLength && <li>✔ 8 characters minimum</li>}
                    {!hasUppercase && <li>✔ At least 1 capital letter</li>}
                    {!hasNumber && <li>✔ At least 1 digit</li>}
                    {!hasSpecialChar && <li>✔ At least 1 special character</li>}
                  </ul>

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Confirm Password Field */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-[0.85em] sm:text-[0.9em] md:text-[0.95em] lg:text-[1em] rounded-md">
                    Confirm Password
                  </FormLabel>
                  <FormControl>
                    <PasswordConfirm
                      placeholder="Confirm your password"
                      {...field}
                      className="
                          pl-[3em] py-[1.2em] text-[0.8em]
                          sm:pl-[3.3em] sm:py-[1.3em] sm:text-[0.85em]
                          md:pl-[3.4em] md:py-[1.4em] md:text-[0.9em]
                          lg:pl-[3.5em] lg:py-[1.5em] lg:text-[0.95em]
                          bg-[#C4C4C4] border-gray-600 text-[#2F2F2F] font-medium rounded-md
                        "
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#000000] hover:shadow-xl hover:shadow-[#DCB968] cursor-pointer text-[#FFFFFF] font-bold rounded-md py-3 text-[0.8em]
              sm:text-[0.9em] sm:py-4 
              md:text-base md:py-5
              lg:text-[1.1em] lg:py-6"
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </Button>
          </form>
        </Form>

        {/* Sign In Link */}
        <div className="text-center text-[#C4C4C4] font-normal mt-2 text-[0.75em] sm:text-[0.8em] md:text-[0.85em] lg:text-base">
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
