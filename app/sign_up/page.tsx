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
import { MdEmail, MdPerson } from "react-icons/md";
import { FaKey, FaEye, FaEyeSlash, FaCheck, FaXmark } from "react-icons/fa6";
import { toast } from "sonner";
import axios from "axios";
import axiosInstance from "@/config/apiConfig";
import { useGlobalStorage } from "@/hooks/GlobalStorage";

const SignUp = () => {
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setPendingSignup } = useGlobalStorage();
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
        setErrors((prev) => ({ ...prev, username: "Please enter your username." }));
        setLoading(false);
        return;
      }
      if (!/^[a-zA-Z0-9]+$/.test(values.username) || values.username.length < 3 || values.username.length > 50) {
        setErrors((prev) => ({
          ...prev,
          username:
            values.username.length < 3
              ? "Username must be at least 3 characters."
              : values.username.length > 50
                ? "Username must not exceed 50 characters."
                : "Username must contain only letters and numbers.",
        }));
        setLoading(false);
        return;
      }

      if (!values.email) {
        setErrors((prev) => ({ ...prev, email: "Please enter your email." }));
        setLoading(false);
        return;
      }
      const isValidEmailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email);
      if (!isValidEmailFormat) {
        setErrors((prev) => ({ ...prev, email: "Please enter a valid email address." }));
        setLoading(false);
        return;
      }

      if (!values.password) {
        setErrors((prev) => ({ ...prev, password: "Please enter your password." }));
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
          password: "Password does not meet all requirements.",
        }));
        setLoading(false);
        return;
      }

      if (!values.confirmPassword) {
        setErrors((prev) => ({ ...prev, confirmPassword: "Please confirm your password." }));
        setLoading(false);
        return;
      }
      if (values.password !== values.confirmPassword) {
        setErrors((prev) => ({ ...prev, confirmPassword: "Passwords do not match." }));
        setLoading(false);
        return;
      }

      try {
        // Send verification email
        await axiosInstance.post("/users/signup-verification", {
          email: values.email,
        });

        // Store pending signup data
        setPendingSignup({
          username: values.username,
          email: values.email,
          password: values.password,
        });

        toast.success("Verification code sent to your email!");
        router.push("/validate_email");
      } catch (error: unknown) {
        const message = axios.isAxiosError(error)
          ? error.response?.data?.message || "Failed to send verification code"
          : "Failed to send verification code";
        if (message.includes("username")) {
          setErrors((prev) => ({ ...prev, username: message }));
        } else if (message.includes("email") || message.includes("registered")) {
          setErrors((prev) => ({ ...prev, email: message }));
        } else {
          setErrors((prev) => ({ ...prev, email: message }));
        }
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [router, setPendingSignup]
  );

  const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <li className={`flex items-center gap-2 text-sm transition-colors duration-200 ${met ? "text-green-400" : "text-text-disabled"}`}>
      {met ? <FaCheck className="text-green-400 text-xs" /> : <FaXmark className="text-text-disabled text-xs" />}
      {text}
    </li>
  );

  return (
    <div className="min-h-screen bg-bg-app relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 -left-32 w-96 h-96 bg-gold-royal/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 -right-32 w-80 h-80 bg-gold-shimmer/8 rounded-full blur-[100px]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Logo Section */}
          <div className="flex justify-center mb-6 animate-fade-up">
            <div className="relative">
              <div className="absolute inset-0 bg-gold-royal/30 rounded-full blur-[60px]" />
              <div
                className="relative w-24 h-24 md:w-32 md:h-32 bg-contain bg-center bg-no-repeat animate-float"
                style={{ backgroundImage: "url('/FTC_Logo.png')" }}
              />
            </div>
          </div>

          {/* Form Card */}
          <div className="glass-gold rounded-2xl p-8 animate-fade-up stagger-1">
            <h1 className="font-display text-3xl md:text-4xl text-center gold-gradient-text mb-2">
              JOIN THE BATTLE
            </h1>
            <p className="font-serif text-sm text-text-muted text-center mb-6">
              Begin your journey to strategic greatness
            </p>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-serif text-sm text-gold-light uppercase tracking-wider">
                        Username
                      </FormLabel>
                      <FormControl>
                        <div className={`
                          flex items-center w-full 
                          bg-bg-dark/80 border rounded-lg 
                          transition-all duration-300
                          ${errors.username ? 'border-red-500' : 'border-gold-deep/30'}
                          focus-within:border-gold-royal focus-within:ring-1 focus-within:ring-gold-royal/50
                        `}>
                          <div className="flex items-center justify-center px-4 border-r border-gold-deep/20 min-h-[56px]">
                            <MdPerson className="text-gold-muted text-xl" />
                          </div>
                          <input
                            id="username-input"
                            placeholder="Choose your username"
                            {...field}
                            className="
                              flex-1 bg-transparent border-none outline-none
                              px-4 py-4
                              text-text-primary placeholder:text-text-muted
                              font-sans text-base w-full
                              rounded-r-lg
                            "
                            autoComplete="off"
                          />
                        </div>
                      </FormControl>
                      {errors.username && (
                        <p className="text-red-400 text-sm mt-1 font-sans">{errors.username}</p>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-serif text-sm text-gold-light uppercase tracking-wider">
                        Email
                      </FormLabel>
                      <FormControl>
                        <div className={`
                          flex items-center w-full 
                          bg-bg-dark/80 border rounded-lg 
                          transition-all duration-300
                          ${errors.email ? 'border-red-500' : 'border-gold-deep/30'}
                          focus-within:border-gold-royal focus-within:ring-1 focus-within:ring-gold-royal/50
                        `}>
                          <div className="flex items-center justify-center px-4 border-r border-gold-deep/20 min-h-[56px]">
                            <MdEmail className="text-gold-muted text-xl" />
                          </div>
                          <input
                            id="email-input"
                            placeholder="Enter your email address"
                            {...field}
                            className="
                              flex-1 bg-transparent border-none outline-none
                              px-4 py-4
                              text-text-primary placeholder:text-text-muted
                              font-sans text-base w-full
                              rounded-r-lg
                            "
                            autoComplete="off"
                          />
                        </div>
                      </FormControl>
                      {errors.email && (
                        <p className="text-red-400 text-sm mt-1 font-sans">{errors.email}</p>
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
                            placeholder="Create a strong password"
                            {...field}
                            className="
                              flex-1 bg-transparent border-none outline-none
                              px-4 py-4
                              text-text-primary placeholder:text-text-muted
                              font-sans text-base w-full
                            "
                            onChange={(e) => {
                              field.onChange(e);
                              setPassword(e.target.value);
                            }}
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
                      <ul className="mt-2 space-y-1 font-sans">
                        <PasswordRequirement met={isMinLength} text="At least 9 characters" />
                        <PasswordRequirement met={hasUppercase} text="One uppercase letter" />
                        <PasswordRequirement met={hasNumber} text="One number" />
                        <PasswordRequirement met={hasSpecialChar} text="One special character (!@#$%^&*)" />
                      </ul>
                      {errors.password && (
                        <p className="text-red-400 text-sm mt-1 font-sans">{errors.password}</p>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-serif text-sm text-gold-light uppercase tracking-wider">
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <div className={`
                          flex items-center w-full 
                          bg-bg-dark/80 border rounded-lg 
                          transition-all duration-300
                          ${errors.confirmPassword ? 'border-red-500' : 'border-gold-deep/30'}
                          focus-within:border-gold-royal focus-within:ring-1 focus-within:ring-gold-royal/50
                        `}>
                          <div className="flex items-center justify-center px-4 border-r border-gold-deep/20 min-h-[56px]">
                            <FaKey className="text-gold-muted text-lg transform -rotate-45" />
                          </div>
                          <input
                            id="confirm-password-input"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm your password"
                            {...field}
                            className="
                              flex-1 bg-transparent border-none outline-none
                              px-4 py-4
                              text-text-primary placeholder:text-text-muted
                              font-sans text-base w-full
                            "
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="px-4 text-gold-muted hover:text-gold-light transition-colors"
                          >
                            {showConfirmPassword ? (
                              <FaEyeSlash className="text-lg" />
                            ) : (
                              <FaEye className="text-lg" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      {errors.confirmPassword && (
                        <p className="text-red-400 text-sm mt-1 font-sans">{errors.confirmPassword}</p>
                      )}
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={loading}
                  className="
                    w-full py-4 mt-2 rounded-lg
                    bg-linear-to-r from-gold-main via-gold-royal to-gold-dark
                    hover:from-gold-shimmer hover:via-gold-main hover:to-gold-royal
                    text-bg-dark font-serif font-semibold text-lg
                    transition-all duration-300 transform hover:scale-[1.02]
                    shadow-lg hover:shadow-gold-royal/30
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                  "
                >
                  {loading ? "Sending Code..." : "Continue"}
                </Button>
              </form>
            </Form>

            {/* Sign In Link */}
            <p className="text-center mt-6 text-text-muted font-sans">
              Already have an account?{" "}
              <a
                href="/sign_in"
                className="text-gold-light hover:text-gold-shimmer font-serif font-semibold transition-colors"
              >
                Sign In
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;