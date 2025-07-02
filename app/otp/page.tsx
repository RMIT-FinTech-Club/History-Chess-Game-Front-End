"use client"
import styles from "@/css/otp.module.css"
import { useRef, useState, useEffect } from "react"

export default function Otp() {
    const inputsRef = useRef<Array<HTMLInputElement | null>>([])
    const [otp, setOtp] = useState<string[]>(Array(6).fill(""))
    const [timer, setTimer] = useState(60)

    // Countdown timer, decrease by 1 every second
    useEffect(() => {
        if (timer <= 0) return
        const interval = setInterval(() => {
            setTimer((prev) => prev - 1)
        }, 1000)
        return () => clearInterval(interval)
    }, [timer])

    // Handle single digit input change
    const handleChange = (value: string, index: number) => {
        if (!/^\d?$/.test(value)) return

        const newOtp = [...otp]
        newOtp[index] = value
        setOtp(newOtp)

        // Move to next input if value is entered
        if (value && index < 5) {
            inputsRef.current[index + 1]?.focus()
        }

        // If all digits are filled, auto-submit
        if (newOtp.every((digit) => digit !== "")) {
            onSubmit(newOtp.join(""))
        }
    }

    // Handle backspace, arrow key navigation
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        const key = e.key

        if (key === "Backspace") {
            if (otp[index]) {
                const newOtp = [...otp]
                newOtp[index] = ""
                setOtp(newOtp)
            } else if (index > 0) {
                const newOtp = [...otp]
                newOtp[index - 1] = ""
                setOtp(newOtp)
                inputsRef.current[index - 1]?.focus()
            }
        } else if (key === "ArrowLeft" && index > 0) {
            inputsRef.current[index - 1]?.focus()
        } else if (key === "ArrowRight" && index < 5) {
            inputsRef.current[index + 1]?.focus()
        }
    }

    // Handle paste (e.g. "123456")
    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault()
        const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
        if (pasteData.length === 0) return

        const newOtp = [...otp]
        for (let i = 0; i < pasteData.length; i++) {
            newOtp[i] = pasteData[i]
        }

        setOtp(newOtp)
        const nextIndex = pasteData.length >= 6 ? 5 : pasteData.length
        inputsRef.current[nextIndex]?.focus()

        if (pasteData.length === 6) {
            onSubmit(pasteData)
        }
    }

    // OTP submission logic
    const onSubmit = (code: string) => {
        console.log("OTP submitted:", code)
    }

    // Manual submit button
    const handleSubmitClick = () => {
        if (otp.every((digit) => digit !== "")) {
            onSubmit(otp.join(""))
        } else {
            alert("Please enter the full 6-digit OTP.")
        }
    }

    // Resend OTP logic
    const handleResend = () => {
        console.log("OTP resent")
        setOtp(Array(6).fill(""))
        setTimer(60)
        inputsRef.current[0]?.focus()
    }

    // Auto-focus the first input on mount
    useEffect(() => {
        inputsRef.current[0]?.focus()
    }, [])

    // Format timer display (e.g. "0:45")
    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m}:${s.toString().padStart(2, "0")}`
    }

    return (
        <div className="flex flex-col justify-center md:justify-around items-center h-[calc(100dvh-var(--navbar-height))]">
            {/* Logo section with background blur */}
            <div className="flex justify-center items-center relative h-[30vh] aspect-square">
                <div
                    className="w-full h-full bg-[#DCB410] rounded-full absolute left-0 top-0"
                    style={{ filter: 'blur(15vh)' }}
                ></div>
                <div className={`z-10 bg-contain bg-no-repeat bg-center h-[30vh] aspect-square ${styles.logo}`}></div>
            </div>

            {/* OTP input boxes */}
            <div className="h-[14vw] md:h-[15vh] flex gap-[1vw] my-[3vh] md:my-0">
                {otp.map((digit, index) => (
                    <input
                        key={index}
                        ref={(el) => {
                            inputsRef.current[index] = el
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        className={`
                            h-full w-[14vw] md:w-[15vh] rounded-lg text-center text-white text-[6vw] md:text-[6vh]
                            border-[0.2vw] border-[#27272A] bg-[#000] focus:border-yellow-400 outline-none
                        `}
                        value={digit}
                        onPaste={handlePaste}
                        onChange={(e) => handleChange(e.target.value, index)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                    />
                ))}
            </div>

            {/* Timer and instructions */}
            <p className="text-white text-[3vw] text-center md:text-[2vw] my-[3vh] md:my-0">
                Enter the OTP sent via email. (Expires in{" "}
                <span className="text-[#E9B654]">{formatTime(timer)}</span>)
            </p>

            {/* Submit and Resend buttons */}
            <div className="min-w-[50vw] md:min-w-[30vw] flex flex-col text-[3vw] text-center md:text-[2vw]">
                <div
                    onClick={handleSubmitClick}
                    className="w-full flex justify-center items-center py-[1vh] px-[5vw] bg-[#DBBA68] font-bold cursor-pointer rounded-[1vh] hover:text-white transition-colors duration-200 mb-[3vh] md:mb-[4vh]"
                >
                    Submit
                </div>
                <div
                    onClick={handleResend}
                    className="w-full flex justify-center items-center py-[1vh] px-[5vw] bg-transparent border-[#DBBA68] font-bold cursor-pointer rounded-[1vh] text-white border-solid border-[0.1vw] hover:text-[#DBBA68] transition-colors duration-200"
                >
                    Resend OTP
                </div>
            </div>
        </div>
    )
}