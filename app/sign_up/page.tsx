"use client";
import React, { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { MdEmail, MdPerson } from "react-icons/md";
import { toast } from "sonner";
import axios from "axios";

const SignUp = () => {
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const form = useForm({
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  type FormValues = {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
  };

  const isMinLength = password.length >= 9;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*]/.test(password);

  const onSubmit = useCallback(
    async (values: FormValues) => {
      setLoading(true);
      setErrors({ username: "", email: "", password: "", confirmPassword: "" });

      // Client-side validation
      if (!values.username) {
        setErrors((prev) => ({
          ...prev,
          username: "Please enter your username.",
        }));
        document
          .getElementById("username-input")
          ?.classList.add("border-red-500", "border-[0.3vh]");
        setLoading(false);
        return;
      }
      if (
        !/^[a-zA-Z0-9]+$/.test(values.username) ||
        values.username.length < 3 ||
        values.username.length > 50
      ) {
        setErrors((prev) => ({
          ...prev,
          username:
            values.username.length < 3
              ? "Username must be at least 3 characters."
              : values.username.length > 50
                ? "Username must not exceed 50 characters."
                : "Username must contain only letters and numbers.",
        }));
        document
          .getElementById("username-input")
          ?.classList.add("border-red-500", "border-[0.3vh]");
        setLoading(false);
        return;
      }
      document
        .getElementById("username-input")
        ?.classList.remove("border-red-500", "border-[0.3vh]");

      if (!values.email) {
        setErrors((prev) => ({ ...prev, email: "Please enter your email." }));
        document
          .getElementById("email-input")
          ?.classList.add("border-red-500", "border-[0.3vh]");
        setLoading(false);
        return;
      }
      const validEmailRegex = /^[a-zA-Z0-9@.]+$/;
      const isValidEmailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        values.email
      );
      if (
        !validEmailRegex.test(values.email) ||
        !isValidEmailFormat ||
        !values.email.endsWith("@gmail.com")
      ) {
        setErrors((prev) => ({
          ...prev,
          email: "Please enter a valid Gmail address.",
        }));
        document
          .getElementById("email-input")
          ?.classList.add("border-red-500", "border-[0.3vh]");
        setLoading(false);
        return;
      }
      document
        .getElementById("email-input")
        ?.classList.remove("border-red-500", "border-[0.3vh]");

      if (!values.password) {
        setErrors((prev) => ({
          ...prev,
          password: "Please enter your password.",
        }));
        document
          .querySelector("input[name='password']")
          ?.classList.add("border-red-500", "border-[0.3vh]");
        setLoading(false);
        return;
      }
      if (
        values.password.length < 9 ||
        values.password.length > 128 ||
        !/[A-Z]/.test(values.password) ||
        !/[0-9]/.test(values.password) ||
        !/[!@#$%^&*]/.test(values.password)
      ) {
        setErrors((prev) => ({
          ...prev,
          password:
            values.password.length < 9
              ? "Password must be at least 9 characters."
              : values.password.length > 128
                ? "Password must not exceed 128 characters."
                : !/[A-Z]/.test(values.password)
                  ? "Password must contain at least one uppercase letter."
                  : !/[0-9]/.test(values.password)
                    ? "Password must contain at least one number."
                    : "Password must contain at least one special character (!@#$%^&*).",
        }));
        document
          .querySelector("input[name='password']")
          ?.classList.add("border-red-500", "border-[0.3vh]");
        setLoading(false);
        return;
      }
      document
        .querySelector("input[name='password']")
        ?.classList.remove("border-red-500", "border-[0.3vh]");

      if (!values.confirmPassword) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "Please confirm your password.",
        }));
        document
          .querySelector("input[name='confirmPassword']")
          ?.classList.add("border-red-500", "border-[0.3vh]");
        setLoading(false);
        return;
      }
      if (values.password !== values.confirmPassword) {
        setErrors((prev) => ({
          ...prev,
          confirmPassword: "Passwords do not match.",
        }));
        document
          .querySelector("input[name='confirmPassword']")
          ?.classList.add("border-red-500", "border-[0.3vh]");
        setLoading(false);
        return;
      }
      document
        .querySelector("input[name='confirmPassword']")
        ?.classList.remove("border-red-500", "border-[0.3vh]");

      try {
        await axios.post("http://localhost:8080/users", {
          username: values.username,
          email: values.email,
          password: values.password,
        });
        document
          .getElementById("username-input")
          ?.classList.add("border-green-500", "border-[0.3vh]");
        document
          .getElementById("email-input")
          ?.classList.add("border-green-500", "border-[0.3vh]");
        document
          .querySelector("input[name='password']")
          ?.classList.add("border-green-500", "border-[0.3vh]");
        document
          .querySelector("input[name='confirmPassword']")
          ?.classList.add("border-green-500", "border-[0.3vh]");
        toast.success("Sign up successful! Please sign in to continue.");
        router.push("/sign_in");
      } catch (error: any) {
        const message = error.response?.data?.message || "Sign up failed";
        if (message.includes("username")) {
          setErrors((prev) => ({ ...prev, username: message }));
          document
            .getElementById("username-input")
            ?.classList.add("border-red-500", "border-[0.3vh]");
        } else if (message.includes("email")) {
          setErrors((prev) => ({ ...prev, email: message }));
          document
            .getElementById("email-input")
            ?.classList.add("border-red-500", "border-[0.3vh]");
        } else if (message.includes("password")) {
          setErrors((prev) => ({ ...prev, password: message }));
          document
            .querySelector("input[name='password']")
            ?.classList.add("border-red-500", "border-[0.3vh]");
        } else {
          setErrors((prev) => ({ ...prev, username: message }));
          document
            .getElementById("username-input")
            ?.classList.add("border-red-500", "border-[0.3vh]");
        }
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  return (
    <div className="min-h-screen text-white font-poppins font-bold relative md:flex md:justify-around md:items-center">
      <div className="w-[35vw] aspect-[1/1] relative md:block hidden">
        <div className="w-full absolute aspect-[1/1] bg-[#DBB968] rounded-[50%] blur-[15vw] left-0 top-[50%] -translate-y-[50%]"></div>
        <div
          className="w-full absolute aspect-[1/1] bg-no-repeat bg-center bg-contain left-0 top-[50%] -translate-y-[50%]"
          style={{ backgroundImage: "url('/FTC_Logo.png')" }}
        ></div>
      </div>
      <div className="flex flex-col items-center justify-center">
        <h2 className="text-center text-[5.5vh] mt-[1vh]">Sign Up</h2>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-3 w-[80vw] md:w-[42vw]"
          >
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-[3vh]">
                    Username
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MdPerson
                        className="absolute top-1/2 left-6 md:left-4 transform -translate-y-1/2 text-[#2F2F2F] text-[5vh] cursor-pointer"
                        onClick={() =>
                          document.getElementById("username-input")?.focus()
                        }
                      />
                      <Input
                        id="username-input"
                        placeholder="Enter your username"
                        {...field}
                        className="
                          !pl-[3.75vw]
                          py-[4vh] w-full
                          bg-[#C4C4C4] border-[#DCB968] focus:border-[0.35vh] text-[#2F2F2F]
                          !text-[3vh] font-normal rounded-[1.5vh]
                        "
                        autoComplete="off"
                      />
                    </div>
                  </FormControl>
                  {errors.username && (
                    <p className="text-red-500 text-[2.5vh] font-bold">
                      {errors.username}
                    </p>
                  )}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-[3vh]">Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MdEmail
                        className="absolute top-1/2 left-6 md:left-4 transform -translate-y-1/2 text-[#2F2F2F] text-[5vh] cursor-pointer"
                        onClick={() =>
                          document.getElementById("email-input")?.focus()
                        }
                      />
                      <Input
                        id="email-input"
                        placeholder="Enter your email"
                        {...field}
                        className="
                          !pl-[3.75vw]
                          py-[4vh] w-full
                          bg-[#C4C4C4] border-[#DCB968] focus:border-[0.35vh] text-[#2F2F2F]
                          !text-[3vh] font-normal rounded-[1.5vh]
                        "
                        autoComplete="off"
                      />
                    </div>
                  </FormControl>
                  {errors.email && (
                    <p className="text-red-500 text-[2.5vh] font-bold">
                      {errors.email}
                    </p>
                  )}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-[3vh]">
                    Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <PasswordInput
                        placeholder="Enter your password"
                        {...field}
                        className="
                          !pl-[3.75vw]
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
                  <ul className="font-normal text-[2.5vh]">
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
                  {errors.password && (
                    <p className="text-red-500 text-[2.5vh] font-bold">
                      {errors.password}
                    </p>
                  )}
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-bold text-[3vh]">
                    Confirm Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <PasswordInput
                        placeholder="Confirm your password"
                        {...field}
                        className="
                          !pl-[3.75vw]
                          py-[4vh] w-full
                          bg-[#C4C4C4] border-[#DCB968] focus:border-[0.35vh] text-[#2F2F2F]
                          !text-[3vh] font-normal rounded-[1.5vh]
                        "
                      />
                    </div>
                  </FormControl>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-[2.5vh] font-bold">
                      {errors.confirmPassword}
                    </p>
                  )}
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#000000] mt-[1.75vh] mb-[1.75vh] !py-[3.5vh] !rounded-[1.5vh] !text-[3vh] !font-semibold hover:!bg-[#DBB968] !cursor-pointer"
            >
              {loading ? "Signing Up..." : "Sign Up"}
            </Button>
          </form>
        </Form>
        <div className="text-center text-[#C4C4C4] text-[3vh] font-normal my-[2vh]">
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
