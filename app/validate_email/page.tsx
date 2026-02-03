"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import axios from "axios";
import axiosInstance from "@/config/apiConfig";
import { useGlobalStorage } from "@/hooks/GlobalStorage";

const ValidateEmail = () => {
    const router = useRouter();
    const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [timer, setTimer] = useState(60);
    const [error, setError] = useState("");
    const { pendingSignup, clearPendingSignup, setAuthData } = useGlobalStorage();

    // Redirect if no pending signup
    useEffect(() => {
        if (!pendingSignup) {
            router.push("/sign_up");
        }
    }, [pendingSignup, router]);

    // Countdown timer
    useEffect(() => {
        if (timer <= 0) return;
        const interval = setInterval(() => {
            setTimer((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(interval);
    }, [timer]);

    // Focus first input
    useEffect(() => {
        inputRefs.current[0]?.focus();
    }, []);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    const handleVerify = useCallback(
        async (code: string) => {
            if (!pendingSignup) {
                toast.error("No pending signup found. Please start over.");
                router.push("/sign_up");
                return;
            }

            setLoading(true);
            setError("");

            try {
                // Create user with verification code
                const response = await axiosInstance.post("/users", {
                    username: pendingSignup.username,
                    email: pendingSignup.email,
                    password: pendingSignup.password,
                    verificationCode: code,
                });

                const { token, id, username, email, avatarUrl, role } = response.data;

                const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
                if (!uuidRegex.test(id)) {
                    throw new Error("Invalid user ID in response");
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

                clearPendingSignup();
                toast.success("Account created successfully! Welcome aboard!");
                router.push("/home");
            } catch (err: unknown) {
                const message = axios.isAxiosError(err)
                    ? err.response?.data?.message || "Verification failed"
                    : "Verification failed";
                setError(message);
                toast.error(message);
                // Clear OTP on error
                setOtp(new Array(6).fill(""));
                inputRefs.current[0]?.focus();
            } finally {
                setLoading(false);
            }
        },
        [pendingSignup, router, setAuthData, clearPendingSignup]
    );

    const handleChange = (value: string, index: number) => {
        if (!/^\d?$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.replace(/\D/g, "").slice(0, 1);
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        if (!resending && newOtp.every((digit) => digit !== "")) {
            handleVerify(newOtp.join(""));
        }
    };

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
        } else if (key === "Enter" && !resending && otp.every((digit) => digit !== "")) {
            e.preventDefault();
            handleVerify(otp.join(""));
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
            handleVerify(pastedData);
        }
    };

    const handleResendOtp = async () => {
        if (!pendingSignup) return;

        setResending(true);
        setLoading(true);
        setError("");

        try {
            await axiosInstance.post("/users/signup-verification", {
                email: pendingSignup.email,
            });
            setOtp(Array(6).fill(""));
            setTimer(60);
            inputRefs.current[0]?.focus();
            toast.success("New verification code sent to your email");
        } catch (err: unknown) {
            const message = axios.isAxiosError(err)
                ? err.response?.data?.message || "Failed to resend code"
                : "Failed to resend code";
            setError(message);
            toast.error(message);
        } finally {
            setLoading(false);
            setResending(false);
        }
    };

    if (!pendingSignup) {
        return null;
    }

    return (
        <div className="min-h-screen bg-bg-app relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-gold-royal/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-gold-shimmer/8 rounded-full blur-[100px]" />
            </div>

            {/* Main Content */}
            <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-lg">
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

                    {/* Verification Card */}
                    <div className="glass-gold rounded-2xl p-8 animate-fade-up stagger-1">
                        <h1 className="font-display text-3xl md:text-4xl text-center gold-gradient-text mb-2">
                            VERIFY EMAIL
                        </h1>
                        <p className="font-serif text-sm text-text-muted text-center mb-2">
                            Enter the 6-digit code sent to
                        </p>
                        <p className="font-sans text-gold-light text-center mb-8">
                            {pendingSignup.email}
                        </p>

                        {/* OTP Input */}
                        <div className="flex justify-center gap-2 md:gap-3 mb-6">
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
                    ${error ? 'border-red-500' : 'border-gold-deep/30'}
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

                        {error && (
                            <p className="text-red-400 text-sm text-center mb-4 font-sans">
                                {error}
                            </p>
                        )}

                        <p className="text-text-muted text-sm text-center mb-6 font-sans">
                            Code expires in{" "}
                            <span className="text-gold-shimmer font-semibold">
                                {formatTime(timer)}
                            </span>
                        </p>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-4">
                            <Button
                                onClick={() => handleVerify(otp.join(""))}
                                disabled={loading || otp.some((d) => d === "")}
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
                                {loading ? "Verifying..." : "Verify & Create Account"}
                            </Button>

                            <Button
                                onClick={handleResendOtp}
                                disabled={loading || resending || timer > 0}
                                type="button"
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

                        {/* Back Link */}
                        <p className="text-center mt-6 text-text-muted font-sans">
                            Wrong email?{" "}
                            <button
                                onClick={() => {
                                    clearPendingSignup();
                                    router.push("/sign_up");
                                }}
                                className="text-gold-light hover:text-gold-shimmer font-serif font-semibold transition-colors"
                            >
                                Go Back
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ValidateEmail;
