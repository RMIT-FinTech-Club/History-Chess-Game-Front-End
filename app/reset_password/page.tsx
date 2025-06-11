"use client";
import React, { useState, useCallback, useRef } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { NewPassword } from "@/components/ui/NewPassword";
import { NewPasswordConfirm } from "@/components/ui/NewPasswordConfirm";
import { useGlobalStorage } from "@/components/GlobalStorage";
import { MdEmail } from "react-icons/md";
import axios from "axios";

const emailSchema = z.object({
  email: z.string().email("Please enter a valid Gmail address").refine((email) => email.endsWith("@gmail.com"), {
    message: "Email must be a Gmail address",
  }),
});

const codeSchema = z.object({
  resetCode: z.string().length(6, "Verification code must be 6 digits").regex(/^\d{6}$/, "Verification code must be numeric"),
});

const passwordSchema = z
  .object({
    newPassword: z
      .string()
      .min(9, "Password must be at least 9 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[!@#$%^&*]/, "Password must contain at least one special character (!@#$%^&*)"),
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
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: "", resetCode: "", newPassword: "", confirmPassword: "" });
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { setAuthData } = useGlobalStorage();

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

  const onEmailSubmit = useCallback(
    async (data: EmailFormValues) => {
      setErrors({ email: "", resetCode: "", newPassword: "", confirmPassword: "" });
      setLoading(true);
      try {
        // Check if email is associated with Google login
        try {
          const authTypeResponse = await axios.post("http://localhost:8080/users/check-auth-type", {
            email: data.email,
          });
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

        const response = await axios.post("http://localhost:8080/users/request-reset", {
          email: data.email,
        });
        console.log("Request reset response:", response.data);
        setEmail(data.email);
        setStep("code");
        toast.success("Verification code sent to your email");
      } catch (err: any) {
        const message = err.response?.data?.message || "Failed to send verification code";
        console.error("Request reset error:", err.response?.data);
        setErrors((prev) => ({ ...prev, email: message }));
        document.getElementById("email-input")?.classList.add("border-red-500", "border-[0.3vh]");
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const onCodeSubmit = useCallback(
    async (data: CodeFormValues) => {
      setErrors({ email: "", resetCode: "", newPassword: "", confirmPassword: "" });
      setLoading(true);
      try {
        await axios.post("http://localhost:8080/users/verify-reset-code", {
          email,
          resetCode: data.resetCode,
        });
        setStep("password");
        toast.success("Code verified, please set your new password");
      } catch (err: any) {
        const message = err.response?.data?.message || "Invalid verification code";
        console.error("Code verification error:", err.response?.data);
        setErrors((prev) => ({ ...prev, resetCode: message }));
        inputRefs.current.forEach((input) => input?.classList.add("border-red-500", "border-[0.3vh]"));
        toast.error(message);
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
        const response = await axios.post("http://localhost:8080/users/reset-password", {
          email,
          resetCode: codeForm.getValues("resetCode"),
          newPassword: data.newPassword,
        });
        console.log("Reset password response:", response.data);
        setAuthData({
          userId: response.data.user.id,
          userName: response.data.user.username,
          email: response.data.user.email,
          accessToken: response.data.token,
          refreshToken: null,
        });
        console.log("Stored accessToken:", useGlobalStorage.getState().accessToken);
        toast.success("Password reset successfully");
        router.push("/profile");
      } catch (err: any) {
        const message = err.response?.data?.message || "Failed to reset password";
        console.error("Reset password error:", err.response?.data);
        setErrors((prev) => ({ ...prev, newPassword: message }));
        document.getElementById("newPassword-input")?.classList.add("border-red-500", "border-[0.3vh]");
        document.getElementById("confirmPassword-input")?.classList.add("border-red-500", "border-[0.3vh]");
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [router, email, codeForm, setAuthData]
  );

  const handleOtpChange = (index: number, value: string) => {
    const newOtp = [...otp];
    newOtp[index] = value.replace(/\D/g, '').slice(0, 1); // Allow only digits, max 1 char
    setOtp(newOtp);
    codeForm.setValue("resetCode", newOtp.join(""));

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, '').slice(0, 6); // Sanitize to digits
    const newOtp = pastedData.split("").concat(new Array(6).fill("")).slice(0, 6);
    setOtp(newOtp);
    codeForm.setValue("resetCode", newOtp.join(""));
    inputRefs.current[5]?.focus(); // Focus last input
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
        <h2 className="text-center text-[7vh]">
          {step === "email" ? "Reset Password" : step === "code" ? "Enter Code" : step === "password" ? "Set New Password" : "Google Account"}
        </h2>
        {step === "email" && (
          <Form {...emailForm}>
            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-3 w-[80vw] md:w-[42vw]">
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-[3vh]">Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <MdEmail
                          className="absolute text-black cursor-pointer top-[1.55vh] left-[1.45vw] sm:left-[1.2vw] md:left-[1vw] lg:left-[0.95vw] text-[5vh]"
                          onClick={() => document.getElementById("email-input")?.focus()}
                        />
                        <Input
                          id="email-input"
                          placeholder="Enter your Gmail address"
                          {...field}
                          className="
                            pl-[7.5vw] sm:pl-[5.85vw] md:pl-[4.5vw] lg:pl-[3.75vw]
                            py-[4vh] w-full
                            bg-[#C4C4C4] border-[#DCB968] focus:border-[0.35vh] text-[#2F2F2F]
                            !text-[3vh] font-normal rounded-[1.5vh]
                          "
                          autoComplete="off"
                        />
                      </div>
                    </FormControl>
                    {errors.email && (
                      <p className="text-red-500 text-[2.5vh] font-bold">{errors.email}</p>
                    )}
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#000000] hover:shadow-2xl hover:shadow-amber-400 cursor-pointer text-[#FFFFFF] font-bold text-[3.5vh] py-[4vh] mt-[1.75vh] mb-[1.75vh] rounded-[1.5vh]"
              >
                {loading ? "Sending..." : "Send Verification Code"}
              </Button>
            </form>
          </Form>
        )}
        {step === "code" && (
          <Form {...codeForm}>
            <form onSubmit={codeForm.handleSubmit(onCodeSubmit)} className="space-y-3 w-[80vw] md:w-[42vw]">
              <FormField
                control={codeForm.control}
                name="resetCode"
                render={() => (
                  <FormItem>
                    <FormLabel className="font-bold text-[3vh]">Verification Code</FormLabel>
                    <FormControl>
                      <div className="flex justify-between gap-[1vw]">
                        {otp.map((digit, index) => (
                          <Input
                            key={index}
                            id={`otp-input-${index}`}
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            onPaste={index === 0 ? handleOtpPaste : undefined}
                            maxLength={1}
                            className="
                              w-[12vw] md:w-[6vw] aspect-[1/1]
                              text-center bg-[#C4C4C4] border-[#DCB968] focus:border-[0.35vh] text-[#2F2F2F]
                              !text-[3vh] font-normal rounded-[1.5vh]
                            "
                            ref={(el) => { inputRefs.current[index] = el; }}
                          />
                        ))}
                      </div>
                    </FormControl>
                    {errors.resetCode && (
                      <p className="text-red-500 text-[2.5vh] font-bold">{errors.resetCode}</p>
                    )}
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#000000] hover:shadow-2xl hover:shadow-amber-400 cursor-pointer text-[#FFFFFF] font-bold text-[3.5vh] py-[4vh] mt-[1.75vh] mb-[1.75vh] rounded-[1.5vh]"
              >
                {loading ? "Verifying..." : "Verify Code"}
              </Button>
            </form>
          </Form>
        )}
        {step === "password" && (
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-3 w-[80vw] md:w-[42vw]">
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-[3vh]">New Password</FormLabel>
                    <FormControl>
                      <NewPassword
                        id="newPassword-input"
                        placeholder="Enter new password"
                        {...field}
                        className="
                          pl-[7.5vw] sm:pl-[5.85vw] md:pl-[4.5vw] lg:pl-[3.75vw]
                          py-[4vh] w-full
                          bg-[#C4C4C4] border-[#DCB968] focus:border-[0.35vh] text-[#2F2F2F]
                          !text-[3vh] font-normal rounded-[1.5vh]
                        "
                      />
                    </FormControl>
                    {errors.newPassword && (
                      <p className="text-red-500 text-[2.5vh] font-bold">{errors.newPassword}</p>
                    )}
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-[3vh]">Confirm New Password</FormLabel>
                    <FormControl>
                      <NewPasswordConfirm
                        id="confirmPassword-input"
                        placeholder="Confirm new password"
                        {...field}
                        className="
                          pl-[7.5vw] sm:pl-[5.85vw] md:pl-[4.5vw] lg:pl-[3.75vw]
                          py-[4vh] w-full
                          bg-[#C4C4C4] border-[#DCB968] focus:border-[0.35vh] text-[#2F2F2F]
                          !text-[3vh] font-normal rounded-[1.5vh]
                        "
                      />
                    </FormControl>
                    {errors.confirmPassword && (
                      <p className="text-red-500 text-[2.5vh] font-bold">{errors.confirmPassword}</p>
                    )}
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#000000] hover:shadow-2xl hover:shadow-amber-400 cursor-pointer text-[#FFFFFF] font-bold text-[3.5vh] py-[4vh] mt-[1.75vh] mb-[1.75vh] rounded-[1.5vh]"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          </Form>
        )}
        {step === "google" && (
          <div className="space-y-3 w-[80vw] md:w-[42vw]">
            <p className="text-[2.5vh] text-[#C4C4C4] font-normal bg-[#2F2F2F] p-[2vh] rounded-[1.5vh]">
              This account uses Google login. To reset your password, use Google’s account recovery process at{" "}
              <a
                href="https://myaccount.google.com/security"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#184BF2] underline"
              >
                myaccount.google.com/security
              </a>.
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