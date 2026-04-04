"use client";

import * as React from "react";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa6";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const NewPassword = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, ...props }, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="relative">
      {/* Left-side Lock Icon */}
      <FaLock
        className="absolute top-1/2 left-6 md:left-4 transform -translate-y-1/2 text-[#2F2F2F] text-[4vh] cursor-pointer"
        onClick={() => document.getElementById("password-new")?.focus()}
      />

      {/* Password Input Field */}
      <Input
        id="password-new"
        type={showPassword ? "text" : "password"}
        className={cn(
          "pl-10 pr-10 bg-[#c4c4c4] text-[#000000] focus:border-[0.2rem] focus:border-[#DBB968]",
          className
        )}
        ref={ref}
        {...props}
      />

      {/* Toggle Password Visibility */}
      <button
        type="button"
        className={cn(
          "absolute top-1/2 right-6 md:right-4 transform -translate-y-1/2",
          "!bg-transparent border-none p-0",
          "!text-[#2F2F2F] text-[3vh] cursor-pointer",
          props.disabled && "opacity-50 cursor-not-allowed"
        )}
        onClick={() => setShowPassword(!showPassword)}
        disabled={props.disabled}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? (
          <FaEyeSlash aria-hidden="true" />
        ) : (
          <FaEye aria-hidden="true" />
        )}
      </button>

      {/* Hide browser's default password toggle */}
      <style>{`
        #password-new::-ms-reveal,
        #password-new::-ms-clear {
          visibility: hidden;
          pointer-events: none;
          display: none;
        }
      `}</style>
    </div>
  );
});
NewPassword.displayName = "NewPassword";

export { NewPassword };