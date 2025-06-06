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
import { useGlobalStorage } from "@/components/GlobalStorage";

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

      const validIdentifierRegex = /^[a-zA-Z0-9@.]+$/;
      if (!validIdentifierRegex.test(identifier)) {
        setErrors((prev) => ({
          ...prev,
          identifier: "Please enter suitable email or username.",
        }));
        document
          .getElementById("identifier-input")
          ?.classList.add("border-red-500", "border-[0.3vh]");
        return;
      }

      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
      const isUsername = /^[a-zA-Z0-9]+$/.test(identifier);
      if (!isEmail && !isUsername) {
        setErrors((prev) => ({
          ...prev,
          identifier: "Please enter suitable email or username.",
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
      document
        .querySelector("input[type='password']")
        ?.classList.remove("border-red-500", "border-[0.3vh]");

      try {
        const response = await axios.post("http://localhost:8080/users/login", {
          identifier,
          password,
        });
        console.log("Login response:", response.data);
        setAuthData({
          userId: response.data.user.id,
          userName: response.data.user.username,
          email: response.data.user.email,
          accessToken: response.data.token,
          refreshToken: null,
        });
        console.log(
          "Stored accessToken:",
          useGlobalStorage.getState().accessToken
        );
        document
          .getElementById("identifier-input")
          ?.classList.add("border-green-500", "border-[0.3vh]");
        document
          .querySelector("input[type='password']")
          ?.classList.add("border-green-500", "border-[0.3vh]");
        toast.success("Sign in successful!");
        router.push("/profile");
      } catch (err: any) {
        const message = err.response?.data?.message || "Sign in failed";
        console.error("Login error:", err.response?.data);
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
      `http://localhost:8080/users/google-auth?state=${state}`,
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
        console.log("Google login completion response:", response.data);
        setAuthData({
          userId: response.data.user.id,
          userName: response.data.user.username,
          email: response.data.user.email,
          accessToken: response.data.token,
          refreshToken: null,
        });
        toast.success("Google login successful!");
        setShowUsernamePrompt(false);
        router.push("/profile");
      } catch (err: any) {
        const message =
          err.response?.data?.message || "Failed to complete Google login";
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
        });
        toast.success("Google login successful!");
        router.push("/profile");
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
                      <FormLabel className="font-bold text-[3vh]">
                        Username or Email
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MdEmail
                            className="
                              absolute text-black cursor-pointer
                              top-[1.55vh] left-[1.45vw] sm:left-[1.2vw] md:left-[1vw] lg:left-[0.95vw] text-[5vh]
                            "
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
                      <FormLabel className="font-bold text-[3vh]">
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
                  className="w-full bg-[#000000] hover:shadow-2xl hover:shadow-amber-400 cursor-pointer text-[#FFFFFF] font-bold text-[3.5vh] py-[4vh] mt-[1.75vh] mb-[1.75vh] rounded-[1.5vh]"
                >
                  Sign In
                </Button>
              </form>
            </Form>
            <div className="text-center text-[#C4C4C4] text-[3vh] font-normal">
              or continue with
            </div>
            <div className="space-y-2 sm:space-y-3 md:space-y-4">
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center bg-[#ECECEC] cursor-pointer text-[#000000] font-bold text-[3vh] py-[1.5vh] md:py-[2.45vh] mt-[1.75vh] mb-[1.75vh] rounded-[1.5vh]"
              >
                <img
                  src="/Google-Logo.svg"
                  alt="Google Icon"
                  className="mr-[1vw] md:mr-[0.5vw] w-[4vh] h-[4vh]"
                />
                Continue with Google
              </button>
            </div>
            <div className="text-center text-[#C4C4C4] text-[3vh] font-normal">
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
