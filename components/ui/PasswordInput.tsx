"use client";

import * as React from "react";
import { FaKey, FaEye, FaEyeSlash } from "react-icons/fa6";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const PasswordInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, ...props }, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="relative">
      {/* Left-side Key Icon */}
      <FaKey
        className="absolute top-1/2 left-6 md:left-4 transform -translate-y-1/2 text-[#2F2F2F] text-[3vh] md:text-[5vh] cursor-pointer"
        onClick={() => document.getElementById("password-input")?.focus()}
      />

      {/* Password Input Field */}
      <Input
        id="password-input"
        type={showPassword ? "text" : "password"}
        className={cn(
          "pl-10 pr-10 bg-[#C4C4C4] border-gray-600 text-[#000000] focus:border-[0.2rem] focus:border-[#DBB968]",
          className
        )}
        ref={ref}
        {...props}
      />

      {/* Toggle Password Visibility */}
      <button
        type="button"
        className="absolute top-1/2 right-6 md:right-4 transform -translate-y-1/2 !bg-transparent border-none p-0 cursor-pointer"
        onClick={() => setShowPassword(!showPassword)}
        disabled={props.disabled}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          <FaEyeSlash className="text-[#2F2F2F] text-[2vh] md:text-[3vh]" aria-hidden="true" />
        ) : (
          <FaEye className="text-[#2F2F2F] text-[2vh] md:text-[3vh]" aria-hidden="true" />
        )}
      </button>

      {/* Hide browser's default password toggle */}
      <style>{`
        #password-input::-ms-reveal,
        #password-input::-ms-clear {
          visibility: hidden;
          pointer-events: none;
          display: none;
        }
      `}</style>
    </div>
  );
});
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };