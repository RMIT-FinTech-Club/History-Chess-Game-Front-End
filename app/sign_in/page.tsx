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
import { MdEmail } from "react-icons/md";
import { FaKey, FaEye, FaEyeSlash } from "react-icons/fa6";
import { toast } from "sonner";
import axios from "axios";
import axiosInstance from "@/config/apiConfig";
import basePath from "@/config/pathConfig";
import { useGlobalStorage } from "@/hooks/GlobalStorage";

const SignIn = () => {
  const [errors, setErrors] = useState({ identifier: "", password: "" });
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleEmail, setGoogleEmail] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [loading, setLoading] = useState(false);
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
      setLoading(true);

      // Client-side validation
      if (!identifier) {
        setErrors((prev) => ({
          ...prev,
          identifier: "Please enter your username or email.",
        }));
        setLoading(false);
        return;
      }

      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
      const isUsername = /^[a-zA-Z0-9]+$/.test(identifier);
      if (isEmail) {
        // Accept any valid email format
      } else if (isUsername) {
        if (identifier.length < 3 || identifier.length > 50) {
          setErrors((prev) => ({
            ...prev,
            identifier: "Username must be 3-50 characters, letters and numbers only.",
          }));
          setLoading(false);
          return;
        }
      } else {
        setErrors((prev) => ({
          ...prev,
          identifier: "Please enter a valid email or username.",
        }));
        setLoading(false);
        return;
      }

      if (!password) {
        setErrors((prev) => ({
          ...prev,
          password: "Please enter your password.",
        }));
        setLoading(false);
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
        setLoading(false);
        return;
      }

      try {
        const response = await axiosInstance.post("/users/login", {
          identifier,
          password,
        });
        const { token, id, username, email, avatarUrl, role } = response.data;

        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
          throw new Error("Invalid user ID in login response");
        }

        setAuthData({
          userId: id,
          userName: username,
          email,
          accessToken: token,
          refreshToken: null,
          role,
          avatar: avatarUrl || null,
        });
        toast.success("Sign in successful!");
        router.push("/home");
      } catch (err: unknown) {
        const message = axios.isAxiosError(err)
          ? err.response?.data?.message || "Sign in failed"
          : "Sign in failed";
        if (message.includes("User") || message.includes("email")) {
          setErrors((prev) => ({ ...prev, identifier: message }));
        } else if (message.includes("password")) {
          setErrors((prev) => ({ ...prev, password: message }));
        } else {
          setErrors((prev) => ({ ...prev, password: message }));
        }
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [router, setAuthData]
  );

  const handleGoogleLogin = () => {
    const state = Math.random().toString(36).substring(2);
    const popup = window.open(
      `${basePath}/users/google-auth?state=${state}&prompt=consent`,
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
        const response = await axiosInstance.post(
          "/users/complete-google-login",
          {
            tempToken,
            username: values.username,
          }
        );
        const { token, id, username, email, avatarUrl, role } = response.data;

        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
          throw new Error("Invalid user ID in Google login response");
        }

        setAuthData({
          userId: id,
          userName: username,
          email,
          accessToken: token,
          refreshToken: null,
          role,
          avatar: avatarUrl,
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
      if (event.origin !== basePath) return;
      const { type, token, userId, username, email, avatarUrl, tempToken, role, error } = event.data;
      if (type === "google-auth") {
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(userId)) {
          toast.error("Invalid user ID from Google auth response");
          return;
        }

        setAuthData({
          userId,
          userName: username,
          email,
          accessToken: token,
          refreshToken: null,
          role,
          avatar: avatarUrl || null,
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
    <div className="min-h-screen bg-bg-app relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-gold-royal/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-gold-shimmer/8 rounded-full blur-[100px]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo Section */}
          <div className="flex justify-center mb-8 animate-fade-up">
            <div className="relative">
              <div className="absolute inset-0 bg-gold-royal/30 rounded-full blur-[60px]" />
              <div
                className="relative w-32 h-32 md:w-40 md:h-40 bg-contain bg-center bg-no-repeat animate-float"
                style={{ backgroundImage: "url('/FTC_Logo.png')" }}
              />
            </div>
          </div>

          {/* Form Card */}
          <div className="glass-gold rounded-2xl p-8 animate-fade-up stagger-1">
            <h1 className="font-display text-3xl md:text-4xl text-center gold-gradient-text mb-2">
              WELCOME BACK
            </h1>
            <p className="font-serif text-sm text-white/60 text-center mb-8">
              Enter the realm of strategic mastery
            </p>

            {showUsernamePrompt ? (
              <Form {...usernameForm}>
                <form
                  onSubmit={usernameForm.handleSubmit(onUsernameSubmit)}
                  className="space-y-6"
                >
                  <div className="text-center mb-4">
                    <p className="font-serif text-white/80 text-sm">
                      Complete your profile for: <span className="text-gold-light">{googleEmail}</span>
                    </p>
                  </div>
                  <FormField
                    control={usernameForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-serif text-sm text-gold-light uppercase tracking-wider">
                          Choose Your Username
                        </FormLabel>
                        <FormControl>
                          <input
                            id="username-input"
                            placeholder="Enter your username"
                            {...field}
                            className="
                              w-full py-4 px-4
                              bg-bg-dark/80 border border-gold-deep/30 
                              focus:border-gold-royal focus:ring-1 focus:ring-gold-royal/50
                              text-white placeholder:text-white/40
                              font-sans text-base rounded-lg
                              transition-all duration-300
                              outline-none
                            "
                            autoComplete="off"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="
                      w-full py-4 rounded-lg
                      bg-linear-to-r from-gold-main via-gold-royal to-gold-dark
                      hover:from-gold-shimmer hover:via-gold-main hover:to-gold-royal
                      text-bg-dark font-serif font-semibold text-lg
                      transition-all duration-300 transform hover:scale-[1.02]
                      shadow-lg hover:shadow-gold-royal/30
                    "
                  >
                    Complete Registration
                  </Button>
                </form>
              </Form>
            ) : (
              <>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-5"
                  >
                    <FormField
                      control={form.control}
                      name="identifier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-serif text-sm text-gold-light uppercase tracking-wider">
                            Username / Email
                          </FormLabel>
                          <FormControl>
                            <div className={`
                              flex items-center w-full 
                              bg-bg-dark/80 border rounded-lg 
                              transition-all duration-300
                              ${errors.identifier ? 'border-red-500' : 'border-gold-deep/30'}
                              focus-within:border-gold-royal focus-within:ring-1 focus-within:ring-gold-royal/50
                            `}>
                              <div className="flex items-center justify-center px-4 border-r border-gold-deep/20 min-h-[56px]">
                                <MdEmail className="text-gold-muted text-xl" />
                              </div>
                              <input
                                id="identifier-input"
                                placeholder="Enter your username or email"
                                {...field}
                                className="
                                  flex-1
                                  bg-transparent border-none outline-none
                                  px-4 py-4
                                  text-text-primary placeholder:text-text-muted
                                  font-sans text-base w-full
                                  rounded-r-lg
                                "
                                autoComplete="off"
                              />
                            </div>
                          </FormControl>
                          {errors.identifier && (
                            <p className="text-red-400 text-sm mt-1 font-sans">
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
                          <FormLabel className="font-serif text-sm text-gold-light uppercase tracking-wider">
                            Password
                          </FormLabel>
                          <FormControl>
                            <div className={`
                              flex items-center w-full 
                              bg-bg-dark/80 border rounded-lg 
                              transition-all duration-300
                              ${errors.password ? 'border-red-500' : 'border-gold-deep/30'}
                              focus-within:border-gold-royal focus-within:ring-1 focus-within:ring-gold-royal/50
                            `}>
                              <div className="flex items-center justify-center px-4 border-r border-gold-deep/20 min-h-[56px]">
                                <FaKey className="text-gold-muted text-lg transform -rotate-45" />
                              </div>
                              <input
                                id="password-input"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                {...field}
                                className="
                                  flex-1
                                  bg-transparent border-none outline-none
                                  px-4 py-4
                                  text-text-primary placeholder:text-text-muted
                                  font-sans text-base w-full
                                "
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="px-4 text-gold-muted hover:text-gold-light transition-colors"
                              >
                                {showPassword ? (
                                  <FaEyeSlash className="text-lg" />
                                ) : (
                                  <FaEye className="text-lg" />
                                )}
                              </button>
                            </div>
                          </FormControl>
                          {errors.password && (
                            <p className="text-red-400 text-sm mt-1 font-sans">
                              {errors.password}
                            </p>
                          )}
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-between items-center text-sm">
                      <label className="flex items-center gap-2 text-text-muted font-sans cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gold-deep/50 bg-bg-dark text-gold-royal focus:ring-gold-royal/50"
                        />
                        Remember me
                      </label>
                      <a
                        href="/reset_password"
                        className="text-gold-light hover:text-gold-shimmer transition-colors font-serif"
                      >
                        Forgot Password?
                      </a>
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      className="
                        w-full py-4 rounded-lg
                        bg-linear-to-r from-gold-main via-gold-royal to-gold-dark
                        hover:from-gold-shimmer hover:via-gold-main hover:to-gold-royal
                        text-bg-dark font-serif font-semibold text-lg
                        transition-all duration-300 transform hover:scale-[1.02]
                        shadow-lg hover:shadow-gold-royal/30
                        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                      "
                    >
                      {loading ? "Signing In..." : "Sign In"}
                    </Button>
                  </form>
                </Form>

                {/* Divider */}
                <div className="flex items-center gap-4 my-6">
                  <div className="flex-1 h-px bg-linear-to-r from-transparent via-gold-deep/50 to-transparent" />
                  <span className="text-text-muted text-sm font-serif">or continue with</span>
                  <div className="flex-1 h-px bg-linear-to-r from-transparent via-gold-deep/50 to-transparent" />
                </div>

                {/* Google Button */}
                <Button
                  onClick={handleGoogleLogin}
                  type="button"
                  className="
                    w-full py-4 rounded-lg
                    bg-white/95 hover:bg-white
                    text-bg-dark font-sans font-medium text-base
                    transition-all duration-300 transform hover:scale-[1.02]
                    shadow-lg hover:shadow-white/20
                    flex items-center justify-center gap-3
                  "
                >
                  <img
                    src="/Google-Logo.svg"
                    alt="Google"
                    className="w-5 h-5"
                  />
                  Continue with Google
                </Button>

                {/* Sign Up Link */}
                <p className="text-center mt-8 text-text-muted font-sans">
                  Don't have an account?{" "}
                  <a
                    href="/sign_up"
                    className="text-gold-light hover:text-gold-shimmer font-serif font-semibold transition-colors"
                  >
                    Sign Up
                  </a>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;