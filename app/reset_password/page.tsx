"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useGlobalStorage } from "@/hooks/GlobalStorage";
import { MdEmail } from "react-icons/md";
import { FaCheck, FaXmark, FaKey, FaEye, FaEyeSlash } from "react-icons/fa6";
import axiosInstance from "@/config/apiConfig";
import axios from "axios";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const codeSchema = z.object({
  resetCode: z
    .string()
    .length(6, "Verification code must be 6 digits")
    .regex(/^\d{6}$/, "Verification code must be numeric"),
});

const passwordSchema = z
  .object({
    newPassword: z
      .string()
      .min(9, "Password must be at least 9 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[!@#$%^&*]/,
        "Password must contain at least one special character (!@#$%^&*)"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type EmailFormValues = z.infer<typeof emailSchema>;
type CodeFormValues = z.infer<typeof codeSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

const ResetPassword = () => {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "code" | "password" | "google">("email");
  const [email, setEmail] = useState("");
  const [verifiedResetCode, setVerifiedResetCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    resetCode: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [timer, setTimer] = useState(60);
  const [password, setPassword] = useState("");
  const { setAuthData } = useGlobalStorage();

  // Password requirements
  const isMinLength = password.length >= 9;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*]/.test(password);

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const codeForm = useForm<CodeFormValues>({
    resolver: zodResolver(codeSchema),
    defaultValues: { resetCode: "" },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const onEmailSubmit = useCallback(async (data: EmailFormValues) => {
    setErrors({ email: "", resetCode: "", newPassword: "", confirmPassword: "" });
    setLoading(true);
    try {
      const authTypeResponse = await axiosInstance.post("/users/check-auth-type", { email: data.email });
      if (authTypeResponse.data.googleAuth) {
        setEmail(data.email);
        setStep("google");
        return;
      }
      await axiosInstance.post("/users/request-reset", { email: data.email });
      setEmail(data.email);
      setStep("code");
      setTimer(60);
      toast.success("Verification code sent to your email");
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || "Failed to send verification code"
        : "Network error";
      setErrors((prev) => ({ ...prev, email: message }));
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const onCodeSubmit = useCallback(
    async (data: CodeFormValues) => {
      setErrors({ email: "", resetCode: "", newPassword: "", confirmPassword: "" });
      setLoading(true);
      try {
        await axiosInstance.post("/users/verify-reset-code", {
          email,
          resetCode: data.resetCode,
        });
        setVerifiedResetCode(data.resetCode);
        setStep("password");
        toast.success("Code verified! Please set your new password.");
      } catch (err: unknown) {
        const message = axios.isAxiosError(err)
          ? err.response?.data?.message || "Invalid or expired verification code"
          : "Network error";
        setErrors((prev) => ({ ...prev, resetCode: message }));
        toast.error(message);
        setOtp(new Array(6).fill(""));
        inputRefs.current[0]?.focus();
      } finally {
        setLoading(false);
      }
    },
    [email]
  );

  const onPasswordSubmit = useCallback(
    async (data: PasswordFormValues) => {
      setErrors({ email: "", resetCode: "", newPassword: "", confirmPassword: "" });
      setLoading(true);
      try {
        const resetResponse = await axiosInstance.post("/users/reset-password", {
          email,
          resetCode: verifiedResetCode,
          newPassword: data.newPassword,
        });
        const { token, id, username, email: userEmail, avatarUrl, role } = resetResponse.data;

        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
          throw new Error("Invalid user ID in response");
        }

        setAuthData({
          userId: id,
          userName: username,
          email: userEmail,
          accessToken: token,
          refreshToken: null,
          avatar: avatarUrl || null,
          role,
        });
        toast.success("Password reset successfully!");
        router.push("/home");
      } catch (err: unknown) {
        const message = axios.isAxiosError(err)
          ? err.response?.data?.message || "Failed to reset password"
          : "Network error";
        setErrors((prev) => ({ ...prev, newPassword: message }));
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [router, email, verifiedResetCode, setAuthData]
  );

  useEffect(() => {
    if (step === "code") {
      inputRefs.current[0]?.focus();
    }
  }, [step]);

  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.replace(/\D/g, "").slice(0, 1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    if (!resending && newOtp.every((digit) => digit !== "")) {
      onCodeSubmit({ resetCode: newOtp.join("") });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    const key = e.key;

    if (key === "Backspace") {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    } else if (key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else if (key === "Enter" && !resending && otp.every((digit) => digit !== "")) {
      e.preventDefault();
      onCodeSubmit({ resetCode: otp.join("") });
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = pastedData.split("").concat(new Array(6).fill("")).slice(0, 6);
    setOtp(newOtp);
    const nextIndex = pastedData.length >= 6 ? 5 : pastedData.length;
    inputRefs.current[nextIndex]?.focus();

    if (!resending && pastedData.length === 6) {
      onCodeSubmit({ resetCode: pastedData });
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleResendOtp = async () => {
    setResending(true);
    setLoading(true);
    setErrors({ email: "", resetCode: "", newPassword: "", confirmPassword: "" });
    try {
      await axiosInstance.post("/users/request-reset", { email });
      setOtp(Array(6).fill(""));
      setTimer(60);
      inputRefs.current[0]?.focus();
      toast.success("New verification code sent to your email");
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message || "Failed to resend verification code"
        : "Network error";
      setErrors((prev) => ({ ...prev, resetCode: message }));
      toast.error(message);
    } finally {
      setLoading(false);
      setResending(false);
    }
  };

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
            {step === "email" && (
              <>
                <h1 className="font-display text-3xl md:text-4xl text-center gold-gradient-text mb-2">
                  RESET PASSWORD
                </h1>
                <p className="font-serif text-sm text-text-muted text-center mb-8">
                  Enter your email to receive a verification code
                </p>

                <Form {...emailForm}>
                  <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-6">
                    <FormField
                      control={emailForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-serif text-sm text-gold-light uppercase tracking-wider">
                            Email Address
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
                                autoFocus
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
                      {loading ? "Sending..." : "Send Verification Code"}
                    </Button>
                  </form>
                </Form>

                <p className="text-center mt-6 text-text-muted font-sans">
                  Remember your password?{" "}
                  <a href="/sign_in" className="text-gold-light hover:text-gold-shimmer font-serif font-semibold transition-colors">
                    Sign In
                  </a>
                </p>
              </>
            )}

            {step === "code" && (
              <>
                <h1 className="font-display text-3xl md:text-4xl text-center gold-gradient-text mb-2">
                  VERIFY CODE
                </h1>
                <p className="font-serif text-sm text-text-muted text-center mb-2">
                  Enter the 6-digit code sent to
                </p>
                <p className="font-sans text-gold-light text-center mb-8">{email}</p>

                <Form {...codeForm}>
                  <form onSubmit={codeForm.handleSubmit(onCodeSubmit)} className="space-y-6">
                    <FormField
                      control={codeForm.control}
                      name="resetCode"
                      render={() => (
                        <FormItem>
                          <FormControl>
                            <div className="flex justify-center gap-2 md:gap-3">
                              {otp.map((digit, index) => (
                                <input
                                  key={index}
                                  ref={(el) => {
                                    inputRefs.current[index] = el;
                                  }}
                                  type="text"
                                  inputMode="numeric"
                                  maxLength={1}
                                  autoFocus={index === 0}
                                  className={`
                                    w-12 h-14 md:w-14 md:h-16 text-center rounded-lg
                                    text-text-primary text-2xl md:text-3xl font-display
                                    bg-bg-dark/80 border-2
                                    ${errors.resetCode ? 'border-red-500' : 'border-gold-deep/30'}
                                    focus:border-gold-royal focus:ring-2 focus:ring-gold-royal/30
                                    outline-none transition-all duration-300
                                  `}
                                  value={digit}
                                  onPaste={handlePaste}
                                  onChange={(e) => handleChange(e.target.value, index)}
                                  onKeyDown={(e) => handleKeyDown(e, index)}
                                />
                              ))}
                            </div>
                          </FormControl>
                          {errors.resetCode && (
                            <p className="text-red-400 text-sm text-center mt-2 font-sans">{errors.resetCode}</p>
                          )}
                          <p className="text-text-muted text-sm text-center mt-4 font-sans">
                            Code expires in{" "}
                            <span className="text-gold-shimmer font-semibold">{formatTime(timer)}</span>
                          </p>
                        </FormItem>
                      )}
                    />
                    <div className="flex flex-col gap-4">
                      <Button
                        type="submit"
                        disabled={loading || resending}
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
                        {loading ? "Verifying..." : "Verify Code"}
                      </Button>
                      <Button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={loading || resending || timer > 0}
                        className="
                          w-full py-4 rounded-lg
                          bg-transparent border border-gold-deep/50
                          hover:bg-gold-deep/10 hover:border-gold-royal
                          text-gold-light font-serif font-medium text-base
                          transition-all duration-300
                          disabled:opacity-50 disabled:cursor-not-allowed
                        "
                      >
                        {resending ? "Sending..." : timer > 0 ? `Resend in ${formatTime(timer)}` : "Resend Code"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </>
            )}

            {step === "password" && (
              <>
                <h1 className="font-display text-3xl md:text-4xl text-center gold-gradient-text mb-2">
                  NEW PASSWORD
                </h1>
                <p className="font-serif text-sm text-text-muted text-center mb-8">
                  Create a strong password for your account
                </p>

                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-5">
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-serif text-sm text-gold-light uppercase tracking-wider">
                            New Password
                          </FormLabel>
                          <FormControl>
                            <div className={`
                              flex items-center w-full 
                              bg-bg-dark/80 border rounded-lg 
                              transition-all duration-300
                              ${errors.newPassword ? 'border-red-500' : 'border-gold-deep/30'}
                              focus-within:border-gold-royal focus-within:ring-1 focus-within:ring-gold-royal/50
                            `}>
                              <div className="flex items-center justify-center px-4 border-r border-gold-deep/20 min-h-[56px]">
                                <FaKey className="text-gold-muted text-lg transform -rotate-45" />
                              </div>
                              <input
                                id="newPassword-input"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter new password"
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
                                autoFocus
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
                          {errors.newPassword && (
                            <p className="text-red-400 text-sm mt-1 font-sans">{errors.newPassword}</p>
                          )}
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
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
                                id="confirmPassword-input"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm new password"
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
                        w-full py-4 rounded-lg
                        bg-linear-to-r from-gold-main via-gold-royal to-gold-dark
                        hover:from-gold-shimmer hover:via-gold-main hover:to-gold-royal
                        text-bg-dark font-serif font-semibold text-lg
                        transition-all duration-300 transform hover:scale-[1.02]
                        shadow-lg hover:shadow-gold-royal/30
                        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                      "
                    >
                      {loading ? "Resetting..." : "Reset Password"}
                    </Button>
                  </form>
                </Form>
              </>
            )}

            {step === "google" && (
              <>
                <h1 className="font-display text-3xl md:text-4xl text-center gold-gradient-text mb-2">
                  GOOGLE ACCOUNT
                </h1>
                <p className="font-serif text-sm text-text-muted text-center mb-8">
                  This account uses Google authentication
                </p>

                <div className="bg-bg-dark/60 rounded-lg p-6 mb-6">
                  <p className="text-text-secondary text-center font-sans text-sm leading-relaxed">
                    To reset your password, please use Google&apos;s account recovery at{" "}
                    <a
                      href="https://myaccount.google.com/security"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gold-light hover:text-gold-shimmer underline transition-colors"
                    >
                      myaccount.google.com/security
                    </a>
                  </p>
                </div>

                <Button
                  onClick={() => router.push("/sign_in")}
                  className="
                    w-full py-4 rounded-lg
                    bg-transparent border border-gold-deep/50
                    hover:bg-gold-deep/10 hover:border-gold-royal
                    text-gold-light font-serif font-medium text-base
                    transition-all duration-300
                  "
                >
                  Back to Sign In
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;