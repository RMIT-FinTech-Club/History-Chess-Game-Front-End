"use client";
import React, { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
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
import { toast } from "sonner";
import axios from "axios";

const formSchema = z
  .object({
    email: z
      .string()
      .min(1, { message: "Please enter your email." })
      .email({ message: "Invalid email address." })
      .refine((value) => value.endsWith("@gmail.com"), {
        message: "Email must be a valid Gmail address.",
      })
      .refine((value) => /^[a-zA-Z0-9@.]+$/.test(value), {
        message: "Email can only contain letters, numbers, @, and .",
      }),
    username: z
      .string()
      .min(1, { message: "Please enter your username." })
      .min(3, { message: "Username must be at least 3 characters." })
      .max(50, { message: "Username must not exceed 50 characters." })
      .regex(/^[a-zA-Z0-9]+$/, {
        message: "Username must contain only letters and numbers.",
      }),
    password: z
      .string()
      .min(1, { message: "Please enter your password." })
      .min(9, { message: "Password must be at least 9 characters." })
      .max(128, { message: "Password must not exceed 128 characters." })
      .refine((value) => /[A-Z]/.test(value), {
        message: "Password must contain at least one uppercase letter.",
      })
      .refine((value) => /[0-9]/.test(value), {
        message: "Password must contain at least one number.",
      })
      .refine((value) => /[!@#$%^&*]/.test(value), {
        message: "Password must contain at least one special character (!@#$%^&*).",
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
  const [backendErrors, setBackendErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
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

  const isMinLength = password.length >= 9;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*]/.test(password);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setLoading(true);
    setBackendErrors({ username: "", email: "", password: "", confirmPassword: "" });

    try {
      const response = await axios.post("http://localhost:8080/users/register", {
        username: data.username,
        email: data.email,
        password: data.password,
      });
      localStorage.setItem("token", response.data.token);
      document.getElementById("username-input")?.classList.add("border-green-500", "border-[0.3vh]");
      document.getElementById("email-input")?.classList.add("border-green-500", "border-[0.3vh]");
      document.querySelector("input[name='password']")?.classList.add("border-green-500", "border-[0.3vh]");
      document.querySelector("input[name='confirmPassword']")?.classList.add("border-green-500", "border-[0.3vh]");
      toast.success("Sign up successful!");
      router.push("/sign_in");
    } catch (error: any) {
      const message = error.response?.data?.message || "Sign up failed";
      // Map backend error to specific field
      if (message.includes("username")) {
        setBackendErrors((prev) => ({ ...prev, username: message }));
        document.getElementById("username-input")?.classList.add("border-red-500", "border-[0.3vh]");
      } else if (message.includes("email")) {
        setBackendErrors((prev) => ({ ...prev, email: message }));
        document.getElementById("email-input")?.classList.add("border-red-500", "border-[0.3vh]");
      } else if (message.includes("password")) {
        setBackendErrors((prev) => ({ ...prev, password: message }));
        document.querySelector("input[name='password']")?.classList.add("border-red-500", "border-[0.3vh]");
      } else {
        setBackendErrors((prev) => ({ ...prev, username: message }));
        document.getElementById("username-input")?.classList.add("border-red-500", "border-[0.3vh]");
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center md:justify-start text-white font-poppins font-bold relative">
      <div className="w-[40vw] aspect-[1/1] ml-[5vw] mr-[3vw] relative md:block hidden">
        <div className="w-full absolute aspect-[1/1] bg-[#DCB968] rounded-[50%] blur-[15vw] left-0 top-[50%] -translate-y-[50%]"></div>
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
                        id="email-input"
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
                  <FormMessage className="text-[2.5vh] text-red-500" />
                  {backendErrors.email && (
                    <p className="text-red-500 text-[2.5vh] font-bold">{backendErrors.email}</p>
                  )}
                </FormItem>
              )}
            />
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
                        id="username-input"
                        placeholder="Enter your username"
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
                  <FormMessage className="text-[2.5vh] text-red-500" />
                  {backendErrors.username && (
                    <p className="text-red-500 text-[2.5vh] font-bold">{backendErrors.username}</p>
                  )}
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
                        onChange={(e) => {
                          field.onChange(e);
                          setPassword(e.target.value);
                        }}
                      />
                    </div>
                  </FormControl>
                  <ul className="font-normal text-[2.5vh] rounded-md">
                    <li className={isMinLength ? "text-green-500" : ""}>
                      ✔ 9 characters minimum
                    </li>
                    <li className={hasUppercase ? "text-green-500" : ""}>
                      ✔ At least 1 capital letter
                    </li>
                    <li className={hasNumber ? "text-green-500" : ""}>
                      ✔ At least 1 digit
                    </li>
                    <li className={hasSpecialChar ? "text-green-500" : ""}>
                      ✔ At least 1 special character (!@#$%^&*)
                    </li>
                  </ul>
                  <FormMessage className="text-[2.5vh] text-red-500" />
                  {backendErrors.password && (
                    <p className="text-red-500 text-[2.5vh] font-bold">{backendErrors.password}</p>
                  )}
                </FormItem>
              )}
            />
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
                          bg-[#C4C4C4] border-[#DCB968] focus:border-[0.35vh] text-[#2F2F2F] 
                          !text-[3vh] font-normal rounded-[1.5vh]
                        "
                      />
                    </div>
                  </FormControl>
                  <FormMessage className="text-[2.5vh] text-red-500" />
                  {backendErrors.confirmPassword && (
                    <p className="text-red-500 text-[2.5vh] font-bold">{backendErrors.confirmPassword}</p>
                  )}
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#000000] hover:shadow-2xl hover:shadow-amber-400 cursor-pointer text-[#FFFFFF] font-bold text-[3.5vh] py-[4vh] md:py-[4vh] lg:py-[4.5vh] mt-[1.75vh] mb-[1.75vh] rounded-[1.5vh]"
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </Button>
          </form>
        </Form>
        <div className="text-center text-[#C4C4C4] text-[3vh] font-normal">
          Already have an account?{" "}
          <a href="/sign_in" className="text-[#184BF2] font-bold hover:underline">
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
};

export default SignUp;