"use client";
import React, { useState, useCallback, useRef, useEffect } from "react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { NewPassword } from "@/components/ui/NewPassword";
import { NewPasswordConfirm } from "@/components/ui/NewPasswordConfirm";
import { useGlobalStorage } from "@/components/GlobalStorage";
import { MdEmail } from "react-icons/md";
import axios from "axios";
import styles from "@/css/otp.module.css";

const emailSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid Gmail address")
    .refine((email) => email.endsWith("@gmail.com"), {
      message: "Email must be a Gmail address",
    }),
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
  const [step, setStep] = useState<"email" | "code" | "password" | "google">(
    "email"
  );
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    resetCode: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [timer, setTimer] = useState(60);
  const { setAuthData } = useGlobalStorage();

  // Countdown timer, decrease by 1 every second
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
    setErrors({
      email: "",
      resetCode: "",
      newPassword: "",
      confirmPassword: "",
    });
    setLoading(true);
    try {
      // Check if email is associated with Google login
      try {
        const authTypeResponse = await axios.post(
          "http://localhost:8080/users/check-auth-type",
          {
            email: data.email,
          }
        );
        if (authTypeResponse.data.googleAuth) {
          setEmail(data.email);
          setStep("google");
          return;
        }
      } catch (err: any) {
        // If email not found, proceed to request-reset
        if (!err.response?.data?.message?.includes("Email not found")) {
          throw err;
        }
      }

      const response = await axios.post(
        "http://localhost:8080/users/request-reset",
        {
          email: data.email,
        }
      );
      console.log("Request reset response:", response.data);
      setEmail(data.email);
      setStep("code");
      toast.success("Verification code sent to your email");
    } catch (err: any) {
      const message =
        err.response?.data?.message || "Failed to send verification code";
      console.error("Request reset error:", err.response?.data);
      setErrors((prev) => ({ ...prev, email: message }));
      document
        .getElementById("email-input")
        ?.classList.add("border-red-500", "border-[0.3vh]");
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const onCodeSubmit = useCallback(
    async (data: CodeFormValues) => {
      setErrors({
        email: "",
        resetCode: "",
        newPassword: "",
        confirmPassword: "",
      });
      setLoading(true);
      try {
        await axios.post("http://localhost:8080/users/verify-reset-code", {
          email,
          resetCode: data.resetCode,
        });
        setStep("password");
        toast.success("Code verified, please set your new password");
      } catch (err: any) {
        const message =
          err.response?.data?.message || "Invalid verification code";
        console.error("Code verification error:", err.response?.data);
        setErrors((prev) => ({ ...prev, resetCode: message }));
        inputRefs.current.forEach((input) =>
          input?.classList.add("border-red-500", "border-[0.3vh]")
        );
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [email]
  );

  const onPasswordSubmit = useCallback(
    async (data: PasswordFormValues) => {
      setErrors({
        email: "",
        resetCode: "",
        newPassword: "",
        confirmPassword: "",
      });
      setLoading(true);
      try {
        const response = await axios.post(
          "http://localhost:8080/users/reset-password",
          {
            email,
            resetCode: codeForm.getValues("resetCode"),
            newPassword: data.newPassword,
          }
        );
        console.log("Reset password response:", response.data);
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
        toast.success("Password reset successfully");
        router.push("/profile");
      } catch (err: any) {
        const message =
          err.response?.data?.message || "Failed to reset password";
        console.error("Reset password error:", err.response?.data);
        setErrors((prev) => ({ ...prev, newPassword: message }));
        document
          .getElementById("newPassword-input")
          ?.classList.add("border-red-500", "border-[0.3vh]");
        document
          .getElementById("confirmPassword-input")
          ?.classList.add("border-red-500", "border-[0.3vh]");
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [router, email, codeForm, setAuthData]
  );

  // Auto-focus the first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Handle single digit input change
  const handleChange = (value: string, index: number) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input if value is entered
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // If all digits are filled, auto-submit
    if (newOtp.every((digit) => digit !== "")) {
      onCodeSubmit({ resetCode: newOtp.join("") });
    }
  };

  // Handle backspace, arrow key navigation
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
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
    }
  };

  // Handle paste (e.g. "123456")
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (pasteData.length === 0) return;

    const newOtp = [...otp];
    for (let i = 0; i < pasteData.length; i++) {
      newOtp[i] = pasteData[i];
    }

    setOtp(newOtp);
    const nextIndex = pasteData.length >= 6 ? 5 : pasteData.length;
    inputRefs.current[nextIndex]?.focus();

    if (pasteData.length === 6) {
      onCodeSubmit({ resetCode: pasteData });
    }
  };

  // Format timer display (e.g. "0:45")
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col justify-center items-center h-[100dvh]">
      {/* Logo section with background blur */}
      <div className="flex justify-center items-center relative h-[30vh] aspect-square">
        <div
          className="w-full h-full bg-[#DCB410] rounded-full absolute left-0 top-0"
          style={{ filter: "blur(15vh)" }}
        ></div>
        <div
          className={`z-10 bg-contain bg-no-repeat bg-center h-[40vh] aspect-square ${styles.logo}`}
        ></div>
      </div>

      {/* Main content */}
      <div>
        <h2 className="text-center text-[5vh] text-[#FFFFFF] mt-[4vh] font-bold">
          {step === "email"
            ? "Reset Password"
            : step === "code"
            ? ""
            : step === "password"
            ? "Reset Password"
            : "Google Account"}
        </h2>
        {step === "email" && (
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)}>
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative my-[4vh]">
                        <MdEmail
                          className="absolute text-black cursor-pointer top-[1.55vh] left-[1.45vw] sm:left-[1.2vw] md:left-[1vw] lg:left-[0.95vw] text-[5vh]"
                          onClick={() =>
                            document.getElementById("email-input")?.focus()
                          }
                        />
                        <Input
                          id="email-input"
                          placeholder="Enter your Gmail address"
                          autoFocus
                          {...field}
                          className="
                            pl-[7.5vw] md:pl-[4vw]
                            py-[4vh] w-[40vw]
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

              <div className="flex flex-col items-center justify-center">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-[#DBB968] w-[20vw] hover:shadow-2xl hover:shadow-amber-400 cursor-pointer text-[#000000] font-semibold text-[3vh] px-[2vw] py-[4vh] rounded-[1.5vh]"
                >
                  {loading ? "Sending..." : "Send Verification Code"}
                </Button>
              </div>
            </form>
          </Form>
        )}
        {step === "code" && (
          <Form {...codeForm}>
            <form onSubmit={codeForm.handleSubmit(onCodeSubmit)}>
              <FormField
                control={codeForm.control}
                name="resetCode"
                render={() => (
                  <FormItem>
                    <FormControl>
                      <div className="flex justify-center">
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
                        w-[12vw] md:w-[14vh] aspect-square text-center rounded-[5px] text-white text-[6vw] md:text-[6vh]
                        mt-[5vh]
                        border-[0.2vw] border-[#27272A] bg-[#000] focus:border-yellow-400 outline-none
                      `}
                            value={digit}
                            onPaste={handlePaste}
                            onChange={(e) =>
                              handleChange(e.target.value, index)
                            }
                            onKeyDown={(e) => handleKeyDown(e, index)}
                          />
                        ))}
                      </div>
                    </FormControl>
                    {/* Timer and instructions */}
                    <p className="text-white text-[2.5vw] text-center md:text-[1.5vw] mt-[5vh]">
                      Enter the OTP sent via email. (Expired in{" "}
                      <span className="text-[#E9B654]">
                        {formatTime(timer)}
                      </span>
                      )
                    </p>

                    {/* {errors.resetCode &&
                      toast.error(errors.resetCode)
                    } */}
                  </FormItem>
                )}
              />
              <div className="flex flex-col items-center justify-center gap-[4vh] mt-[4vh] md:min-w-[30vw]">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-[20vw] bg-[#DBB968] hover:shadow-2xl hover:shadow-amber-400 cursor-pointer text-[#000000] font-semibold text-[3vh] px-[2vw] py-[4vh] rounded-[1.5vh]"
                >
                  {loading ? "Submitting..." : "Submit"}
                </Button>
                <Button
                  onClick={() => {
                    console.log("OTP resent");
                    setOtp(Array(6).fill(""));
                    setTimer(60);
                    inputRefs.current[0]?.focus();
                  }}
                  className="w-[20vw] border border-[#DBB968] hover:shadow-2xl hover:shadow-amber-400 cursor-pointer text-[#EBEBEB] font-semibold text-[3vh] px-[2vw] py-[4vh] rounded-[1.5vh]"
                >
                  Resend OTP
                </Button>
              </div>
            </form>
          </Form>
        )}
        {step === "password" && (
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-[3vh] text-[#FFFFFF] mt-[4vh]">
                      New Password
                    </FormLabel>
                    <FormControl>
                      <NewPassword
                        id="newPassword-input"
                        placeholder="Enter new password"
                        {...field}
                        autoFocus
                        className="
                            pl-[7vw] md:pl-[3vw]
                            py-[4vh] w-[40vw]
                            bg-[#C4C4C4] border-[#DCB968] focus:border-[0.35vh] text-[#2F2F2F]
                            !text-[3vh] font-normal rounded-[1.5vh]
                          "
                      />
                    </FormControl>
                    {errors.newPassword && (
                      <p className="text-red-500 text-[2.5vh] font-bold">
                        {errors.newPassword}
                      </p>
                    )}
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium text-[3vh] text-[#FFFFFF] mt-[4vh]">
                      Confirm New Password
                    </FormLabel>
                    <FormControl>
                      <NewPasswordConfirm
                        id="confirmPassword-input"
                        placeholder="Confirm new password"
                        {...field}
                        className="
                            pl-[7vw] md:pl-[3vw]
                            py-[4vh] w-[40vw]
                            bg-[#C4C4C4] border-[#DCB968] focus:border-[0.35vh] text-[#2F2F2F]
                            !text-[3vh] font-normal rounded-[1.5vh]
                          "
                      />
                    </FormControl>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-[2.5vh] font-bold">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </FormItem>
                )}
              />
              <div className="flex flex-col items-center justify-center mt-[4vh]">
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-[20vw] bg-[#DBB968] hover:shadow-2xl hover:shadow-amber-400 cursor-pointer text-[#000000] font-semibold text-[3vh] px-[2vw] py-[4vh] rounded-[1.5vh]"
                >
                  {loading ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </form>
          </Form>
        )}
        {step === "google" && (
          <div>
            <p className="text-[2.5vh] text-[#C4C4C4] font-normal bg-[#2F2F2F] p-[2vh] rounded-[1.5vh]">
              This account uses Google login. To reset your password, use
              Google’s account recovery process at{" "}
              <a
                href="https://myaccount.google.com/security"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#184BF2] underline"
              >
                myaccount.google.com/security
              </a>
              .
            </p>
            <Button
              onClick={() => router.push("/sign_in")}
              className="w-full bg-[#000000] hover:shadow-2xl hover:shadow-amber-400 cursor-pointer text-[#FFFFFF] font-bold text-[3.5vh] py-[4vh] mt-[1.75vh] mb-[1.75vh] rounded-[1.5vh]"
            >
              Back to Sign In
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
