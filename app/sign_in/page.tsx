"use client";
import React, { useState, useCallback, useEffect } from "react";
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
import { MdEmail } from "react-icons/md";
import { toast } from "sonner";
import axios from "axios";
import { useGlobalStorage } from "@/hooks/GlobalStorage";

const SignIn = () => {
  const [errors, setErrors] = useState({ identifier: "", password: "" });
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);
  const [googleEmail, setGoogleEmail] = useState("");
  const [tempToken, setTempToken] = useState("");
  const router = useRouter();
  const { setAuthData } = useGlobalStorage();
  const form = useForm({
    defaultValues: {
      identifier: "",
      password: "",
    },
  });
  const usernameForm = useForm({
    defaultValues: {
      username: "",
    },
  });

  type FormValues = {
    identifier: string;
    password: string;
  };

  type UsernameFormValues = {
    username: string;
  };

  const onSubmit = useCallback(
    async (values: FormValues) => {
      const { identifier, password } = values;
      setErrors({ identifier: "", password: "" });

      // Client-side validation
      if (!identifier) {
        setErrors((prev) => ({
          ...prev,
          identifier: "Please enter your username or email.",
        }));
        document
          .getElementById("identifier-input")
          ?.classList.add("border-red-500", "border-[0.3vh]");
        return;
      }

      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
      const isUsername = /^[a-zA-Z0-9]+$/.test(identifier);
      if (isEmail) {
        if (!identifier.endsWith("@gmail.com")) {
          setErrors((prev) => ({
            ...prev,
            identifier: "Email must be a Gmail address.",
          }));
          document
            .getElementById("identifier-input")
            ?.classList.add("border-red-500", "border-[0.3vh]");
          return;
        }
      } else if (isUsername) {
        if (identifier.length < 3 || identifier.length > 50) {
          setErrors((prev) => ({
            ...prev,
            identifier: "Username must be 3-50 characters, letters and numbers only.",
          }));
          document
            .getElementById("identifier-input")
            ?.classList.add("border-red-500", "border-[0.3vh]");
          return;
        }
      } else {
        setErrors((prev) => ({
          ...prev,
          identifier: "Please enter a valid email or username.",
        }));
        document
          .getElementById("identifier-input")
          ?.classList.add("border-red-500", "border-[0.3vh]");
        return;
      }
      document
        .getElementById("identifier-input")
        ?.classList.remove("border-red-500", "border-[0.3vh]");

      if (!password) {
        setErrors((prev) => ({
          ...prev,
          password: "Please enter your password.",
        }));
        document
          .querySelector("input[type='password']")
          ?.classList.add("border-red-500", "border-[0.3vh]");
        return;
      }
      if (
        password.length < 9 ||
        !/[A-Z]/.test(password) ||
        !/[0-9]/.test(password) ||
        !/[!@#$%^&*]/.test(password)
      ) {
        setErrors((prev) => ({
          ...prev,
          password:
            "Password must be at least 9 characters, with 1 uppercase letter, 1 number, and 1 special character (!@#$%^&*).",
        }));
        document
          .querySelector("input[type='password']")
          ?.classList.add("border-red-500", "border-[0.3vh]");
        return;
      }
      document
        .querySelector("input[type='password']")
        ?.classList.remove("border-red-500", "border-[0.3vh]");

      try {
        const response = await axios.post("http://localhost:8080/users/login", {
          identifier,
          password,
        });
        const { token, data } = response.data;
        setAuthData({
          userId: data.id,
          userName: data.username,
          email: data.email,
          accessToken: token,
          refreshToken: null,
          avatar: data.avatarUrl || null,
        });
        document
          .getElementById("identifier-input")
          ?.classList.add("border-green-500", "border-[0.3vh]");
        document
          .querySelector("input[type='password']")
          ?.classList.add("border-green-500", "border-[0.3vh]");
        toast.success("Sign in successful!");
        router.push("/home");
      } catch (err: unknown) {
        const message = axios.isAxiosError(err)
          ? err.response?.data?.message || "Sign in failed"
          : "Sign in failed";
        if (message.includes("User") || message.includes("email")) {
          setErrors((prev) => ({ ...prev, identifier: message }));
          document
            .getElementById("identifier-input")
            ?.classList.add("border-red-500", "border-[0.3vh]");
        } else if (message.includes("password")) {
          setErrors((prev) => ({ ...prev, password: message }));
          document
            .querySelector("input[type='password']")
            ?.classList.add("border-red-500", "border-[0.3vh]");
        } else {
          setErrors((prev) => ({ ...prev, password: message }));
          document
            .querySelector("input[type='password']")
            ?.classList.add("border-red-500", "border-[0.3vh]");
        }
        toast.error(message);
      }
    },
    [router, setAuthData]
  );

  const handleGoogleLogin = () => {
    const state = Math.random().toString(36).substring(2);
    const popup = window.open(
      `http://localhost:8080/users/google-auth?state=${state}&prompt=consent`,
      "google-auth",
      "width=500,height=600"
    );
    if (!popup) {
      toast.error("Popup blocked. Please allow popups and try again.");
    }
  };

  const onUsernameSubmit = useCallback(
    async (values: UsernameFormValues) => {
      try {
        const response = await axios.post(
          "http://localhost:8080/users/complete-google-login",
          {
            tempToken,
            username: values.username,
          }
        );
        const { token, data } = response.data;
        setAuthData({
          userId: data.id,
          userName: data.username,
          email: data.email,
          accessToken: token,
          refreshToken: null,
          avatar: data.avatarUrl || null,
        });
        toast.success("Google login successful!");
        setShowUsernamePrompt(false);
        router.push("/profile");
      } catch (err: unknown) {
        const message = axios.isAxiosError(err)
          ? err.response?.data?.message || "Failed to complete Google login"
          : "Failed to complete Google login";
        toast.error(message);
      }
    },
    [router, setAuthData, tempToken]
  );

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "http://localhost:8080") return;
      const { type, token, userId, username, email, tempToken, error } =
        event.data;
      if (type === "google-auth") {
        setAuthData({
          userId,
          userName: username,
          email,
          accessToken: token,
          refreshToken: null,
          avatar: null,
        });
        toast.success("Google login successful!");
        router.push("/home");
      } else if (type === "google-auth-prompt-username") {
        setGoogleEmail(email);
        setTempToken(tempToken);
        setShowUsernamePrompt(true);
      } else if (type === "google-auth-error") {
        if (error.includes("This email has been used already")) {
          toast.error(
            "This email is already registered with a standard account. Please use a different Google account or sign in with your password."
          );
        } else {
          toast.error(error || "Google login failed");
        }
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [router, setAuthData]);

  return (
    <div className=" min-h-screen text-white font-poppins font-bold relative md:flex md:justify-around md:items-center ">
      <div className="w-[35vw] aspect-[1/1] relative md:block hidden">
        <div className="w-full absolute aspect-[1/1] bg-[#DBB968] rounded-[50%] blur-[15vw] left-0 top-[50%] -translate-y-[50%]"></div>
        <div
          className="w-full absolute aspect-[1/1] bg-no-repeat bg-center bg-contain left-0 top-[50%] -translate-y-[50%]"
          style={{ backgroundImage: "url('/FTC_Logo.png')" }}
        ></div>
      </div>
      <div className="flex flex-col items-center">
        <h2 className="text-center text-[4vh] md:text-[7vh]">Sign In</h2>
        {showUsernamePrompt ? (
          <Form {...usernameForm}>
            <form
              onSubmit={usernameForm.handleSubmit(onUsernameSubmit)}
              className="space-y-3 w-[80vw] md:w-[42vw]"
            >
              <FormField
                control={usernameForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-[3vh]">
                      Choose a Username
                    </FormLabel>
                    <FormControl>
                      <Input
                        id="username-input"
                        placeholder="Enter your username (letters and numbers only)"
                        {...field}
                        className="
                          pl-[7.5vw] sm:pl-[5.85vw] md:pl-[4.5vw] lg:pl-[3.75vw]
                          py-[4vh] w-full
                          bg-[#C4C4C4] border-[#DCB968] focus:border-[0.35vh] text-[#2F2F2F]
                          !text-[3vh] font-normal rounded-[1.5vh]
                        "
                        autoComplete="off"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-[#000000] hover:shadow-2xl hover:shadow-amber-400 cursor-pointer text-[#FFFFFF] font-bold text-[3.5vh] py-[4vh] mt-[1.75vh] mb-[1.75vh] rounded-[1.5vh]"
              >
                Submit Username
              </Button>
            </form>
          </Form>
        ) : (
          <>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-3 w-[80vw] md:w-[42vw]"
              >
                <FormField
                  control={form.control}
                  name="identifier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold text-[2.5vh] md:text-[3vh]">
                        Username/Email
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MdEmail
                            className="absolute top-1/2 left-6 md:left-4 transform -translate-y-1/2 text-[#2F2F2F] text-[3vh] md:text-[5vh] cursor-pointer"
                            onClick={() =>
                              document
                                .getElementById("identifier-input")
                                ?.focus()
                            }
                          />
                          <Input
                            id="identifier-input"
                            placeholder="Enter your username or email"
                            {...field}
                            className="
                              !pl-[4vw] 
                              py-[12vh] md:py-[4vh] w-full
                              bg-[#C4C4C4] border-[#DCB968] focus:border-[0.35vh] text-[#2F2F2F]
                              text-[2vh] md:text-[3vh] font-normal rounded-[1.5vh]
                            "
                            autoComplete="off"
                          />
                        </div>
                      </FormControl>
                      {errors.identifier && (
                        <p className="text-red-500 text-[2.5vh] font-bold">
                          {errors.identifier}
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
                      <FormLabel className="font-bold text-[2.5vh] md:text-[3vh]">
                        Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <PasswordInput
                            placeholder="Enter your password"
                            {...field}
                            className="
                              !pl-[4vw]
                              py-[12vh] md:py-[4vh] w-full
                              bg-[#C4C4C4] border-[#DCB968] focus:border-[0.35vh] text-[#2F2F2F]
                              text-[2vh] md:text-[3vh] font-normal rounded-[1.5vh]
                            "
                          />
                        </div>
                      </FormControl>
                      {errors.password && (
                        <p className="text-red-500 text-[2.5vh] font-bold">
                          {errors.password}
                        </p>
                      )}
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
                  <a
                    href="/reset_password"
                    className="hover:underline text-[#184BF2]"
                  >
                    Forgot Password?
                  </a>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#000000] mt-[1.75vh] mb-[1.75vh] !py-[3.5vh] !rounded-[1.5vh] !text-[3vh] !font-semibold hover:!bg-[#DBB968] !cursor-pointer"
                >
                  Sign In
                </Button>
              </form>
            </Form>
            <div className="text-center text-[#C4C4C4] text-[2.75vh] md:text-[3vh] font-normal">
              or continue with
            </div>
            <div className="md:w-full">
              <Button
                onClick={handleGoogleLogin}
                className="md:w-full w-[80vw] !bg-[#ECECEC] mt-[1.75vh] mb-[1.75vh] !py-[3.5vh] !rounded-[1.5vh] !text-[3vh] !text-[#000000] !font-semibold hover:!bg-[#DBB968] !cursor-pointer"
              >
                <img
                  src="/Google-Logo.svg"
                  alt="Google Icon"
                  className="mr-[1vw] md:mr-[0.5vw] w-[4vh] h-[4vh]"
                />
                Continue with Google
              </Button>
            </div>
            <div className="text-center text-[#C4C4C4] text-[2.75vh] md:text-[3vh] font-normal">
              Don’t have an account?{" "}
              <a
                href="/sign_up"
                className="text-[#184BF2] font-bold hover:underline"
              >
                Sign Up
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SignIn;